import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

// Navigation Types
export interface NavItem {
  icon: LucideIcon;
  label: string;
  route: string;
  badge?: number | string;
}

export interface SidebarConfig {
  portalName: string;
  mainNavItems: NavItem[];
  bottomNavItems: NavItem[];
}

export interface NavbarAction {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
}

export interface NavbarTab {
  label: string;
  value: string;
  count?: number;
}

export interface NavbarConfig {
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  showSearch?: boolean;
  searchPlaceholder?: string;
  tabs?: NavbarTab[];
  actions?: NavbarAction[];
  rightContent?: ReactNode;
}

// Portal Types
export type PortalType = 'doctor' | 'patient' | 'admin' | 'hospital';

export interface RouteState {
  searchQuery: string;
  activeTab: string;
  scrollPosition: number;
}

export interface PortalState {
  currentRoute: string;
  routeStates: Record<string, RouteState>;
}
