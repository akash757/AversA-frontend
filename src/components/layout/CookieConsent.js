"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Button from "@/components/Ui/Button";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("aversa_cookie_consent");
      if (!consent) {
        // Small delay so it smoothly animates after initial load
        const timer = setTimeout(() => setVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleAcceptAll = () => {
    try {
      const all = { necessary: true, functional: true, analytics: true };
      localStorage.setItem("aversa_cookie_consent", JSON.stringify(all));
      localStorage.setItem("aversa_consent_timestamp", new Date().toISOString());
      setVisible(false);
    } catch {
      setVisible(false);
    }
  };

  const handleDeclineOptional = () => {
    try {
      const min = { necessary: true, functional: false, analytics: false };
      localStorage.setItem("aversa_cookie_consent", JSON.stringify(min));
      localStorage.setItem("aversa_consent_timestamp", new Date().toISOString());
      setVisible(false);
    } catch {
      setVisible(false);
    }
  };

  if (!visible) return null;

  return (
    <aside
      aria-label="Cookie consent banner"
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-4xl animate-fade-up rounded-2xl border border-gray-200/90 bg-white/95 p-4 sm:p-5 shadow-2xl backdrop-blur-md sm:bottom-6 sm:left-6 sm:right-6"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
            <ShieldCheckIcon className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-semibold text-gray-950">
              Your Privacy & Cookie Choices
            </p>
            <p className="text-xs text-gray-600 leading-relaxed max-w-2xl">
              AversA uses essential cookies to ensure safe workspace authentication and optimal performance for our AI Product Management Agent. By continuing, you agree to our{" "}
              <Link href="/privacy" className="font-medium text-blue-600 hover:underline">
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link href="/consent" className="font-medium text-blue-600 hover:underline">
                Consent Settings
              </Link>.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0 sm:self-end md:self-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeclineOptional}
          >
            Essential Only
          </Button>

          <Button
            href="/consent"
            variant="outline"
            size="sm"
          >
            Preferences
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleAcceptAll}
          >
            Accept All
          </Button>
        </div>
      </div>
    </aside>
  );
}
