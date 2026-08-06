import { ArrowRight, ShieldCheck, Wifi, Layers } from "lucide-react";
import { SECTIONS, type SectionId } from "./sections";

interface DashboardHomeProps {
  onLaunch: (id: SectionId) => void;
}

const STATS = [
  { icon: Layers, value: "3 tools", label: "available in this hub" },
  { icon: ShieldCheck, value: "100%", label: "local & secure by design" },
  { icon: Wifi, value: "0", label: "network calls for AI output" },
];

export function DashboardHome({ onLaunch }: DashboardHomeProps) {
  const tools = SECTIONS.filter((s) => s.id !== "dashboard");

  return (
    <div className="space-y-8">
      <header className="panel p-6">
        <p className="text-[12px] font-medium tracking-[0.18em] text-primary">NEXUS</p>
        <h1 className="mt-2 text-2xl">Command your communication infrastructure.</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Three connected tools on one grid — chat, research and email. Nothing leaves
          your browser, and nothing is kept after you close the tab.
        </p>
      </header>

      <section aria-label="Status" className="grid gap-4 sm:grid-cols-3">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="panel flex items-center gap-4 p-6">
              <span className="grid size-10 shrink-0 place-items-center rounded-md bg-signal-soft text-signal">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-lg font-semibold leading-tight">{stat.value}</p>
                <p className="text-[13px] leading-snug text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </section>

      <section aria-label="Tools" className="grid gap-6 lg:grid-cols-3">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <article key={tool.id} className="panel flex flex-col p-6 transition-shadow hover:shadow-[0_1px_0_0_var(--border),0_8px_24px_-16px_rgba(15,23,42,0.35)]">
              <span className="grid size-10 place-items-center rounded-md border border-border bg-accent text-primary">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-lg">{tool.label}</h2>
              <p className="mt-2 flex-1 text-[15px] text-muted-foreground">{tool.description}</p>
              <button
                type="button"
                onClick={() => onLaunch(tool.id)}
                className="press mt-6 inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
              >
                Launch {tool.label}
                <ArrowRight className="size-4" aria-hidden="true" />
              </button>
            </article>
          );
        })}
      </section>
    </div>
  );
}
