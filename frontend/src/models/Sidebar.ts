export type SidebarType = 'home' | 'products' | 'blog' | 'support' | 'profile' | null;

export type SidebarSection = {
  type: string;
  label: React.ReactNode;
};


export interface SidebarMenuItem {
  id: string;
  title: string;
  componentName: string;
  label: string;
  props?: Record<string, unknown>;
}