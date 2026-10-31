"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getMe, logout } from "@/features/auth/auth";
import {
  getAccessToken,
  getRefreshToken,
  silentRefresh,
  clearTokens,
  isTokenExpired,
} from "@/lib/api/api";

const SESSION_COOKIE_AGE = 60 * 60 * 24 * 7;

function setUserCookies(user) {
  if (typeof document === "undefined" || !user) return;
  const isSecure = typeof window !== "undefined" && window.location.protocol === "https:";
  const secureFlag = isSecure ? "; Secure" : "";
  if (user.role) {
    document.cookie = `userRole=${encodeURIComponent(user.role)}; path=/; max-age=${SESSION_COOKIE_AGE}; samesite=lax${secureFlag}`;
  }
  if (user.status) {
    document.cookie = `userStatus=${encodeURIComponent(user.status)}; path=/; max-age=${SESSION_COOKIE_AGE}; samesite=lax${secureFlag}`;
  }
}

function clearUserCookies() {
  if (typeof document === "undefined") return;
  const isSecure = typeof window !== "undefined" && window.location.protocol === "https:";
  const secureFlag = isSecure ? "; Secure" : "";
  document.cookie = `userRole=; path=/; max-age=0; samesite=lax${secureFlag}`;
  document.cookie = `userStatus=; path=/; max-age=0; samesite=lax${secureFlag}`;
}

const AuthContext = createContext({
  user: null,
  loading: true,
  isLoggedIn: false,
  handleLogout: () => {},
  login: (userData) => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    let token = getAccessToken();
    const refreshToken = getRefreshToken();

    if (!token && !refreshToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    if ((!token || isTokenExpired(token)) && refreshToken) {
      const refreshed = await silentRefresh();
      if (refreshed) {
        token = getAccessToken();
      }
    }

    if (!token) {
      setUser(null);
      clearTokens();
      setLoading(false);
      return;
    }

    try {
      const res = await getMe();
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        setUserCookies(res.data.user);
      } else if (res.status === 401) {
        setUser(null);
        clearTokens();
      }
    } catch (error) {
      console.error("Failed to load user profile:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleLogout = useCallback(() => {
    logout();
    setUser(null);
    clearUserCookies();
  }, []);

  const login = useCallback((userData) => {
    setUser(userData);
    setLoading(false);
    setUserCookies(userData);
  }, []);

  const value = {
    user,
    loading,
    isLoggedIn: !!user,
    handleLogout,
    login,
    refreshUser: fetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuthContext = () => useContext(AuthContext);
