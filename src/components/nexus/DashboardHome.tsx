import { ArrowRight, ShieldCheck, Wifi, Layers } from "lucide-react";
import { SECTIONS, type SectionId } from "./sections";

interface DashboardHomeProps {
  onLaunch: (id: SectionId) => void;
}

const STATS = [
  { icon: Layers, value: "3 tools", label: "available in this hub" },
  { icon: ShieldCheck, value: "100%", label: "session-only & private by design" },
  { icon: Wifi, value: "0", label: "records stored after you leave" },
];

export function DashboardHome({ onLaunch }: DashboardHomeProps) {
  const tools = SECTIONS.filter((s) => s.id !== "dashboard");

  return (
    <div className="space-y-6 sm:space-y-8">
      <header className="panel p-5 sm:p-6">
        <p className="text-[12px] font-medium tracking-[0.18em] text-primary">NEXUS</p>
        <h1 className="mt-2 text-2xl leading-tight sm:text-3xl lg:text-4xl">
          Think. Link. Deliver.
        </h1>
        <p className="mt-1.5 text-[13px] font-medium tracking-[0.18em] text-signal">
          BUILT FOR MOMENTUM.
        </p>
        <p className="mt-3 max-w-2xl text-[15px] text-muted-foreground">
          Three connected tools on one grid — chat, research and email. Nothing is kept
          after you close the tab.
        </p>
      </header>

      <section aria-label="Status" className="grid gap-3 sm:grid-cols-3 sm:gap-4">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="panel flex min-w-0 items-center gap-4 p-4 sm:p-6">
              <span className="grid size-10 shrink-0 place-items-center rounded-md bg-signal-soft text-signal">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-lg font-semibold leading-tight">{stat.value}</p>
                <p className="text-[13px] leading-snug text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </section>

      <section aria-label="Tools" className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <article
              key={tool.id}
              className="panel flex min-w-0 flex-col p-5 transition-shadow hover:shadow-[0_1px_0_0_var(--border),0_8px_24px_-16px_rgba(15,23,42,0.35)] sm:p-6"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-md border border-border bg-accent text-primary">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-lg">{tool.label}</h2>
              <p className="mt-2 flex-1 text-[15px] text-muted-foreground">{tool.description}</p>
              <button
                type="button"
                onClick={() => onLaunch(tool.id)}
                className="press mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
              >
                Launch {tool.label}
                <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
              </button>
            </article>
          );
        })}
      </section>
    </div>
  );
}
