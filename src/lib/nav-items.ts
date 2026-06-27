import {
  House,
  Target,
  Kanban,
  Wallet,
  GraduationCap,
  NotebookPen,
  Clapperboard,
  Plane,
  GearSix,
  type Icon,
} from "@phosphor-icons/react/dist/ssr";

export type NavItem = {
  label: string;
  href: string;
  icon: Icon;
};

// Bold-weight line icons throughout (Phosphor "Bold"), per design spec.
export const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/home", icon: House },
  { label: "Goals", href: "/goals", icon: Target },
  { label: "Workspace", href: "/workspace", icon: Kanban },
  { label: "Finance", href: "/finance", icon: Wallet },
  { label: "Study Hub", href: "/study-hub", icon: GraduationCap },
  { label: "Journal", href: "/journal", icon: NotebookPen },
  { label: "Content", href: "/content", icon: Clapperboard },
  { label: "Travel", href: "/travel", icon: Plane },
];

export const SETTINGS_ITEM: NavItem = {
  label: "Settings",
  href: "/settings",
  icon: GearSix,
};
