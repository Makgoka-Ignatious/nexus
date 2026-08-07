import { Activity } from "lucide-react";
import { useAiCallCount } from "@/lib/nexus/ai-counter";

export function TopBar({ sectionLabel }: { sectionLabel: string }) {
  const count = useAiCallCount();

  return (
    <div className="mb-5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
      <div className="min-w-0">
        <p className="truncate text-[12px] font-medium tracking-[0.16em] text-muted-foreground">
          NEXUS · {sectionLabel.toUpperCase()}
        </p>
        <p className="truncate text-[12px] tracking-[0.14em] text-signal md:hidden">
          THINK. LINK. DELIVER.
        </p>
      </div>
      <span
        aria-live="polite"
        title="AI requests made this session"
        className="inline-flex shrink-0 items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1.5 text-[12px] font-medium text-muted-foreground"
      >
        <Activity className="size-3.5 shrink-0 text-signal" aria-hidden="true" />
        <span className="whitespace-nowrap">
          <span className="hidden sm:inline">AI Requests: </span>
          <span className="sm:hidden">AI: </span>
          <span className="font-semibold text-foreground">{count}</span>
        </span>
      </span>
    </div>
  );
}
