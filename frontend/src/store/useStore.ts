import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  username: string | null;
  setToken: (token: string | null, username: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      username: null,
      setToken: (token, username) => set({ token, username }),
      logout: () => set({ token: null, username: null }),
    }),
    {
      name: 'sip-auth-storage',
    }
  )
);
