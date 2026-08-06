export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
}

const has = (text: string, ...terms: string[]) =>
  terms.some((term) => text.includes(term));

/**
 * Fully local mock reply engine. It looks at the newest user turn AND the
 * prior conversation so replies can reference what was said earlier.
 */
export function generateChatReply(input: string, history: ChatMessage[]): string {
  const text = input.toLowerCase().trim();
  const userTurns = history.filter((m) => m.role === "user");
  const priorTurns = userTurns.slice(0, -1);
  const lastTopic = priorTurns.at(-1)?.content.trim();
  const callback = lastTopic
    ? `Building on what you asked earlier ("${truncate(lastTopic, 48)}"), `
    : "";

  if (has(text, "what is nexus", "what's nexus", "about nexus", "who are you")) {
    return `Nexus is an AI workplace productivity hub built around one idea: command your communication infrastructure from a single grid.

It bundles three tools — this Chat assistant, a Research Assistant that turns raw material into structured summaries and insights, and a Smart Email Generator that drafts tone-controlled messages. Everything runs locally in your browser session: no account, no database, nothing persisted after you close the tab.`;
  }

  if (has(text, "what can you do", "capabilit", "features", "help me with", "how do you work")) {
    return `${callback}here is what I can do inside Nexus:

1. Talk through ideas, drafts and decisions in this chat.
2. Hand off long material to the Research Assistant for a summary, key insights and recommendations.
3. Spin up a first-pass email in the Email Generator with a Formal, Friendly or Persuasive tone.

Tell me which of those you want to start with and I'll point you at the right panel.`;
  }

  if (has(text, "research", "summar", "article", "paper", "report", "insight")) {
    return `${callback}research is the Research Assistant's job. Paste a topic or the full article into the left panel and hit "Generate Summary & Insights".

You'll get back three blocks: a two-to-three paragraph summary, three to five key insights, and a short list of recommendations. Every block is inline-editable afterwards, so you can tighten the language before you pass it on to anyone else.`;
  }

  if (has(text, "email", "mail", "draft", "write to", "message to", "follow up", "follow-up")) {
    return `${callback}head to the Smart Email Generator. Give it a recipient, a few key points, and pick a tone.

Formal produces a measured, structured note. Friendly loosens the register and shortens the sentences. Persuasive leads with the outcome and closes with a direct ask. Generate once, then click Edit to make it yours — nothing is ever actually sent.`;
  }

  if (has(text, "data", "privacy", "secure", "store", "storage", "gdpr")) {
    return `Nothing you type here leaves the browser. Nexus makes no network calls for AI output — every response, summary and email is produced by local mock logic and held in React state for the session only.

Refresh the page and the slate is wiped: no accounts, no database, no analytics on your content. That said, everything labelled AI-generated should still be reviewed before you act on it.`;
  }

  if (has(text, "hello", "hi ", "hey", "good morning", "good afternoon") || text === "hi") {
    return priorTurns.length
      ? `Welcome back — we've exchanged ${priorTurns.length + 1} messages so far. Where do you want to pick up: chat, research, or an email draft?`
      : `Hello. I'm the Nexus assistant. Ask me about the hub itself, or tell me what you're working on and I'll route you to the right tool — Chat, Research, or Email.`;
  }

  if (has(text, "thank", "thanks", "cheers", "appreciate")) {
    return `Any time. If you want to keep going, the Research Assistant and Email Generator are one click away in the sidebar.`;
  }

  if (text.endsWith("?")) {
    return `${callback}here's how I'd approach "${truncate(input.trim(), 60)}".

Break it into the smallest decision you can actually make today, note what evidence you're missing, and name who has to agree. If it needs source material digested first, run it through the Research Assistant; if it needs to travel to someone, the Email Generator will draft it in the tone you pick.

Want me to sketch out the specific steps?`;
  }

  return `${callback}noted: "${truncate(input.trim(), 70)}".

Here's my read — that's a workstream with a clear owner and an unclear deadline, which is usually where things stall. I'd lock the deadline first, then work backwards.

I can keep thinking this through with you, or you can send the raw material to the Research Assistant for a structured breakdown.`;
}

function truncate(value: string, max: number) {
  const single = value.replace(/\s+/g, " ");
  return single.length > max ? `${single.slice(0, max - 1)}…` : single;
}

export const SUGGESTED_PROMPTS = [
  "What is Nexus?",
  "What can you do?",
  "Help me summarise an article",
  "Draft a follow-up email",
];
