import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import logoAsset from "@/assets/nexus-logo.png.asset.json";
import { SECTIONS, type SectionId } from "./sections";

interface SidebarProps {
  active: SectionId;
  onSelect: (id: SectionId) => void;
}

interface DesktopSidebarProps extends SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ active, onSelect, collapsed, onToggle }: DesktopSidebarProps) {
  return (
    <nav
      aria-label="Primary"
      className={`fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-300 md:flex ${
        collapsed ? "w-[72px]" : "w-[260px]"
      }`}
    >
      <div
        className={`flex h-20 items-center gap-3 ${
          collapsed ? "justify-center px-3" : "px-6"
        }`}
      >
        <img
          src={logoAsset.url}
          alt="Nexus logo"
          className="size-9 shrink-0 object-contain"
        />
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-[15px] font-semibold tracking-[0.18em] text-foreground">NEXUS</p>
            <p className="truncate text-[11px] leading-tight tracking-[0.12em] text-signal">
              Think. Link. Deliver.
            </p>
          </div>
        )}
      </div>

      <ul className={`flex flex-col gap-1 ${collapsed ? "p-3" : "p-4"}`}>
        {SECTIONS.map((section) => {
          const isActive = section.id === active;
          const Icon = section.icon;
          return (
            <li key={section.id}>
              <button
                type="button"
                onClick={() => onSelect(section.id)}
                aria-current={isActive ? "page" : undefined}
                title={collapsed ? section.label : undefined}
                className={`press flex w-full items-center gap-3 rounded-md py-2.5 text-left text-sm font-medium ${
                  collapsed ? "justify-center px-0" : "px-3"
                } ${
                  isActive
                    ? "bg-sidebar-active text-sidebar-active-foreground"
                    : "text-sidebar-foreground hover:bg-card hover:text-foreground"
                }`}
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                {!collapsed && (
                  <>
                    <span className="min-w-0 flex-1 truncate">{section.label}</span>
                    <span
                      aria-hidden="true"
                      className={`size-1.5 shrink-0 rounded-full ${isActive ? "bg-signal" : "bg-border"}`}
                    />
                  </>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <div className={`mt-auto ${collapsed ? "p-3" : "p-4"}`}>
        {!collapsed && (
          <div className="panel mb-3 p-4">
            <div className="flex items-center gap-2">
              <span className="size-1.5 shrink-0 rounded-full bg-signal" aria-hidden="true" />
              <p className="text-[13px] font-semibold text-foreground">Session only</p>
            </div>
            <p className="mt-1 text-[12px] leading-snug text-muted-foreground">
              No account, no database. Everything clears when you close the tab.
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={onToggle}
          aria-expanded={!collapsed}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`press flex w-full items-center gap-2 rounded-md border border-border py-2.5 text-[13px] font-medium text-muted-foreground hover:bg-card hover:text-foreground ${
            collapsed ? "justify-center px-0" : "px-3"
          }`}
        >
          {collapsed ? (
            <PanelLeftOpen className="size-4" aria-hidden="true" />
          ) : (
            <PanelLeftClose className="size-4" aria-hidden="true" />
          )}
          {!collapsed && <span>Collapse</span>}
          <span className="sr-only">{collapsed ? "Expand sidebar" : "Collapse sidebar"}</span>
        </button>
      </div>
    </nav>
  );
}

export function MobileTabBar({
  active,
  onSelect,
  offset,
}: SidebarProps & { offset: boolean }) {
  return (
    <nav
      aria-label="Primary"
      className={`fixed inset-x-0 z-30 border-t border-border bg-sidebar pb-[env(safe-area-inset-bottom)] transition-[bottom] duration-200 md:hidden ${
        offset ? "bottom-10" : "bottom-0"
      }`}
    >
      <ul className="grid grid-cols-4">
        {SECTIONS.map((section) => {
          const isActive = section.id === active;
          const Icon = section.icon;
          return (
            <li key={section.id} className="min-w-0">
              <button
                type="button"
                onClick={() => onSelect(section.id)}
                aria-current={isActive ? "page" : undefined}
                className={`press flex min-h-14 w-full flex-col items-center justify-center gap-0.5 px-1 py-2 text-[11px] font-medium ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="size-5 shrink-0" aria-hidden="true" />
                <span className="w-full truncate text-center">{section.label}</span>
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
