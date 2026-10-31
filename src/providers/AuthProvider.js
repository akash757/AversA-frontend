"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getMe, logout } from "@/features/auth/auth";
import { getAccessToken, getRefreshToken, silentRefresh, isTokenExpired } from "@/lib/api/api";

const SESSION_COOKIE_AGE = 60 * 60 * 24 * 7;

function setUserCookies(user) {
  if (typeof document === "undefined" || !user) return;
  if (user.role) {
    document.cookie = `userRole=${encodeURIComponent(user.role)}; path=/; max-age=${SESSION_COOKIE_AGE}; samesite=lax`;
  }
  if (user.status) {
    document.cookie = `userStatus=${encodeURIComponent(user.status)}; path=/; max-age=${SESSION_COOKIE_AGE}; samesite=lax`;
  }
}

function clearUserCookies() {
  if (typeof document === "undefined") return;
  document.cookie = "userRole=; path=/; max-age=0; samesite=lax";
  document.cookie = "userStatus=; path=/; max-age=0; samesite=lax";
}

const AuthContext = createContext({
  user: null,
  loading: true,
  isLoggedIn: false,
  handleLogout: () => {},
  login: () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    let token = getAccessToken();

    // Silently refresh before fetching if token is expired or expiring
    if ((!token || isTokenExpired(token)) && getRefreshToken()) {
      const refreshed = await silentRefresh();
      if (refreshed) {
        token = getAccessToken();
      }
    }

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await getMe();
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        setUserCookies(res.data.user);
      } else {
        setUser(null);
        clearUserCookies();
      }
    } catch {
      setUser(null);
      clearUserCookies();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Proactively refresh access token every 10 minutes while active
  useEffect(() => {
    if (!user) return;
    const intervalId = setInterval(async () => {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        await silentRefresh();
      }
    }, 10 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [user]);

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
