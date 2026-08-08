import { Activity, Moon, Sun, Cpu } from "lucide-react";
import { useAiCallCount } from "@/lib/nexus/ai-counter";
import { useTheme, toggleTheme } from "@/lib/nexus/theme";
import { MODELS, useModel, setModel } from "@/lib/nexus/models";

export function TopBar({ sectionLabel }: { sectionLabel: string }) {
  const count = useAiCallCount();
  const theme = useTheme();
  const model = useModel();

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

      <div className="flex shrink-0 items-center gap-2">
        <label className="relative inline-flex items-center">
          <span className="sr-only">AI model</span>
          <Cpu
            className="pointer-events-none absolute left-2.5 size-3.5 text-signal"
            aria-hidden="true"
          />
          <select
            value={model}
            onChange={(event) => setModel(event.target.value)}
            title="AI model used for chat, research and email"
            className="press h-9 max-w-[9.5rem] appearance-none rounded-md border border-border bg-card pl-7 pr-2 text-[12px] font-medium text-foreground sm:max-w-none"
          >
            {MODELS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <span
          aria-live="polite"
          title="AI requests made this session"
          className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md border border-border bg-card px-2.5 text-[12px] font-medium text-muted-foreground"
        >
          <Activity className="size-3.5 shrink-0 text-signal" aria-hidden="true" />
          <span className="whitespace-nowrap">
            <span className="hidden sm:inline">AI Requests: </span>
            <span className="sm:hidden">AI: </span>
            <span className="font-semibold text-foreground">{count}</span>
          </span>
        </span>

        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          title={theme === "dark" ? "Light mode" : "Dark mode"}
          className="press grid size-9 shrink-0 place-items-center rounded-md border border-border bg-card text-muted-foreground hover:text-foreground"
        >
          {theme === "dark" ? (
            <Sun className="size-4" aria-hidden="true" />
          ) : (
            <Moon className="size-4" aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  );
}
