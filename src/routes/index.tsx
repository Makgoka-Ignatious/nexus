import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { GridBackground } from "@/components/nexus/GridBackground";
import { Sidebar, MobileTabBar } from "@/components/nexus/Sidebar";
import { DisclaimerBanner } from "@/components/nexus/DisclaimerBanner";
import { DashboardHome } from "@/components/nexus/DashboardHome";
import { ChatPanel } from "@/components/nexus/ChatPanel";
import { ResearchPanel } from "@/components/nexus/ResearchPanel";
import { EmailPanel } from "@/components/nexus/EmailPanel";
import { TopBar } from "@/components/nexus/TopBar";
import { SECTIONS, type SectionId } from "@/components/nexus/sections";

const TITLE = "Nexus - Think. Link. Deliver.";
const DESCRIPTION =
  "Nexus is an AI workplace productivity hub: chat, research from text, links or PDFs, and smart email drafting in one Urban Grid control panel. Built for Momentum.";

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
  const [collapsed, setCollapsed] = useState(false);

  const section = SECTIONS.find((s) => s.id === active);

  return (
    <div className="relative isolate min-h-screen">
      <GridBackground />
      <Sidebar
        active={active}
        onSelect={setActive}
        collapsed={collapsed}
        onToggle={() => setCollapsed((prev) => !prev)}
      />
      <MobileTabBar active={active} onSelect={setActive} offset={bannerVisible} />

      <main
        className={`relative z-10 px-3 pt-6 transition-[padding] duration-300 sm:px-4 sm:pt-8 md:pr-6 lg:pr-8 ${collapsed ? "md:pl-[96px]" : "md:pl-[284px]"} ${bannerVisible ? "pb-36 md:pb-20" : "pb-32 md:pb-12"}`}
      >
        <div className="mx-auto w-full max-w-[1400px]">
          <TopBar sectionLabel={section?.label ?? "Dashboard"} />
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

