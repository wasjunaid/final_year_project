import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export interface NavItem {
  icon: LucideIcon;
  label: string;
  route: string;
  badge?: number | string;
}

export interface NavbarAction {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  disabled?: boolean;
}

export interface NavbarTab {
  label: string;
  value: string;
  count?: number;
}

export interface NavbarConfig {
  title?: string;
  subtitle?: string;
  initialActiveTab?: string;
  showBackButton?: boolean;
  showSearch?: boolean;
  searchPlaceholder?: string;
  tabs?: NavbarTab[];
  actions?: NavbarAction[];
  rightContent?: ReactNode;
}