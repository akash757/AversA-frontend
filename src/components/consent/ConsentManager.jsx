"use client";

import { useState, useEffect } from "react";
import Button from "@/components/Ui/Button";
import Badge from "@/components/Ui/Badge";
import Divider from "@/components/Ui/Divider";
import { useToast } from "@/components/Ui/Toast";
import {
  ShieldCheckIcon,
  CheckCircleIcon,
  Cog6ToothIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

export default function ConsentManager() {
  const toast = useToast();
  const [preferences, setPreferences] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("aversa_cookie_consent");
        if (stored) {
          return { necessary: true, functional: true, analytics: false, ...JSON.parse(stored) };
        }
      } catch {
        // fallback
      }
    }
    return {
      necessary: true,
      functional: true,
      analytics: false,
    };
  });
  const [saved, setSaved] = useState(false);

  const handleToggle = (key) => {
    if (key === "necessary") return;
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    try {
      localStorage.setItem("aversa_cookie_consent", JSON.stringify(preferences));
      localStorage.setItem("aversa_consent_timestamp", new Date().toISOString());
      setSaved(true);
      toast.success("Cookie consent preferences saved successfully.");
      setTimeout(() => setSaved(false), 3000);
    } catch {
      toast.error("Failed to update preferences. Local storage might be disabled.");
    }
  };

  const handleAcceptAll = () => {
    const all = { necessary: true, functional: true, analytics: true };
    setPreferences(all);
    try {
      localStorage.setItem("aversa_cookie_consent", JSON.stringify(all));
      localStorage.setItem("aversa_consent_timestamp", new Date().toISOString());
      setSaved(true);
      toast.success("All cookies and functional services accepted.");
      setTimeout(() => setSaved(false), 3000);
    } catch {
      toast.error("Failed to save consent.");
    }
  };

  const handleRejectOptional = () => {
    const minimal = { necessary: true, functional: false, analytics: false };
    setPreferences(minimal);
    try {
      localStorage.setItem("aversa_cookie_consent", JSON.stringify(minimal));
      localStorage.setItem("aversa_consent_timestamp", new Date().toISOString());
      setSaved(true);
      toast.info("Optional cookies declined. Only essential security cookies will be stored.");
      setTimeout(() => setSaved(false), 3000);
    } catch {
      toast.error("Failed to update preferences.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Category 1: Strictly Necessary */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-950 sm:text-base">
                1. Strictly Necessary Cookies
              </h3>
              <Badge variant="success" size="sm">Always Active</Badge>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              These cookies are essential for you to browse the website, authenticate to your AversA organization workspace, and access secure project matrices. Without these, core session security and CSRF protection cannot operate.
            </p>
          </div>
          <div className="shrink-0 pt-1">
            <input
              type="checkbox"
              checked={true}
              disabled
              className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 cursor-not-allowed opacity-60"
            />
          </div>
        </div>
      </div>

      {/* Category 2: Functional & AI Discovery State */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-950 sm:text-base">
                2. Functional & Discovery State Cookies
              </h3>
              <Badge variant="blue" size="sm">Recommended</Badge>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Enables personalized UI memory, such as preserving your active project view, saving in-flight meeting notes before form submission, and remembering your audio diarization layout preferences.
            </p>
          </div>
          <div className="shrink-0 pt-1">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.functional}
                onChange={() => handleToggle("functional")}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Category 3: Performance & Analytics */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-950 sm:text-base">
                3. Performance & Diagnostic Telemetry
              </h3>
              <Badge variant="neutral" size="sm">Optional</Badge>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Provides anonymous, aggregated metrics on page load times, LLM inference latency, and feature usage to help our engineering team optimize platform speed across the Software Development Lifecycle (SDLC).
            </p>
          </div>
          <div className="shrink-0 pt-1">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.analytics}
                onChange={() => handleToggle("analytics")}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      <Divider />

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <Button
            variant="primary"
            size="md"
            onClick={handleSave}
            leftIcon={<ShieldCheckIcon className="h-4 w-4" />}
          >
            {saved ? "Preferences Saved" : "Save Preferences"}
          </Button>

          <Button
            variant="outline"
            size="md"
            onClick={handleAcceptAll}
            leftIcon={<CheckCircleIcon className="h-4 w-4" />}
          >
            Accept All
          </Button>

          <Button
            variant="ghost"
            size="md"
            onClick={handleRejectOptional}
          >
            Reject Optional
          </Button>
        </div>

        <p className="text-xs text-gray-500 text-center sm:text-right">
          You can revisit and modify these preferences at any time.
        </p>
      </div>
    </div>
  );
}
