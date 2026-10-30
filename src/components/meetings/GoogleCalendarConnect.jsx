"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/Ui/Toast";
import { googleSignIn } from "@/features/auth/auth";
import { useAuth } from "@/hooks/useAuth";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

export default function GoogleCalendarConnect({ onConnected }) {
  const toast = useToast();
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [gisLoaded, setGisLoaded] = useState(false);

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

  const handleConnect = useCallback(() => {
    if (!window.google?.accounts?.oauth2) {
      toast.error("Google authentication services are loading. Please try again.");
      return;
    }

    const client = window.google.accounts.oauth2.initCodeClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: GOOGLE_SCOPES,
      ux_mode: "popup",
      callback: async (response) => {
        if (response.error) {
          toast.error("Google authentication was cancelled.");
          return;
        }

        setLoading(true);
        try {
          const res = await googleSignIn(response.code);
          if (res.success) {
            toast.success("Google Calendar connected successfully!");
            if (res.data?.user) {
              login(res.data.user);
            }
            onConnected?.();
          } else {
            toast.error(res.message || "Failed to connect Google account.");
          }
        } catch {
          toast.error("Something went wrong with Google connection.");
        } finally {
          setLoading(false);
        }
      },
    });

    client.requestCode({ prompt: "consent" });
  }, [GOOGLE_CLIENT_ID, GOOGLE_SCOPES, login, onConnected, toast]);

  if (user?.isGoogleConnected) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
          <CheckCircleIcon className="h-6 w-6" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-emerald-900">Google Calendar Connected</h4>
          <p className="text-xs text-emerald-700">Google Meet links and calendar invites will be created automatically.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50">
          <svg className="h-6 w-6" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
        </div>
        <div>
          <h4 className="text-sm font-bold text-gray-900 leading-tight">Connect Google Calendar</h4>
          <p className="text-xs text-gray-500 mt-0.5">
            Allow AversA to sync availability and automatically generate Google Meet rooms.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={handleConnect}
        disabled={loading || !gisLoaded}
        className="inline-flex items-center justify-center rounded-xl bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#1d4ed8] disabled:opacity-50 transition"
      >
        {loading ? "Connecting..." : "Connect Now"}
      </button>
    </div>
  );
}
