import { useAuth } from '../contexts/AuthContext';

export const useSidebarMenus = () => {
  const { isLoggedIn } = useAuth();

  return {
    profile: [
      {
        id: 'auth',
        title: 'AuthPanel.tsx',
        componentName: 'AuthPanel',
        label: isLoggedIn ? 'Log out' : 'Log in',
      },
      ...(!isLoggedIn) ? [
        {
          id: 'register',
          title: 'Register.tsx',
          componentName: 'RegisterPage',
          label: 'Register',
        },
      ] : [],
      ...isLoggedIn ? [
        {
          id: 'profile-page',
          title: 'Profile.tsx',
          componentName: 'ProfilePage',
          label: 'Profile page',
        },
      ] : [],
    ],
    search: [
      {
        id: 'search-tab',
        title: 'Search.tsx',
        componentName: 'SearchPage',
        label: 'Search',
      },
    ],
    explorer: [
      {
        id: 'explorer-tab',
        title: 'Explorer.tsx',
        componentName: 'ExplorerPage',
        label: 'Explorer',
      },
    ],
  };
};
