export type EmailTone = "formal" | "friendly" | "persuasive";

export const TONES: { value: EmailTone; label: string; hint: string }[] = [
  { value: "formal", label: "Formal", hint: "Measured, structured, corporate register" },
  { value: "friendly", label: "Friendly", hint: "Warm, short sentences, conversational" },
  { value: "persuasive", label: "Persuasive", hint: "Outcome-first with a direct ask" },
];

function recipientName(to: string) {
  const local = to.split("@")[0] ?? "";
  const first = local.split(/[._-]/)[0];
  if (!first) return "there";
  return first.charAt(0).toUpperCase() + first.slice(1);
}

function points(context: string): string[] {
  return context
    .split(/\n|(?<=\.)\s+|;/)
    .map((line) => line.replace(/^[-*•\d.)\s]+/, "").trim())
    .filter((line) => line.length > 2)
    .slice(0, 5);
}

/** Suggests a subject line from the context — editable by the user afterwards. */
export function suggestSubject(context: string, tone: EmailTone): string {
  const [first = ""] = points(context);
  const core = first
    .replace(/\s+/g, " ")
    .replace(/[.?!]+$/, "")
    .split(" ")
    .slice(0, 8)
    .join(" ");
  if (!core) return "";
  const capped = core.charAt(0).toUpperCase() + core.slice(1);
  if (tone === "friendly") return `Quick one: ${capped.toLowerCase()}`;
  if (tone === "persuasive") return `${capped} — and what it unlocks`;
  return `Regarding: ${capped}`;
}

export function generateEmail(args: {
  to: string;
  subject: string;
  context: string;
  tone: EmailTone;
}): string {
  const name = recipientName(args.to);
  const list = points(args.context);
  const topic = (list[0] ?? args.subject ?? "the item below").replace(/[.?!]+$/, "");
  const rest = list.slice(1);

  if (args.tone === "friendly") {
    return [
      `Hi ${name},`,
      ``,
      `Hope your week's going well. Wanted to drop you a quick note about ${lower(topic)}.`,
      ``,
      rest.length
        ? `Here's where things stand:\n\n${rest.map((p) => `• ${sentence(p)}`).join("\n")}`
        : `Nothing complicated on my side — just wanted to make sure it was on your radar.`,
      ``,
      `No rush at all, but if you can take a look this week that'd be great. Happy to jump on a quick call if it's easier than email.`,
      ``,
      `Thanks!`,
      ``,
      `Best,`,
      `[Your name]`,
    ].join("\n");
  }

  if (args.tone === "persuasive") {
    return [
      `Hi ${name},`,
      ``,
      `Short version: moving on ${lower(topic)} now is the difference between shaping the outcome and reacting to it later.`,
      ``,
      rest.length
        ? `Three things worth your attention:\n\n${rest
            .map((p, i) => `${i + 1}. ${sentence(p)}`)
            .join("\n")}`
        : `The case is straightforward — the cost of waiting is higher than the cost of acting, and the work needed to start is small.`,
      ``,
      `Every cycle we wait, the effort to catch up grows and the options narrow. Acting this month keeps the decision cheap and reversible.`,
      ``,
      `Can you give me a yes or no by Friday? If yes, I'll have the first step running inside a week.`,
      ``,
      `Best regards,`,
      `[Your name]`,
    ].join("\n");
  }

  return [
    `Dear ${name},`,
    ``,
    `I am writing in relation to ${lower(topic)}.`,
    ``,
    rest.length
      ? `Please find the key points set out below:\n\n${rest
          .map((p, i) => `${i + 1}. ${sentence(p)}`)
          .join("\n")}`
      : `The matter is straightforward, and I have set out the relevant details for your consideration.`,
    ``,
    `I would be grateful for your review and any comments you may have. Should further detail be required, I would be happy to provide it or to arrange a meeting at your convenience.`,
    ``,
    `Thank you for your time and consideration.`,
    ``,
    `Kind regards,`,
    `[Your name]`,
  ].join("\n");
}

function lower(value: string) {
  const trimmed = value.trim();
  return trimmed.charAt(0).toLowerCase() + trimmed.slice(1);
}

function sentence(value: string) {
  const trimmed = value.trim();
  const capped = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  return /[.?!]$/.test(capped) ? capped : `${capped}.`;
}
