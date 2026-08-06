import { useEffect, useRef, useState } from "react";
import { Copy, Check, RefreshCw, Pencil, Mail, Info } from "lucide-react";
import {
  generateEmail,
  suggestSubject,
  TONES,
  type EmailTone,
} from "@/lib/nexus/mock-email";
import { NodePathAnimation } from "./NodePathAnimation";

type Phase = "idle" | "loading" | "ready";

export function EmailPanel() {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [subjectTouched, setSubjectTouched] = useState(false);
  const [context, setContext] = useState("");
  const [tone, setTone] = useState<EmailTone>("formal");
  const [phase, setPhase] = useState<Phase>("idle");
  const [body, setBody] = useState("");
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  // Auto-suggest the subject from context/tone until the user edits it.
  useEffect(() => {
    if (subjectTouched) return;
    setSubject(suggestSubject(context, tone));
  }, [context, tone, subjectTouched]);

  const generate = () => {
    if (!context.trim() || phase === "loading") return;
    setPhase("loading");
    setEditing(false);
    setCopied(false);
    const draft = generateEmail({ to: to || "there", subject, context, tone });
    timer.current = setTimeout(() => {
      setBody(draft);
      setPhase("ready");
    }, 1700);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(
        `To: ${to}\nSubject: ${subject}\n\n${body}`,
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
      <section className="panel h-fit p-6">
        <h1 className="text-lg">Smart Email Generator</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Nothing is sent — this composes a draft you can copy out.
        </p>

        <div className="mt-6 space-y-4">
          <Field label="To" htmlFor="email-to">
            <input
              id="email-to"
              type="email"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              placeholder="dana.reid@company.com"
              className="w-full rounded-md border border-input bg-card px-3 py-2.5 text-[15px] placeholder:text-muted-foreground/70"
            />
          </Field>

          <Field label="Subject" htmlFor="email-subject" hint="Auto-suggested, editable">
            <input
              id="email-subject"
              value={subject}
              onChange={(event) => {
                setSubjectTouched(true);
                setSubject(event.target.value);
              }}
              placeholder="Add context below for a suggestion"
              className="w-full rounded-md border border-input bg-card px-3 py-2.5 text-[15px] placeholder:text-muted-foreground/70"
            />
          </Field>

          <Field label="Context / key points" htmlFor="email-context">
            <textarea
              id="email-context"
              value={context}
              onChange={(event) => setContext(event.target.value)}
              rows={7}
              placeholder={"One point per line, e.g.\nQ3 rollout timeline slipped by two weeks\nWe need sign-off on the revised plan\nBudget is unchanged"}
              className="w-full resize-y rounded-md border border-input bg-card px-3 py-2.5 text-[15px] leading-relaxed placeholder:text-muted-foreground/70"
            />
          </Field>

          <Field label="Tone" htmlFor="email-tone" hint={TONES.find((t) => t.value === tone)?.hint}>
            <select
              id="email-tone"
              value={tone}
              onChange={(event) => setTone(event.target.value as EmailTone)}
              className="w-full rounded-md border border-input bg-card px-3 py-2.5 text-[15px]"
            >
              {TONES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>

          <button
            type="button"
            onClick={generate}
            disabled={!context.trim() || phase === "loading"}
            className="press inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Mail className="size-4" aria-hidden="true" />
            {phase === "loading" ? "Generating…" : "Generate Email"}
          </button>
        </div>
      </section>

      <section className="panel min-h-[420px] p-6">
        {phase === "idle" && (
          <div className="flex h-full min-h-[360px] flex-col items-center justify-center gap-4 text-center">
            <div className="grid-lines size-24 rounded-md border border-border opacity-60" aria-hidden="true" />
            <div>
              <p className="font-semibold">No draft yet</p>
              <p className="mt-1 max-w-sm text-[14px] text-muted-foreground">
                Add your key points and pick a tone. Formal, Friendly and Persuasive
                produce genuinely different drafts from the same input.
              </p>
            </div>
          </div>
        )}

        {phase === "loading" && <NodePathAnimation label="Composing your draft" />}

        {phase === "ready" && (
          <div className="animate-section-in space-y-5">
            <header className="flex flex-wrap items-center gap-3 border-b border-border pb-4">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] text-muted-foreground">
                  To: {to || "(no recipient)"}
                </p>
                <h2 className="truncate text-lg">{subject || "(no subject)"}</h2>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-signal-soft px-2.5 py-1 text-[12px] font-medium text-signal">
                {TONES.find((t) => t.value === tone)?.label} tone
              </span>
            </header>

            {editing ? (
              <textarea
                value={body}
                aria-label="Edit email body"
                onChange={(event) => setBody(event.target.value)}
                rows={20}
                className="w-full resize-y rounded-md border border-input bg-card px-4 py-3 text-[15px] leading-relaxed"
              />
            ) : (
              <article className="whitespace-pre-wrap rounded-md border border-border bg-accent/50 px-5 py-4 text-[15px] leading-relaxed text-foreground">
                {body}
              </article>
            )}

            <p className="flex items-start gap-2 text-[12px] text-muted-foreground">
              <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              This is AI-generated and should be reviewed before sending.
            </p>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setEditing((prev) => !prev)}
                className="press inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-[13px] font-medium hover:bg-muted"
              >
                {editing ? <Check className="size-4" aria-hidden="true" /> : <Pencil className="size-4" aria-hidden="true" />}
                {editing ? "Done editing" : "Edit"}
              </button>
              <button
                type="button"
                onClick={copy}
                className="press inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-[13px] font-medium hover:bg-muted"
              >
                {copied ? <Check className="size-4 text-signal" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
                {copied ? "Copied" : "Copy to clipboard"}
              </button>
              <button
                type="button"
                onClick={generate}
                className="press inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-[13px] font-medium text-primary-foreground hover:bg-primary-hover"
              >
                <RefreshCw className="size-4" aria-hidden="true" />
                Regenerate
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-[13px] font-medium">
        {label}
      </label>
      {hint && <p className="mb-1.5 text-[12px] text-muted-foreground">{hint}</p>}
      <div className={hint ? "" : "mt-1.5"}>{children}</div>
    </div>
  );
}
