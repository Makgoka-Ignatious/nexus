import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { ResearchResult } from "./mock-research";
import type { EmailTone } from "./mock-email";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash";

type Part = Record<string, unknown>;
type Msg = {
  role: "system" | "user" | "assistant";
  content: string | Part[];
};

async function complete(messages: Msg[], jsonMode = false): Promise<string> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI is not configured for this project.");

  const response = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (response.status === 429)
    throw new Error("Rate limit reached — please try again in a moment.");
  if (response.status === 402)
    throw new Error("AI credits exhausted. Add credits to continue.");
  if (!response.ok)
    throw new Error(`AI request failed (${response.status}).`);

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return data.choices?.[0]?.message?.content?.trim() ?? "";
}

function parseJson<T>(raw: string): T {
  const cleaned = raw
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  return JSON.parse(
    start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned,
  ) as T;
}

/* ---------------------------------- chat ---------------------------------- */

const chatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(8000),
      }),
    )
    .min(1)
    .max(40),
});

export const chatReply = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => chatSchema.parse(data))
  .handler(async ({ data }) => {
    const content = await complete([
      {
        role: "system",
        content:
          "You are Nexus, an AI workplace productivity assistant inside a hub that also offers a Research Assistant and a Smart Email Generator. Understand the user's actual input and answer it substantively and specifically — never with canned boilerplate. Be concise but complete, use short paragraphs and markdown lists where they help readability, and reference earlier turns when relevant. Only mention the other Nexus tools when they are genuinely the right next step.",
      },
      ...(data.messages as Msg[]),
    ]);
    return { content };
  });

/* -------------------------------- research -------------------------------- */

const researchSchema = z.object({ input: z.string().min(1).max(20000) });

export const analyzeResearch = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => researchSchema.parse(data))
  .handler(async ({ data }): Promise<ResearchResult> => {
    const raw = await complete(
      [
        {
          role: "system",
          content:
            'You are a rigorous research analyst. Read the user material (a topic, question, notes or a full article) and produce genuine analysis grounded in what was actually provided. Respond ONLY with JSON of shape {"topic": string, "summary": string, "insights": string[], "recommendations": string[]}. "topic" is a short title (max 10 words). "summary" is 2-3 substantial paragraphs separated by \\n\\n. "insights" has 3-5 specific, non-obvious observations. "recommendations" has 3-5 concrete, actionable next steps. No markdown fences.',
        },
        { role: "user", content: data.input },
      ],
      true,
    );

    const parsed = parseJson<Partial<ResearchResult>>(raw);
    return {
      topic: parsed.topic?.trim() || "Analysis",
      summary: parsed.summary?.trim() || "",
      insights: (parsed.insights ?? []).filter(Boolean),
      recommendations: (parsed.recommendations ?? []).filter(Boolean),
    };
  });

/* ---------------------------------- email --------------------------------- */

const emailSchema = z.object({
  to: z.string().max(200).optional().default(""),
  recipient: z.string().max(200).optional().default(""),
  subject: z.string().max(300).optional().default(""),
  context: z.string().min(1).max(10000),
  tone: z.enum(["formal", "friendly", "persuasive"]),
});

const TONE_GUIDE: Record<EmailTone, string> = {
  formal:
    "Measured, structured, corporate register. Full sentences, no contractions, courteous close.",
  friendly:
    "Warm and conversational. Short sentences, contractions, light and human but still professional.",
  persuasive:
    "Outcome-first. Lead with the benefit, build a tight case, close with one direct ask and a deadline.",
};

export const draftEmail = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => emailSchema.parse(data))
  .handler(async ({ data }) => {
    const details = [
      data.to && `Recipient email: ${data.to}`,
      data.recipient && `Recipient name/role: ${data.recipient}`,
      data.subject
        ? `Subject (use this exactly): ${data.subject}`
        : "Subject: not provided — write a strong, specific one.",
      `Tone: ${data.tone} — ${TONE_GUIDE[data.tone as EmailTone]}`,
      `Context and key points:\n${data.context}`,
    ]
      .filter(Boolean)
      .join("\n");

    const raw = await complete(
      [
        {
          role: "system",
          content:
            'You are an expert business email writer. Read the brief and write a real email that addresses its specific content — never a generic template. Address the recipient by name or role when known, otherwise use a neutral greeting. Sign off with "[Your name]". Respond ONLY with JSON of shape {"subject": string, "body": string}, where body uses \\n for line breaks. No markdown fences.',
        },
        { role: "user", content: details },
      ],
      true,
    );

    const parsed = parseJson<{ subject?: string; body?: string }>(raw);
    return {
      subject: (data.subject || parsed.subject || "").trim(),
      body: (parsed.body ?? "").trim(),
    };
  });
