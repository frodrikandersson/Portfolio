import type { SidebarSection } from "../models/Sidebar";


export const sidebarSections: SidebarSection[] = [
  { type: 'search', label: <img src="/icons/searchBlue.svg" alt="Search"/> },
  { type: 'explorer', label: <img src="/icons/explorerBlue.svg" alt="Explore"/> },
  { type: 'profile', label: <img src="/icons/profileBlue.svg" alt="Profile"/> }
];
