/**
 * API Client - central fetch wrapper for backend calls.
 *
 * - Base URL resolves safely without baking in private internal IP addresses.
 * - Defaults to relative /api in browser environments under reverse proxy.
 * - Attaches JWT access token for authenticated requests.
 * - Handles 401 with silent refresh and retry.
 * - Enforces short-lived secure session cookies.
 */

function resolveBaseUrl() {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    const raw = process.env.NEXT_PUBLIC_API_BASE_URL.trim().replace(/\/+$/, "");
    return raw.endsWith("/api") ? raw : `${raw}/api`;
  }
  // Browser fallback defaults to relative /api under reverse proxy (preventing private IP leaks)
  if (typeof window !== "undefined") {
    return "/api";
  }
  return process.env.NODE_ENV === "production" ? "/api" : "http://localhost:5000/api";
}

export const BASE_URL = resolveBaseUrl();
// Access token cookie expiry aligned with 15-minute access token lifetime
const ACCESS_TOKEN_COOKIE_AGE = 60 * 15;
const REQUEST_TIMEOUT_MS = 60000; // Increased to 60s for long AI requests

// Token helpers
export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

export function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refreshToken");
}

export function setTokens(accessToken, refreshToken) {
  localStorage.setItem("accessToken", accessToken);
  if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
  if (typeof document !== "undefined" && accessToken) {
    const isSecure = typeof window !== "undefined" && window.location.protocol === "https:";
    const secureFlag = isSecure ? "; Secure" : "";
    document.cookie = `accessToken=${encodeURIComponent(accessToken)}; path=/; max-age=${ACCESS_TOKEN_COOKIE_AGE}; samesite=lax${secureFlag}`;
  }
}

export function clearTokens() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  if (typeof document !== "undefined") {
    const isSecure = typeof window !== "undefined" && window.location.protocol === "https:";
    const secureFlag = isSecure ? "; Secure" : "";
    document.cookie = `accessToken=; path=/; max-age=0; samesite=lax${secureFlag}`;
    document.cookie = `userRole=; path=/; max-age=0; samesite=lax${secureFlag}`;
    document.cookie = `userStatus=; path=/; max-age=0; samesite=lax${secureFlag}`;
  }
}

function normalizeErrorMessage(error) {
  if (error?.name === "AbortError") {
    return "Request timed out. Please try again.";
  }
  return error?.message || "Network request failed. Please try again.";
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function parseJsonSafely(response) {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return {
      success: false,
      status: response.status,
      message: "Unexpected server response format.",
      data: null,
    };
  }
}

function toResponseEnvelope(payload, response) {
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    const withStatus =
      typeof payload.status === "number" ? payload : { ...payload, status: response.status };

    if (typeof withStatus.success === "boolean") {
      return withStatus;
    }

    return { ...withStatus, success: response.ok };
  }

  return {
    success: response.ok,
    status: response.status,
    message: response.ok ? "" : "Request failed.",
    data: payload ?? null,
  };
}

// Core request function
async function request(endpoint, options = {}) {
  const { body, headers: customHeaders, auth = false, ...rest } = options;

  const headers = {
    "Content-Type": "application/json",
    ...customHeaders,
  };

  // Attach Bearer token for authenticated requests.
  if (auth) {
    const token = getAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const config = {
    ...rest,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  try {
    const res = await fetchWithTimeout(`${BASE_URL}${path}`, config);
    const parsed = await parseJsonSafely(res);
    const data = toResponseEnvelope(parsed, res);

    // If 401 and we have a refresh token, try silent refresh then retry once.
    if (res.status === 401 && auth && getRefreshToken()) {
      const refreshed = await silentRefresh();
      if (refreshed) {
        const retryHeaders = {
          ...headers,
          Authorization: `Bearer ${getAccessToken()}`,
        };

        const retryRes = await fetchWithTimeout(`${BASE_URL}${path}`, {
          ...config,
          headers: retryHeaders,
        });
        const retryParsed = await parseJsonSafely(retryRes);
        return toResponseEnvelope(retryParsed, retryRes);
      }

      // Refresh failed, clear tokens and route to login.
      clearTokens();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }

      return {
        success: false,
        status: 401,
        message: "Session expired. Please log in again.",
        data: null,
      };
    }

    return data;
  } catch (error) {
    return {
      success: false,
      status: 0,
      message: normalizeErrorMessage(error),
      data: null,
    };
  }
}

// Silent token refresh
async function silentRefresh() {
  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    const res = await fetchWithTimeout(`${BASE_URL}/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    const parsed = await parseJsonSafely(res);
    const data = toResponseEnvelope(parsed, res);

    if (data.success && data.data?.accessToken) {
      setTokens(data.data.accessToken, refreshToken);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// Convenience methods
export const api = {
  get: (endpoint, options = {}) => request(endpoint, { method: "GET", ...options }),
  post: (endpoint, body, options = {}) => request(endpoint, { method: "POST", body, ...options }),
  put: (endpoint, body, options = {}) => request(endpoint, { method: "PUT", body, ...options }),
  patch: (endpoint, body, options = {}) => request(endpoint, { method: "PATCH", body, ...options }),
  delete: (endpoint, options = {}) => request(endpoint, { method: "DELETE", ...options }),
};

export default api;
