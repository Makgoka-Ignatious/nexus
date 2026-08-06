import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { GridBackground } from "@/components/nexus/GridBackground";
import { Sidebar, MobileTabBar } from "@/components/nexus/Sidebar";
import { DisclaimerBanner } from "@/components/nexus/DisclaimerBanner";
import { DashboardHome } from "@/components/nexus/DashboardHome";
import { ChatPanel } from "@/components/nexus/ChatPanel";
import { ResearchPanel } from "@/components/nexus/ResearchPanel";
import { EmailPanel } from "@/components/nexus/EmailPanel";
import { SECTIONS, type SectionId } from "@/components/nexus/sections";

const TITLE = "Nexus — Command your communication infrastructure";
const DESCRIPTION =
  "Nexus is an AI workplace productivity hub: chat, research summaries and smart email drafting in one Urban Grid control panel. Session-only, no account, no stored data.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NexusApp,
});

function NexusApp() {
  const [active, setActive] = useState<SectionId>("dashboard");
  const [bannerVisible, setBannerVisible] = useState(true);

  const section = SECTIONS.find((s) => s.id === active);

  return (
    <div className="min-h-screen">
      <GridBackground />
      <Sidebar active={active} onSelect={setActive} />
      <MobileTabBar active={active} onSelect={setActive} />

      <main
        className={`px-4 pt-8 md:pl-[292px] md:pr-8 ${bannerVisible ? "pb-32 md:pb-20" : "pb-28 md:pb-12"}`}
      >
        <div className="mx-auto max-w-[1140px]">
          <p className="mb-6 text-[12px] font-medium tracking-[0.16em] text-muted-foreground md:hidden">
            NEXUS · {section?.label.toUpperCase()}
          </p>
          <div key={active} className="animate-section-in">
            {active === "dashboard" && <DashboardHome onLaunch={setActive} />}
            {active === "chat" && <ChatPanel />}
            {active === "research" && <ResearchPanel />}
            {active === "email" && <EmailPanel />}
          </div>
        </div>
      </main>

      {bannerVisible && <DisclaimerBanner onDismiss={() => setBannerVisible(false)} />}
    </div>
  );
}
