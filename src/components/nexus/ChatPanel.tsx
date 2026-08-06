import { useEffect, useRef, useState } from "react";
import { SendHorizonal, Trash2, Bot, User } from "lucide-react";
import {
  generateChatReply,
  SUGGESTED_PROMPTS,
  type ChatMessage,
} from "@/lib/nexus/mock-chat";

const CHARS_PER_SECOND = 30;

const INITIAL: ChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "Nexus online. Ask me about the hub, or tell me what you're working on and I'll route you to the right tool.",
  },
];

export function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState<string | null>(null);
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const timeouts = timers.current;
    return () => timeouts.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming, thinking]);

  const send = () => {
    const value = input.trim();
    if (!value || thinking || streaming !== null) return;

    const userMessage: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: value,
    };
    const nextHistory = [...messages, userMessage];
    setMessages(nextHistory);
    setInput("");
    setThinking(true);

    const reply = generateChatReply(value, nextHistory);

    timers.current.push(
      setTimeout(() => {
        setThinking(false);
        setStreaming("");
        let index = 0;
        const step = () => {
          index += 1;
          setStreaming(reply.slice(0, index));
          if (index < reply.length) {
            timers.current.push(setTimeout(step, 1000 / CHARS_PER_SECOND));
          } else {
            setStreaming(null);
            setMessages((prev) => [
              ...prev,
              { id: `a-${Date.now()}`, role: "assistant", content: reply },
            ]);
          }
        };
        step();
      }, 550),
    );
  };

  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setStreaming(null);
    setThinking(false);
    setMessages(INITIAL);
  };

  const busy = thinking || streaming !== null;

  return (
    <div className="panel flex h-[calc(100vh-13rem)] min-h-[520px] flex-col">
      <header className="flex items-center gap-3 border-b border-border px-6 py-4">
        <div>
          <h1 className="text-lg">AI Chat</h1>
          <p className="text-[13px] text-muted-foreground">
            Simulated assistant — responses are generated locally.
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
            Composing a response
          </div>
        )}

        {streaming !== null && <Bubble role="assistant" content={streaming} caret />}
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
                send();
              }
            }}
            placeholder="Ask anything — Enter to send, Shift+Enter for a new line"
            className="min-h-[56px] flex-1 resize-none rounded-md border border-input bg-card px-3 py-2.5 text-[15px] text-foreground placeholder:text-muted-foreground/70"
          />
          <button
            type="button"
            onClick={send}
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
        className={`max-w-[min(46rem,85%)] whitespace-pre-wrap rounded-md px-4 py-3 text-[15px] leading-relaxed ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "border border-border bg-card text-foreground"
        }`}
      >
        {content}
        {caret && (
          <span className="animate-caret ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[3px] bg-primary" />
        )}
      </div>
    </div>
  );
}
