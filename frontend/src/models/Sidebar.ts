export type SidebarType = 'explorer' | 'search' | 'profile' | null;

export type SidebarSection = {
  type: string;
  label: React.ReactNode;
};