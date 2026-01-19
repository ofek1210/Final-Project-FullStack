import { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as authApi from "./auth.api";

type AuthState = {
  user: authApi.User | null;
  isLoading: boolean;
  isAuthed: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (profile: authApi.ProfileUpdate) => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<authApi.User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function bootstrap() {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await authApi.me();
        setUser(res.user);
      } catch {
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    bootstrap();
  }, []);

  async function login(username: string, password: string) {
    await authApi.login(username, password);
    const res = await authApi.me();
    setUser(res.user);
  }

  async function register(username: string, password: string) {
    await authApi.register(username, password);
    const res = await authApi.me();
    setUser(res.user);
  }

  function logout() {
    authApi.logout();
    setUser(null);
  }

  async function updateProfile(profile: authApi.ProfileUpdate) {
    const res = await authApi.updateMe(profile);
    setUser(res.user);
  }

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthed: Boolean(user),
      login,
      register,
      logout,
      updateProfile,
    }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
