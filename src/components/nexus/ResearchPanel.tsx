import { useState } from "react";
import { Sparkle, Lightbulb, ListChecks, Pencil, Check, AlertTriangle } from "lucide-react";
import type { ResearchResult } from "@/lib/nexus/mock-research";
import { analyzeResearch } from "@/lib/nexus/ai.functions";
import { NodePathAnimation } from "./NodePathAnimation";
import { Markdown } from "./ChatPanel";

type Phase = "idle" | "loading" | "ready";

export function ResearchPanel() {
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    if (!input.trim() || phase === "loading") return;
    setPhase("loading");
    setError(null);
    try {
      const generated = await analyzeResearch({ data: { input } });
      setResult(generated);
      setPhase("ready");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed. Try again.");
      setPhase(result ? "ready" : "idle");
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
      <section className="panel h-fit p-6">
        <h1 className="text-lg">Research Assistant</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Paste a topic, a question, notes or a full article — the AI reads it all.
        </p>

        <label htmlFor="research-input" className="mt-6 block text-[13px] font-medium">
          Topic or article
        </label>
        <textarea
          id="research-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          rows={12}
          placeholder="e.g. How should a 40-person team adopt async standups? — or paste an entire article here."
          className="mt-2 w-full resize-y rounded-md border border-input bg-card px-3 py-2.5 text-[15px] leading-relaxed placeholder:text-muted-foreground/70"
        />

        <div className="mt-2 flex items-center justify-between text-[12px] text-muted-foreground">
          <span>{input.trim() ? input.trim().split(/\s+/).length : 0} words</span>
          {input.trim().length > 0 && (
            <button
              type="button"
              onClick={() => {
                setInput("");
                setResult(null);
                setPhase("idle");
              }}
              className="press rounded-md px-2 py-1 hover:bg-muted hover:text-foreground"
            >
              Reset
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => void run()}
          disabled={!input.trim() || phase === "loading"}
          className="press mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Sparkle className="size-4" aria-hidden="true" />
          {phase === "loading" ? "Analysing…" : "Generate Summary & Insights"}
        </button>

        {error && (
          <p className="mt-3 flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-[13px] text-destructive">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}
      </section>

      <section className="panel min-h-[420px] p-6">
        {phase === "idle" && <EmptyState />}
        {phase === "loading" && <NodePathAnimation label="Analysing your input" />}
        {phase === "ready" && result && (
          <ResearchOutput result={result} onChange={setResult} />
        )}
      </section>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full min-h-[360px] flex-col items-center justify-center gap-4 text-center">
      <div className="grid-lines size-24 rounded-md border border-border opacity-60" aria-hidden="true" />
      <div>
        <p className="font-semibold">No analysis yet</p>
        <p className="mt-1 max-w-sm text-[14px] text-muted-foreground">
          Add a topic or paste an article on the left, then generate. You'll get a
          summary, key insights and recommendations — all editable.
        </p>
      </div>
    </div>
  );
}

function ResearchOutput({
  result,
  onChange,
}: {
  result: ResearchResult;
  onChange: (next: ResearchResult) => void;
}) {
  return (
    <div className="animate-section-in space-y-8">
      <header className="flex flex-wrap items-start gap-3 border-b border-border pb-4">
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-medium tracking-[0.16em] text-primary">ANALYSIS</p>
          <h2 className="mt-1 truncate text-xl">{result.topic}</h2>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-md bg-signal-soft px-2.5 py-1 text-[12px] font-medium text-signal">
          <span className="size-1.5 rounded-full bg-signal" aria-hidden="true" />
          AI generated
        </span>
      </header>

      <EditableBlock
        title="Summary"
        icon={<Sparkle className="size-4" aria-hidden="true" />}
        value={result.summary}
        onSave={(value) => onChange({ ...result, summary: value })}
        render={(value) => (
          <div className="text-[15px] leading-relaxed text-muted-foreground">
            <Markdown content={value} />
          </div>
        )}
      />

      <EditableBlock
        title="Key Insights"
        icon={<Lightbulb className="size-4" aria-hidden="true" />}
        value={result.insights.join("\n")}
        onSave={(value) =>
          onChange({ ...result, insights: value.split("\n").filter((l) => l.trim()) })
        }
        render={() => (
          <ul className="space-y-3">
            {result.insights.map((insight, i) => (
              <li key={i} className="flex gap-3 text-[15px] leading-relaxed">
                <span className="mt-1 inline-flex size-5 shrink-0 items-center justify-center rounded bg-signal-soft text-[11px] font-semibold text-signal">
                  {i + 1}
                </span>
                <span className="text-muted-foreground">{insight}</span>
              </li>
            ))}
          </ul>
        )}
      />

      <EditableBlock
        title="Recommendations"
        icon={<ListChecks className="size-4" aria-hidden="true" />}
        value={result.recommendations.join("\n")}
        onSave={(value) =>
          onChange({
            ...result,
            recommendations: value.split("\n").filter((l) => l.trim()),
          })
        }
        render={() => (
          <ul className="space-y-3">
            {result.recommendations.map((rec, i) => (
              <li
                key={i}
                className="rounded-md border border-border bg-accent/60 px-4 py-3 text-[15px] leading-relaxed text-foreground"
              >
                {rec}
              </li>
            ))}
          </ul>
        )}
      />
    </div>
  );
}

function EditableBlock({
  title,
  icon,
  value,
  onSave,
  render,
}: {
  title: string;
  icon: React.ReactNode;
  value: string;
  onSave: (value: string) => void;
  render: (value: string) => React.ReactNode;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <span className="text-primary">{icon}</span>
        <h3 className="text-[15px]">{title}</h3>
        <button
          type="button"
          onClick={() => {
            if (editing) onSave(draft);
            else setDraft(value);
            setEditing((prev) => !prev);
          }}
          className="press ml-auto inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-[12px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          {editing ? (
            <>
              <Check className="size-3.5" aria-hidden="true" /> Save
            </>
          ) : (
            <>
              <Pencil className="size-3.5" aria-hidden="true" /> Edit
            </>
          )}
        </button>
      </div>

      {editing ? (
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          rows={Math.min(16, Math.max(4, draft.split("\n").length + 3))}
          aria-label={`Edit ${title}`}
          className="w-full resize-y rounded-md border border-input bg-card px-3 py-2.5 text-[15px] leading-relaxed"
        />
      ) : (
        render(value)
      )}
    </section>
  );
}
