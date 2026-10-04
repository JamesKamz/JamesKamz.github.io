"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bot, Loader2, MessageCircle, SendHorizonal, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Fragment, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };
const MAX = 500;
const STORAGE_KEY = "jk-chat";

/** Renders [label](url) links and **bold** — nothing else, no HTML injection. */
function RichText({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\]\([^)\s]+\)|\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        const link = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
        if (link) {
          const href = link[2]!;
          const safe = href.startsWith("/") || href.startsWith("https://") || href.startsWith("mailto:");
          if (!safe) return <Fragment key={i}>{link[1]}</Fragment>;
          const external = href.startsWith("http");
          return (
            <a key={i} href={href} className="font-medium text-accent underline underline-offset-2" {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
              {link[1]}
            </a>
          );
        }
        const bold = part.match(/^\*\*([^*]+)\*\*$/);
        if (bold) return <strong key={i}>{bold[1]}</strong>;
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}

function loadState(): { id?: string; messages: Msg[] } {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as { id?: string; messages: Msg[] };
  } catch {
    /* storage unavailable */
  }
  return { messages: [] };
}

export function ChatWidget() {
  const t = useTranslations("chat");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const restored = useRef(false);

  // Restore the session conversation the first time the panel opens.
  useEffect(() => {
    if (!open || restored.current) return;
    restored.current = true;
    const saved = loadState();
    // Hydrating from sessionStorage (external store) once, on first open.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved.messages.length) setMessages(saved.messages);
    if (saved.id) setConversationId(saved.id);
  }, [open]);

  useEffect(() => {
    if (!restored.current) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ id: conversationId, messages: messages.slice(-30) }));
    } catch {
      /* storage unavailable */
    }
  }, [messages, conversationId]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || loading) return;
    if (content.length > MAX) return setError(t("tooLong"));
    setError(null);
    setInput("");
    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages(next);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, locale, conversationId }),
      });
      if (!res.ok || !res.body) {
        setError(res.status === 429 ? t("rateLimited") : res.status === 413 ? t("tooLong") : t("error"));
        return;
      }
      const id = res.headers.get("X-Conversation-Id");
      if (id) setConversationId(id);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let answer = "";
      setMessages((m) => [...m, { role: "assistant", content: "" }]);
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        answer += decoder.decode(value, { stream: true });
        setMessages((m) => [...m.slice(0, -1), { role: "assistant", content: answer }]);
      }
      if (!answer.trim()) {
        setMessages((m) => m.slice(0, -1));
        setError(t("error"));
      }
    } catch {
      setError(t("error"));
    } finally {
      setLoading(false);
    }
  };

  const suggestions = t.raw("suggestions") as string[];

  return (
    <>
      <AnimatePresence>
        {open ? (
          <motion.div
            role="dialog"
            aria-modal="false"
            aria-label={t("title")}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="card fixed inset-x-3 bottom-20 z-[65] flex max-h-[min(36rem,calc(100dvh-7rem))] flex-col overflow-hidden shadow-2xl shadow-black/40 sm:inset-x-auto sm:right-5 sm:w-[24rem]"
          >
            <div className="flex items-center gap-3 border-b border-line px-4 py-3">
              <span className="grid size-9 place-items-center rounded-full bg-accent text-accent-fg">
                <Bot className="size-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{t("title")}</p>
                <p className="flex items-center gap-1.5 font-mono text-[11px] text-muted">
                  <span className="size-1.5 rounded-full bg-accent-2" aria-hidden /> {t("subtitle")}
                </p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label={t("close")} className="grid size-8 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-fg">
                <X className="size-4" aria-hidden />
              </button>
            </div>

            <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4 text-sm" aria-live="polite">
              <div className="max-w-[90%] rounded-2xl rounded-tl-sm bg-surface-2 px-3.5 py-2.5">{t("welcome")}</div>
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    "max-w-[90%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5",
                    m.role === "user" ? "ml-auto rounded-tr-sm bg-accent text-accent-fg" : "rounded-tl-sm bg-surface-2",
                  )}
                >
                  {m.role === "assistant" ? <RichText text={m.content} /> : m.content}
                  {m.role === "assistant" && !m.content && loading ? <Loader2 className="size-4 animate-spin text-muted" aria-hidden /> : null}
                </div>
              ))}
              {loading && messages[messages.length - 1]?.role === "user" ? (
                <div className="flex w-14 items-center justify-center gap-1 rounded-2xl bg-surface-2 py-3" aria-hidden>
                  {[0, 1, 2].map((d) => (
                    <span key={d} className="size-1.5 animate-bounce rounded-full bg-muted" style={{ animationDelay: `${d * 120}ms` }} />
                  ))}
                </div>
              ) : null}
              {!messages.length ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  {suggestions.map((s) => (
                    <button key={s} type="button" onClick={() => send(s)} className="rounded-full border border-line px-3 py-1.5 text-xs text-fg-soft transition hover:border-accent hover:text-accent">
                      {s}
                    </button>
                  ))}
                </div>
              ) : null}
              {error ? <p role="alert" className="text-xs text-danger">{error}</p> : null}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void send(input);
              }}
              className="border-t border-line p-3"
            >
              <div className="flex items-end gap-2">
                <label htmlFor="chat-input" className="sr-only">{t("placeholder")}</label>
                <textarea
                  ref={inputRef}
                  id="chat-input"
                  rows={1}
                  value={input}
                  maxLength={MAX}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void send(input);
                    }
                  }}
                  placeholder={t("placeholder")}
                  className="input max-h-32 min-h-[44px] resize-none py-2.5"
                />
                <button type="submit" disabled={loading || !input.trim()} aria-label={t("send")} className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent text-accent-fg transition disabled:opacity-40">
                  {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <SendHorizonal className="size-4" aria-hidden />}
                </button>
              </div>
              <p className="mt-1.5 flex justify-between font-mono text-[10px] text-muted">
                <span>{t("disclaimer")}</span>
                <span className={cn(input.length > MAX * 0.9 && "text-danger")}>{input.length}/{MAX}</span>
              </p>
            </form>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? t("close") : t("open")}
        className="fixed bottom-4 right-4 z-[65] grid size-14 place-items-center rounded-full bg-accent text-accent-fg shadow-lg shadow-black/30 transition hover:scale-105 sm:right-5"
      >
        <span className="absolute inset-0 animate-ping rounded-full bg-accent opacity-20 [animation-iteration-count:3] motion-reduce:hidden" aria-hidden />
        {open ? <X className="relative size-6" aria-hidden /> : <MessageCircle className="relative size-6" aria-hidden />}
      </button>
    </>
  );
}
