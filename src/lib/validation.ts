import { z } from "zod";
import { estimateInputSchema } from "./budget";

/**
 * Shared Zod schemas (client forms + server routes).
 * Error messages are translation keys under `validation.*`.
 */
const phoneRegex = /^[+\d(][\d\s().-]{5,24}$/;

export const localeSchema = z.enum(["fr", "en"]).default("fr");

/** Honeypot: must stay empty (hidden field bots tend to fill). */
export const honeypot = z.string().max(0).optional().or(z.literal(""));

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, { message: "tooLong" })
    .optional()
    .transform((v) => (v ? v : undefined));

export const contactSchema = z.object({
  name: z.string().trim().min(2, { message: "name" }).max(100, { message: "tooLong" }),
  email: z.string().trim().toLowerCase().email({ message: "email" }).max(200, { message: "tooLong" }),
  phone: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || phoneRegex.test(v), { message: "phone" })
    .transform((v) => (v ? v : undefined)),
  subject: z.string().trim().min(3, { message: "subject" }).max(150, { message: "tooLong" }),
  message: z.string().trim().min(10, { message: "message" }).max(5000, { message: "tooLong" }),
  budget: optionalText(100),
  website: honeypot,
  locale: localeSchema,
});

export type ContactInput = z.input<typeof contactSchema>;

export const leadSchema = estimateInputSchema.extend({
  name: z.string().trim().min(2, { message: "name" }).max(100, { message: "tooLong" }),
  email: z.string().trim().toLowerCase().email({ message: "email" }).max(200, { message: "tooLong" }),
  phone: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || phoneRegex.test(v), { message: "phone" })
    .transform((v) => (v ? v : undefined)),
  company: optionalText(120),
  message: optionalText(3000),
  website: honeypot,
  locale: localeSchema,
});

export type LeadInput = z.input<typeof leadSchema>;

export const chatRequestSchema = z.object({
  conversationId: z.string().cuid().optional(),
  locale: localeSchema,
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(4000),
      }),
    )
    .min(1)
    .max(40),
});

export const CHAT_MAX_USER_CHARS = 500;
