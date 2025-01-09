import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  user: { email: string } | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  login: async (email: string, password: string) => {
    // In a real app, this would make an API call
    // For demo, we'll just simulate a successful login
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    set({
      isAuthenticated: true,
      user: { email }
    });
  },
  logout: () => {
    set({
      isAuthenticated: false,
      user: null
    });
  }
}));