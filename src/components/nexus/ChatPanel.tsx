import { useEffect, useRef, useState } from "react";
import { SendHorizonal, Trash2, Bot, User, AlertTriangle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { SUGGESTED_PROMPTS, type ChatMessage } from "@/lib/nexus/mock-chat";
import { chatReply } from "@/lib/nexus/ai.functions";

const CHARS_PER_SECOND = 220;

const INITIAL: ChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "Nexus online. Ask me anything — I read what you actually write, so give me as much detail as you like.",
  },
];

export function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState<string | null>(null);
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const timeouts = timers.current;
    return () => timeouts.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming, thinking]);

  const typeOut = (reply: string) => {
    setStreaming("");
    let index = 0;
    const chunk = Math.max(1, Math.round(CHARS_PER_SECOND / 30));
    const step = () => {
      index += chunk;
      setStreaming(reply.slice(0, index));
      if (index < reply.length) {
        timers.current.push(setTimeout(step, 1000 / 30));
      } else {
        setStreaming(null);
        setMessages((prev) => [
          ...prev,
          { id: `a-${Date.now()}`, role: "assistant", content: reply },
        ]);
      }
    };
    step();
  };

  const send = async () => {
    const value = input.trim();
    if (!value || thinking || streaming !== null) return;

    const userMessage: ChatMessage = { id: `u-${Date.now()}`, role: "user", content: value };
    const nextHistory = [...messages, userMessage];
    setMessages(nextHistory);
    setInput("");
    setError(null);
    setThinking(true);

    try {
      const result = await chatReply({
        data: {
          messages: nextHistory
            .filter((m) => m.id !== "welcome")
            .map(({ role, content }) => ({ role, content })),
        },
      });
      setThinking(false);
      typeOut(result.content || "I didn't get a response that time — try again.");
    } catch (err) {
      setThinking(false);
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setStreaming(null);
    setThinking(false);
    setError(null);
    setMessages(INITIAL);
  };

  const busy = thinking || streaming !== null;

  return (
    <div className="panel flex h-[calc(100vh-13rem)] min-h-[520px] flex-col">
      <header className="flex items-center gap-3 border-b border-border px-6 py-4">
        <div>
          <h1 className="text-lg">AI Chat</h1>
          <p className="text-[13px] text-muted-foreground">
            Live AI — it reads and reasons over whatever you send.
          </p>
        </div>
        <button
          type="button"
          onClick={clear}
          className="press ml-auto inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-[13px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Trash2 className="size-4" aria-hidden="true" />
          Clear conversation
        </button>
      </header>

      <div ref={scrollRef} className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
        {messages.map((message) => (
          <Bubble key={message.id} role={message.role} content={message.content} />
        ))}

        {thinking && (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="animate-dash-spin inline-block size-4 rounded-full border border-dashed border-primary" />
            Thinking it through
          </div>
        )}

        {streaming !== null && <Bubble role="assistant" content={streaming} caret />}

        {error && (
          <p className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-[13px] text-destructive">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}
      </div>

      {messages.length <= 1 && !busy && (
        <div className="flex flex-wrap gap-2 border-t border-border px-6 py-3">
          {SUGGESTED_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => setInput(prompt)}
              className="press rounded-md border border-border bg-card px-3 py-1.5 text-[13px] text-muted-foreground hover:border-primary hover:text-primary"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      <div className="border-t border-border p-4">
        <div className="flex items-end gap-3">
          <label htmlFor="nexus-chat-input" className="sr-only">
            Message
          </label>
          <textarea
            id="nexus-chat-input"
            rows={2}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void send();
              }
            }}
            placeholder="Ask anything — Enter to send, Shift+Enter for a new line"
            className="min-h-[56px] flex-1 resize-none rounded-md border border-input bg-card px-3 py-2.5 text-[15px] text-foreground placeholder:text-muted-foreground/70"
          />
          <button
            type="button"
            onClick={() => void send()}
            disabled={busy || !input.trim()}
            className="press inline-flex h-[56px] items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            <SendHorizonal className="size-4" aria-hidden="true" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

function Bubble({
  role,
  content,
  caret,
}: {
  role: "user" | "assistant";
  content: string;
  caret?: boolean;
}) {
  const isUser = role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <span
        aria-hidden="true"
        className={`mt-1 grid size-8 shrink-0 place-items-center rounded-md border ${
          isUser
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-accent text-primary"
        }`}
      >
        {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
      </span>
      <div
        aria-live={caret ? "polite" : undefined}
        className={`max-w-[min(46rem,85%)] rounded-md px-4 py-3 text-[15px] leading-relaxed ${
          isUser
            ? "whitespace-pre-wrap bg-primary text-primary-foreground"
            : "border border-border bg-card text-foreground"
        }`}
      >
        {isUser ? content : <Markdown content={content} />}
        {caret && (
          <span className="animate-caret ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[3px] bg-primary" />
        )}
      </div>
    </div>
  );
}

export function Markdown({ content }: { content: string }) {
  return (
    <div className="space-y-3 [&_a]:text-primary [&_a]:underline [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[13px] [&_h1]:text-lg [&_h2]:text-base [&_h3]:text-[15px] [&_li]:leading-relaxed [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-5 [&_p]:leading-relaxed [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
