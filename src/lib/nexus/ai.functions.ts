import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { ResearchResult } from "./mock-research";
import type { EmailTone } from "./mock-email";
import { DEFAULT_MODEL, MODEL_IDS } from "./models";

const CHAT_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const RESPONSES_URL = "https://ai.gateway.lovable.dev/v1/responses";

const modelField = z
  .string()
  .optional()
  .default(DEFAULT_MODEL)
  .transform((value) => (MODEL_IDS.includes(value) ? value : DEFAULT_MODEL));

type Part = Record<string, unknown>;
type Msg = {
  role: "system" | "user" | "assistant";
  content: string | Part[];
};

function apiKey() {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI is not configured for this project.");
  return key;
}

function statusError(status: number) {
  if (status === 429) return new Error("Rate limit reached - please try again in a moment.");
  if (status === 402) return new Error("AI credits exhausted. Add credits to continue.");
  return new Error(`AI request failed (${status}).`);
}

/** OpenAI models go through the streaming Responses API; everything else via chat completions. */
async function complete(messages: Msg[], jsonMode = false, model = DEFAULT_MODEL) {
  return model.startsWith("openai/")
    ? completeResponses(messages, model)
    : completeChat(messages, jsonMode, model);
}

async function completeChat(messages: Msg[], jsonMode: boolean, model: string) {
  const response = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!response.ok) throw statusError(response.status);

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return data.choices?.[0]?.message?.content?.trim() ?? "";
}

function toResponsesInput(messages: Msg[]) {
  return messages.map((message) => {
    const role = message.role === "system" ? "developer" : message.role;
    const content =
      typeof message.content === "string"
        ? [{ type: "input_text", text: message.content }]
        : message.content.map((part) => {
            if (part["type"] === "file") {
              const file = part["file"] as { filename?: string; file_data?: string };
              return {
                type: "input_file",
                filename: file.filename,
                file_data: file.file_data,
              };
            }
            return { type: "input_text", text: String(part["text"] ?? "") };
          });
    return { role, content };
  });
}

async function completeResponses(messages: Msg[], model: string) {
  const response = await fetch(RESPONSES_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey(),
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model,
      input: toResponsesInput(messages),
      stream: true,
      store: false,
      reasoning: { effort: "low", summary: "auto" },
    }),
  });

  if (!response.ok || !response.body) throw statusError(response.status);

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const event = JSON.parse(payload) as {
          type?: string;
          delta?: string;
          response?: { output_text?: string };
        };
        if (event.type === "response.output_text.delta" && typeof event.delta === "string") {
          text += event.delta;
        } else if (event.type === "response.completed" && !text) {
          text = event.response?.output_text ?? "";
        }
      } catch {
        /* ignore keep-alive / partial frames */
      }
    }
  }

  return text.trim();
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
  model: modelField,
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
    const content = await complete(
      [
        {
          role: "system",
          content:
            "You are Nexus, an AI workplace productivity assistant inside a hub that also offers a Research Assistant and a Smart Email Generator. Understand the user's actual input and answer it substantively and specifically - never with canned boilerplate. Be concise but complete, use short paragraphs and markdown lists where they help readability, and reference earlier turns when relevant. Only mention the other Nexus tools when they are genuinely the right next step. Never use em dashes or en dashes in your output; use commas, colons or simple hyphens instead.",
        },
        ...(data.messages as Msg[]),
      ],
      false,
      data.model,
    );
    return { content };
  });

/* -------------------------------- research -------------------------------- */

const researchSchema = z.object({
  model: modelField,
  input: z.string().max(20000).optional().default(""),
  url: z.string().max(2000).optional().default(""),
  file: z
    .object({
      name: z.string().max(300),
      mimeType: z.string().max(120),
      dataUrl: z.string().max(14_000_000),
    })
    .optional(),
});

const RESEARCH_SYSTEM =
  'You are a rigorous research analyst. Read the user material (a topic, question, notes, a web page, a YouTube video transcript or an attached PDF) and produce genuine analysis grounded in what was actually provided. Respond ONLY with JSON of shape {"topic": string, "summary": string, "insights": string[], "recommendations": string[]}. "topic" is a short title (max 10 words). "summary" is 2-3 substantial paragraphs separated by \\n\\n. "insights" has 3-5 specific, non-obvious observations. "recommendations" has 3-5 concrete, actionable next steps. No markdown fences. Never use em dashes or en dashes in your output; use commas, colons or simple hyphens instead.';

export const analyzeResearch = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => researchSchema.parse(data))
  .handler(async ({ data }): Promise<ResearchResult> => {
    const parts: Part[] = [];
    let source = "";

    if (data.file) {
      if (!data.file.dataUrl.startsWith("data:") || data.file.dataUrl.length < 100)
        throw new Error("That file could not be read. Try re-uploading it.");
      parts.push({
        type: "file",
        file: { filename: data.file.name, file_data: data.file.dataUrl },
      });
      source = `PDF: ${data.file.name}`;
    }

    if (data.url.trim()) {
      const { fetchSourceText } = await import("./extract.server");
      const page = await fetchSourceText(data.url.trim());
      parts.push({
        type: "text",
        text: `${page.kind === "youtube" ? "YouTube video" : "Web page"} (${page.url})${
          page.title ? ` - "${page.title}"` : ""
        }:\n\n${page.text}`,
      });
      source = source ? `${source} + ${page.url}` : page.url;
    }

    if (data.input.trim()) {
      parts.push({ type: "text", text: data.input.trim() });
      if (!source) source = "Pasted text";
    }

    if (parts.length === 0) throw new Error("Provide a topic, a URL or a PDF.");

    parts.push({
      type: "text",
      text: "Analyse all of the material above and return the JSON object.",
    });

    const raw = await complete(
      [
        { role: "system", content: RESEARCH_SYSTEM },
        { role: "user", content: parts },
      ],
      true,
      data.model,
    );

    const parsed = parseJson<Partial<ResearchResult>>(raw);
    return {
      topic: parsed.topic?.trim() || "Analysis",
      summary: parsed.summary?.trim() || "",
      insights: (parsed.insights ?? []).filter(Boolean),
      recommendations: (parsed.recommendations ?? []).filter(Boolean),
      source,
    };
  });

/* ---------------------------------- email --------------------------------- */

const emailSchema = z.object({
  model: modelField,
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
        : "Subject: not provided - write a strong, specific one.",
      `Tone: ${data.tone} - ${TONE_GUIDE[data.tone as EmailTone]}`,
      `Context and key points:\n${data.context}`,
    ]
      .filter(Boolean)
      .join("\n");

    const raw = await complete(
      [
        {
          role: "system",
          content:
            'You are an expert business email writer. Read the brief and write a real email that addresses its specific content - never a generic template. Address the recipient by name or role when known, otherwise use a neutral greeting. Sign off with "[Your name]". Respond ONLY with JSON of shape {"subject": string, "body": string}, where body uses \\n for line breaks. No markdown fences. Never use em dashes or en dashes in your output; use commas, colons or simple hyphens instead.',
        },
        { role: "user", content: details },
      ],
      true,
      data.model,
    );

    const parsed = parseJson<{ subject?: string; body?: string }>(raw);
    return {
      subject: (data.subject || parsed.subject || "").trim(),
      body: (parsed.body ?? "").trim(),
    };
  });
