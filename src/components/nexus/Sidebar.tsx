import { SECTIONS, type SectionId } from "./sections";

interface SidebarProps {
  active: SectionId;
  onSelect: (id: SectionId) => void;
}

export function Sidebar({ active, onSelect }: SidebarProps) {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-y-0 left-0 hidden w-[260px] flex-col border-r border-sidebar-border bg-sidebar md:flex"
    >
      <div className="flex h-20 items-center gap-3 border-b border-sidebar-border px-6">
        <span className="grid size-8 place-items-center rounded-md bg-sidebar-active text-[13px] font-semibold tracking-tight text-sidebar-active-foreground">
          N
        </span>
        <div>
          <p className="text-[15px] font-semibold tracking-[0.18em] text-foreground">NEXUS</p>
          <p className="text-[11px] leading-tight text-muted-foreground">
            Command your comms
          </p>
        </div>
      </div>

      <ul className="flex flex-col gap-1 p-4">
        {SECTIONS.map((section) => {
          const isActive = section.id === active;
          const Icon = section.icon;
          return (
            <li key={section.id}>
              <button
                type="button"
                onClick={() => onSelect(section.id)}
                aria-current={isActive ? "page" : undefined}
                className={`press flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium ${
                  isActive
                    ? "bg-sidebar-active text-sidebar-active-foreground"
                    : "text-sidebar-foreground hover:bg-card hover:text-foreground"
                }`}
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                <span className="flex-1">{section.label}</span>
                <span
                  aria-hidden="true"
                  className={`size-1.5 rounded-full ${
                    isActive ? "bg-signal" : "bg-border"
                  }`}
                />
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto p-4">
        <div className="panel p-4">
          <div className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-signal" aria-hidden="true" />
            <p className="text-[13px] font-semibold text-foreground">Session only</p>
          </div>
          <p className="mt-1 text-[12px] leading-snug text-muted-foreground">
            No account, no database. Everything clears when you close the tab.
          </p>
        </div>
      </div>
    </nav>
  );
}

export function MobileTabBar({ active, onSelect }: SidebarProps) {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-10 z-30 border-t border-border bg-sidebar md:hidden"
    >
      <ul className="grid grid-cols-4">
        {SECTIONS.map((section) => {
          const isActive = section.id === active;
          const Icon = section.icon;
          return (
            <li key={section.id}>
              <button
                type="button"
                onClick={() => onSelect(section.id)}
                aria-current={isActive ? "page" : undefined}
                className={`press flex w-full flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="size-5" aria-hidden="true" />
                {section.label}
                <span
                  aria-hidden="true"
                  className={`size-1 rounded-full ${isActive ? "bg-signal" : "bg-transparent"}`}
                />
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
