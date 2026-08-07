import { useRef, useState } from "react";
import {
  Sparkle,
  Lightbulb,
  ListChecks,
  Pencil,
  Check,
  AlertTriangle,
  Link2,
  FileText,
  Type,
  Upload,
  X,
} from "lucide-react";
import type { ResearchResult } from "@/lib/nexus/mock-research";
import { analyzeResearch } from "@/lib/nexus/ai.functions";
import { bumpAiCalls } from "@/lib/nexus/ai-counter";
import { NodePathAnimation } from "./NodePathAnimation";
import { Markdown } from "./ChatPanel";

type Phase = "idle" | "loading" | "ready";
type Mode = "text" | "url" | "pdf";

const MODES: { id: Mode; label: string; icon: typeof Type }[] = [
  { id: "text", label: "Text", icon: Type },
  { id: "url", label: "Link", icon: Link2 },
  { id: "pdf", label: "PDF", icon: FileText },
];

const MAX_PDF_BYTES = 8 * 1024 * 1024;

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.readAsDataURL(file);
  });
}

export function ResearchPanel() {
  const [mode, setMode] = useState<Mode>("text");
  const [input, setInput] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const canRun =
    (mode === "text" && input.trim().length > 0) ||
    (mode === "url" && url.trim().length > 0) ||
    (mode === "pdf" && file !== null);

  const pickFile = async (picked: File | null | undefined) => {
    if (!picked) return;
    if (picked.type !== "application/pdf" && !picked.name.toLowerCase().endsWith(".pdf")) {
      setError("Please choose a PDF file.");
      return;
    }
    if (picked.size > MAX_PDF_BYTES) {
      setError("That PDF is larger than 8 MB. Try a smaller file.");
      return;
    }
    setError(null);
    setFile(picked);
  };

  const run = async () => {
    if (!canRun || phase === "loading") return;
    setPhase("loading");
    setError(null);
    try {
      const payload: {
        input: string;
        url: string;
        file?: { name: string; mimeType: string; dataUrl: string };
      } = { input: mode === "text" ? input : "", url: mode === "url" ? url : "" };

      if (mode === "pdf" && file) {
        payload.file = {
          name: file.name,
          mimeType: file.type || "application/pdf",
          dataUrl: await readAsDataUrl(file),
        };
      }

      bumpAiCalls();
      const generated = await analyzeResearch({ data: payload });
      setResult(generated);
      setPhase("ready");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed. Try again.");
      setPhase(result ? "ready" : "idle");
    }
  };

  const reset = () => {
    setInput("");
    setUrl("");
    setFile(null);
    setResult(null);
    setError(null);
    setPhase("idle");
  };

  return (
    <div className="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
      <section className="panel h-fit min-w-0 p-4 sm:p-6">
        <h1 className="text-lg">Research Assistant</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Paste text, drop in a link, or upload a PDF — the AI reads it all.
        </p>

        <div
          role="tablist"
          aria-label="Research source"
          className="mt-5 grid grid-cols-3 gap-1 rounded-md border border-border bg-accent/60 p-1"
        >
          {MODES.map((option) => {
            const Icon = option.icon;
            const isActive = option.id === mode;
            return (
              <button
                key={option.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  setMode(option.id);
                  setError(null);
                }}
                className={`press inline-flex min-h-11 items-center justify-center gap-1.5 rounded-[5px] px-2 text-[13px] font-medium ${
                  isActive
                    ? "bg-card text-foreground shadow-[0_1px_0_0_var(--border)]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                {option.label}
              </button>
            );
          })}
        </div>

        {mode === "text" && (
          <div className="mt-5">
            <label htmlFor="research-input" className="block text-[13px] font-medium">
              Topic or article
            </label>
            <textarea
              id="research-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              rows={10}
              placeholder="e.g. How should a 40-person team adopt async standups? — or paste an entire article here."
              className="mt-2 w-full resize-y rounded-md border border-input bg-card px-3 py-2.5 text-[15px] leading-relaxed placeholder:text-muted-foreground/70"
            />
            <p className="mt-2 text-[12px] text-muted-foreground">
              {input.trim() ? input.trim().split(/\s+/).length : 0} words
            </p>
          </div>
        )}

        {mode === "url" && (
          <div className="mt-5">
            <label htmlFor="research-url" className="block text-[13px] font-medium">
              Article or page URL
            </label>
            <input
              id="research-url"
              type="url"
              inputMode="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://example.com/article"
              className="mt-2 w-full rounded-md border border-input bg-card px-3 py-2.5 text-[15px] placeholder:text-muted-foreground/70"
            />
            <p className="mt-2 text-[12px] text-muted-foreground">
              Nexus fetches the page, strips the markup and analyses the readable text.
            </p>
          </div>
        )}

        {mode === "pdf" && (
          <div className="mt-5">
            <span className="block text-[13px] font-medium">PDF document</span>
            <input
              ref={fileInput}
              id="research-pdf"
              type="file"
              accept="application/pdf,.pdf"
              className="sr-only"
              onChange={(event) => void pickFile(event.target.files?.[0])}
            />
            {file ? (
              <div className="mt-2 flex items-center gap-3 rounded-md border border-border bg-accent/60 px-3 py-3">
                <FileText className="size-4 shrink-0 text-primary" aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate text-[14px]">{file.name}</span>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  aria-label="Remove file"
                  className="press grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className="press mt-2 flex min-h-[112px] w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-accent/40 px-4 py-6 text-center hover:bg-accent"
              >
                <Upload className="size-5 text-primary" aria-hidden="true" />
                <span className="text-[14px] font-medium">Choose a PDF</span>
                <span className="text-[12px] text-muted-foreground">Up to 8 MB</span>
              </button>
            )}
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void run()}
            disabled={!canRun || phase === "loading"}
            className="press inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Sparkle className="size-4 shrink-0" aria-hidden="true" />
            <span className="truncate">
              {phase === "loading" ? "Analysing…" : "Generate Summary & Insights"}
            </span>
          </button>
          {(input || url || file || result) && (
            <button
              type="button"
              onClick={reset}
              className="press inline-flex min-h-11 items-center rounded-md border border-border px-3 text-[13px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Reset
            </button>
          )}
        </div>

        {error && (
          <p className="mt-3 flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-[13px] text-destructive">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}
      </section>

      <section className="panel min-h-[420px] min-w-0 p-4 sm:p-6">
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
    <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-4 text-center">
      <div className="grid-lines size-24 rounded-md border border-border opacity-60" aria-hidden="true" />
      <div>
        <p className="font-semibold">No analysis yet</p>
        <p className="mt-1 max-w-sm text-[14px] text-muted-foreground">
          Add a topic, a link or a PDF on the left, then generate. You'll get a
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
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 border-b border-border pb-4">
        <div className="min-w-0">
          <p className="text-[12px] font-medium tracking-[0.16em] text-primary">ANALYSIS</p>
          <h2 className="mt-1 break-words text-lg sm:text-xl">{result.topic}</h2>
          {result.source && (
            <p className="mt-1.5 flex items-start gap-1.5 text-[12px] text-muted-foreground">
              <Link2 className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              <span className="min-w-0 break-all">Source: {result.source}</span>
            </p>
          )}
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-signal-soft px-2.5 py-1 text-[12px] font-medium text-signal">
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
                <span className="min-w-0 text-muted-foreground">{insight}</span>
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
        <h3 className="min-w-0 truncate text-[15px]">{title}</h3>
        <button
          type="button"
          onClick={() => {
            if (editing) onSave(draft);
            else setDraft(value);
            setEditing((prev) => !prev);
          }}
          className="press ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-[12px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
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
