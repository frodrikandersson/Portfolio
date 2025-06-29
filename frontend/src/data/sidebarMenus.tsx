export const sidebarMenus: {
  [key: string]: { id: string; title: string; componentName: string; label: string }[];
} = {
  profile: [
    { id: 'login', title: 'Login.tsx', componentName: 'LoginPage', label: 'Log in' },
    { id: 'register', title: 'Register.tsx', componentName: 'RegisterPage', label: 'Register' },
    { id: 'profile-page', title: 'Profile.tsx', componentName: 'ProfilePage', label: 'Profile page' },
  ],
  search: [
    { id: 'search-tab', title: 'Search.tsx', componentName: 'SearchPage', label: 'Search' },
  ],
  explorer: [
    { id: 'explorer-tab', title: 'Explorer.tsx', componentName: 'ExplorerPage', label: 'Explorer' },
  ],
};
