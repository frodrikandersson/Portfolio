export type SidebarType = 'home' | 'products' | 'blog' | 'contact' | 'profile' | null;

export type SidebarSection = {
  type: string;
  label: React.ReactNode;
};


export interface SidebarMenuItem {
  id: string;
  title: string;
  componentName: string;
  label: string;
  props?: any; 
}