import { LayoutGrid, MessageSquare, Search, Mail } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type SectionId = "dashboard" | "chat" | "research" | "email";

export interface SectionDef {
  id: SectionId;
  label: string;
  icon: LucideIcon;
  description: string;
}

export const SECTIONS: SectionDef[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutGrid,
    description: "Your control panel for the Nexus grid.",
  },
  {
    id: "chat",
    label: "Chat",
    icon: MessageSquare,
    description: "Think out loud with an assistant that follows the thread.",
  },
  {
    id: "research",
    label: "Research",
    icon: Search,
    description: "Turn a topic or article into summary, insights and actions.",
  },
  {
    id: "email",
    label: "Email",
    icon: Mail,
    description: "Draft tone-controlled messages from a few key points.",
  },
];
