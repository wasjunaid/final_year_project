// Centralized exports for UI stores
export { useSidebarStore } from './sidebarStore.instance';
export { createSidebarStore } from './sidebarStore';
export type { SidebarState } from './sidebarStore';

export { useNavbarStore } from './navbarStore.instance';
export { createNavbarStore } from './navbarStore';
export type { NavbarState } from './navbarStore';

export { useThemeStore } from './themeStore.instance';
export { createThemeStore } from './themeStore';
export type { ThemeState, Theme } from './themeStore';
