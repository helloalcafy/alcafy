import {
  House,
  Target,
  Kanban,
  Wallet,
  GraduationCap,
  NotePencil,
  FilmSlate,
  Airplane,
  GearSix,
} from "@phosphor-icons/react/dist/ssr";

export type NavItem = {
  label: string;
  href: string;
  icon: typeof House;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/home", icon: House },
  { label: "Goals", href: "/goals", icon: Target },
  { label: "Workspace", href: "/workspace", icon: Kanban },
  { label: "Finance", href: "/finance", icon: Wallet },
  { label: "Study Hub", href: "/study-hub", icon: GraduationCap },
  { label: "Journal", href: "/journal", icon: NotePencil },
  { label: "Content", href: "/content", icon: FilmSlate },
  { label: "Travel", href: "/travel", icon: Airplane },
];

export const SETTINGS_ITEM: NavItem = {
  label: "Settings",
  href: "/settings",
  icon: GearSix,
};
