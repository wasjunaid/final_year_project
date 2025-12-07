import type { LucideIcon } from "lucide-react";

export interface MenuItem {
  icon: LucideIcon;
  label: string;
  route: string;
  badge?: number | string;
}

export interface SidebarConfig {
  portalName: string;
  mainNavItems: MenuItem[];
  bottomNavItems: MenuItem[];
}