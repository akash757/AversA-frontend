"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/Ui/Toast";
import { useAuth } from "@/hooks/useAuth";
import { signIn, googleSignIn } from "@/features/auth/auth";
import { getDashboardHomeRoute } from "@/lib/auth/dashboard-config";
import AuthShell from "@/components/auth/AuthShell";
import AuthField from "@/components/auth/AuthField";
import PasswordInput from "@/components/auth/PasswordInput";
import GoogleButton from "@/components/auth/GoogleButton";

function getSafeRedirectTarget(target, fallback) {
  if (
    target &&
    typeof target === "string" &&
    target.startsWith("/") &&
    !target.startsWith("//") &&
    !target.startsWith("/login") &&
    !target.startsWith("/signup")
  ) {
    return target;
  }
  return fallback;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const { login, isLoggedIn, loading: authLoading, dashboardPath } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [gisLoaded, setGisLoaded] = useState(false);

  const nextParam = searchParams.get("next");
  const dashboardHome = getDashboardHomeRoute();

  useEffect(() => {
    if (!authLoading && isLoggedIn && dashboardPath) {
      const destination = getSafeRedirectTarget(nextParam, dashboardPath);
      router.replace(destination);
    }
  }, [isLoggedIn, authLoading, dashboardPath, router, nextParam]);

  const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const GOOGLE_SCOPES = [
    "openid",
    "email",
    "profile",
    "https://www.googleapis.com/auth/calendar.events",
  ].join(" ");

  useEffect(() => {
    if (document.getElementById("google-gis-script") && window.google?.accounts?.oauth2) {
      setGisLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "google-gis-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setGisLoaded(true);
    document.head.appendChild(script);
  }, []);

  const handleGoogleLogin = useCallback(() => {
    if (!window.google?.accounts?.oauth2) {
      toast.error("Google Sign-In is loading. Please try again.");
      return;
    }

    const client = window.google.accounts.oauth2.initCodeClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: GOOGLE_SCOPES,
      ux_mode: "popup",
      callback: async (response) => {
        if (response.error) {
          toast.error("Google sign-in was cancelled.");
          return;
        }

        setGoogleLoading(true);
        try {
          const res = await googleSignIn(response.code);
          if (res.success) {
            toast.success("Welcome to AversA!");
            login(res.data.user);
            const destination = getSafeRedirectTarget(nextParam, dashboardHome);
            router.push(destination);
          } else {
            toast.error(res.message || "Google authentication failed.");
          }
        } catch {
          toast.error("Something went wrong with Google sign-in.");
        } finally {
          setGoogleLoading(false);
        }
      },
    });

    client.requestCode({ prompt: "consent" });
  }, [GOOGLE_CLIENT_ID, GOOGLE_SCOPES, dashboardHome, login, nextParam, router, toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await signIn({ email, password });

      if (res.success) {
        toast.success("Welcome back to AversA!");
        login(res.data.user);
        const destination = getSafeRedirectTarget(nextParam, dashboardHome);
        router.push(destination);
      } else {
        toast.error(res.message || "Invalid email or password.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Orchestrate product intelligence"
      subtitle="Sign in to run discovery, AI analysis, and delivery from one workspace."
    >
      <div className="rounded-3xl border border-gray-200 bg-white p-7 shadow-lg shadow-gray-200/50 sm:p-8">
        <h1 className="text-2xl font-black tracking-tight text-gray-950">Sign in</h1>
        <p className="mt-1.5 text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-blue-600 hover:text-blue-700">
            Sign up
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <AuthField
            label="Work email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            autoComplete="email"
          />

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="block text-sm font-semibold text-gray-700">Password</label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-gray-500 hover:text-blue-600"
              >
                Forgot password?
              </Link>
            </div>
            <PasswordInput
              id="login-password"
              label={null}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex h-11 w-full items-center justify-center rounded-xl bg-gray-950 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-50 active:scale-[0.99]"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Signing in…
              </span>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            or
          </span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <GoogleButton
          onClick={handleGoogleLogin}
          loading={googleLoading}
          disabled={!gisLoaded}
        />
      </div>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white text-sm text-gray-500">
          Loading…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
