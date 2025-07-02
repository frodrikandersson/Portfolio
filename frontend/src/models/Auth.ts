export interface AuthContextType {
  isLoggedIn: boolean;
  role: string | null;
  subscriptionLevel: string | null;
  logoutUser: () => void;
  setLoggedIn: (val: boolean) => void;
  fetchUserInfo: () => Promise<void>;
}