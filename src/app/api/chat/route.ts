import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api";
import { bookAppointment, bookAppointmentTool, BOOK_TOOL_NAME } from "@/lib/booking";
import { buildSystemPrompt } from "@/lib/chat-prompt";
import { getSettings } from "@/lib/content";
import { getDb } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp, hashIp, isSameOrigin } from "@/lib/request";
import { CHAT_MAX_USER_CHARS, chatRequestSchema } from "@/lib/validation";

export const maxDuration = 60;

const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-5-5";
/** Models accepting the server-side refusal fallback (`fallbacks: "default"`). */
const FALLBACK_MODELS = new Set(["claude-opus-5-5", "claude-opus-5", "claude-fable-5-1", "claude-sonnet-5-5"]);
/** Keep the request bounded: only the most recent turns are sent to the model. */
const HISTORY_LIMIT = 16;
/** Model turns per reply: answer, tool call, follow-up after the tool result. */
const MAX_TOOL_TURNS = 3;

export async function POST(request: Request) {
  if (!isSameOrigin(request.headers)) return jsonError(403, "forbidden");

  const settings = await getSettings();
  if (!settings.chatbotEnabled || !process.env.ANTHROPIC_API_KEY) return jsonError(503, "unavailable");

  const ipHash = hashIp(clientIp(request.headers));
  const [burst, daily] = await Promise.all([
    rateLimit(`chat:${ipHash}`, 15, 10 * 60_000),
    rateLimit(`chat-day:${ipHash}`, 80, 24 * 60 * 60_000),
  ]);
  if (!burst.ok || !daily.ok) return jsonError(429, "rate_limited");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "invalid_json");
  }
  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) return jsonError(422, "validation");
  const { locale, messages } = parsed.data;
  const last = messages[messages.length - 1]!;
  if (last.role !== "user") return jsonError(422, "validation");
  if (last.content.length > CHAT_MAX_USER_CHARS) return jsonError(413, "too_long");

  // Conversation must start with a user turn for the API.
  const history = messages.slice(-HISTORY_LIMIT);
  while (history.length && history[0]!.role !== "user") history.shift();

  // Persist (best effort): reuse the conversation only if it belongs to this visitor.
  const db = getDb();
  let conversationId: string | null = null;
  if (db) {
    try {
      const existing = parsed.data.conversationId
        ? await db.chatConversation.findFirst({ where: { id: parsed.data.conversationId, ipHash } })
        : null;
      conversationId = existing?.id ?? (await db.chatConversation.create({ data: { locale, ipHash } })).id;
      await db.chatMessage.create({ data: { conversationId, role: "user", content: last.content } });
    } catch (error) {
      console.error("[chat] persist user message failed:", (error as Error).message);
    }
  }

  const system = await buildSystemPrompt(locale);
  const client = new Anthropic();
  const useFallback = FALLBACK_MODELS.has(MODEL);
  const isHaiku = MODEL.includes("haiku");
  const conversation: Anthropic.Beta.BetaMessageParam[] = history.map((m) => ({ role: m.role, content: m.content }));
  // One stream per model turn; a booking adds a tool turn, so a reply needs at most a few.
  const openStream = () =>
    client.beta.messages.stream({
      model: MODEL,
      max_tokens: 4096,
      system: [
        { type: "text", text: system, cache_control: { type: "ephemeral" } },
        // After the cache breakpoint: changes every request without invalidating the cached prompt.
        { type: "text", text: `Current date and time: ${new Date().toUTCString()}.` },
      ],
      tools: [bookAppointmentTool],
      messages: conversation,
      ...(isHaiku ? {} : { output_config: { effort: "low" as const } }),
      ...(useFallback ? { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const } : {}),
    });
  let stream = openStream();

  const encoder = new TextEncoder();
  const refusal = {
    en: "Sorry, I can't help with that. Feel free to ask about James's services or to contact him directly.",
    fr: "Désolé, je ne peux pas répondre à cela. N'hésitez pas à me poser une question sur les services de James ou à le contacter directement.",
    ar: "عذرًا، لا يمكنني المساعدة في ذلك. لا تتردد في السؤال عن خدمات جيمس أو التواصل معه مباشرة.",
  }[locale];

  const body$ = new ReadableStream<Uint8Array>({
    async start(controller) {
      let answer = "";
      const write = (text: string) => {
        answer += text;
        controller.enqueue(encoder.encode(text));
      };
      try {
        for (let turn = 0; turn < MAX_TOOL_TURNS; turn++) {
          if (turn > 0) {
            if (answer && !/\s$/.test(answer)) write("\n\n");
            stream = openStream();
          }
          let final: Anthropic.Beta.BetaMessage;
          try {
            for await (const event of stream) {
              if (event.type === "content_block_delta" && event.delta.type === "text_delta") write(event.delta.text);
            }
            final = await stream.finalMessage();
          } catch (error) {
            // Eager input streaming: a tool input that is not JSON at all rejects here. Retry that turn once.
            if (error instanceof Anthropic.APIError || turn === MAX_TOOL_TURNS - 1) throw error;
            console.error("[chat] unparseable tool input, retrying the turn");
            continue;
          }

          if (final.stop_reason === "refusal") {
            if (!answer.trim()) write(refusal);
            break;
          }
          const toolUses = final.content.filter((b): b is Anthropic.Beta.BetaToolUseBlock => b.type === "tool_use");
          // Never run a tool whose input may have been cut off at max_tokens.
          if (final.stop_reason !== "tool_use" || !toolUses.length) break;

          // Pass the whole assistant turn back unchanged (thinking blocks included).
          conversation.push({ role: "assistant", content: final.content });
          const results: Anthropic.Beta.BetaToolResultBlockParam[] = [];
          for (const use of toolUses) {
            const result =
              use.name === BOOK_TOOL_NAME
                ? await bookAppointment(use.input, { locale, ipHash })
                : { content: JSON.stringify({ error: "unknown_tool" }), isError: true };
            results.push({ type: "tool_result", tool_use_id: use.id, content: result.content, is_error: result.isError });
          }
          conversation.push({ role: "user", content: results });
        }
      } catch (error) {
        if (error instanceof Anthropic.RateLimitError) console.error("[chat] Anthropic rate limit");
        else if (error instanceof Anthropic.APIError) console.error(`[chat] Anthropic API error ${error.status}:`, error.message);
        else console.error("[chat] stream error:", error);
        if (!answer) controller.error(error);
      } finally {
        if (db && conversationId && answer) {
          await db.chatMessage
            .create({ data: { conversationId, role: "assistant", content: answer } })
            .catch((e: Error) => console.error("[chat] persist answer failed:", e.message));
        }
        try {
          controller.close();
        } catch {
          /* already errored */
        }
      }
    },
    cancel() {
      stream.abort();
    },
  });

  return new NextResponse(body$, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Conversation-Id": conversationId ?? "",
    },
  });
}
