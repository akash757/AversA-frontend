/**
 * Auth Service — all authentication API calls.
 *
 * Endpoints mirror the backend auth routes:
 *   POST /api/auth/signup
 *   POST /api/auth/signin
 *   POST /api/auth/forgot-password
 *   POST /api/auth/reset-password/:token
 *   POST /api/auth/refresh-token
 *   GET  /api/auth/me               (protected)
 *   PATCH /api/auth/profile         (protected)
 *   PUT  /api/auth/change-password   (protected)
 */

import api, { setTokens, clearTokens, SESSION_COOKIE_AGE } from "@/lib/api/api";

function setAuthCookies(data) {
  if (!data) return;
  setTokens(data.accessToken, data.refreshToken);
  if (data.user && typeof document !== "undefined") {
    const isSecure = typeof window !== "undefined" && window.location.protocol === "https:";
    const secureFlag = isSecure ? "; Secure" : "";
    const cookieAge = SESSION_COOKIE_AGE || 60 * 60 * 24 * 7;
    if (data.user.role) {
      document.cookie = `userRole=${encodeURIComponent(data.user.role)}; path=/; max-age=${cookieAge}; samesite=lax${secureFlag}`;
    }
    if (data.user.status) {
      document.cookie = `userStatus=${encodeURIComponent(data.user.status)}; path=/; max-age=${cookieAge}; samesite=lax${secureFlag}`;
    }
  }
}

// ── Sign Up ────────────────────────────────────────
export async function signUp({ firstName, lastName, email, password, phone, role, organizationSlug }) {
  const res = await api.post("/auth/signup", {
    firstName,
    lastName,
    email,
    password,
    ...(phone && { phone }),
    ...(role && { role }),
    ...(organizationSlug && { organizationSlug }),
  });

  if (res.success && res.data) {
    setAuthCookies(res.data);
  }

  return res;
}

// ── Sign In ────────────────────────────────────────
export async function signIn({ email, password }) {
  const res = await api.post("/auth/signin", { email, password });

  if (res.success && res.data) {
    setAuthCookies(res.data);
  }

  return res;
}

// ── Google Sign In ─────────────────────────────────
export async function googleSignIn(code, role, orgSlug) {
  const res = await api.post("/auth/google", { 
    code, 
    ...(role && { role }),
    ...(orgSlug && { organizationSlug: orgSlug })
  });

  if (res.success && res.data) {
    setAuthCookies(res.data);
  }

  return res;
}

// ── Forgot Password ────────────────────────────────
export async function forgotPassword(email) {
  return api.post("/auth/forgot-password", { email });
}

// ── Reset Password (with token from email link) ────
export async function resetPassword(token, password) {
  return api.post(`/auth/reset-password/${token}`, { password });
}

// ── Get Current User (Protected) ───────────────────
export async function getMe() {
  return api.get("/auth/me", { auth: true });
}

export async function changePassword(currentPassword, newPassword) {
  return api.put(
    "/auth/change-password",
    { currentPassword, newPassword },
    { auth: true }
  );
}

// ── Update Profile (Protected) ────────────────────
export async function updateProfile(data) {
  return api.patch("/auth/profile", data, { auth: true });
}

// ── Logout (client-side only) ──────────────────────
export function logout() {
  clearTokens();
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}
