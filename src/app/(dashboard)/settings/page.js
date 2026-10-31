"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api/api";
import {
  UserCircleIcon,
  BuildingOfficeIcon,
  UsersIcon,
  ChevronRightIcon,
  FolderIcon,
  CpuChipIcon,
  ArrowPathIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import Loader from "@/components/Ui/Loader";

const SETTINGS_CARDS = [
  {
    title: "Profile & Account",
    description: "Manage your personal profile, credentials, contact info, and preferences.",
    href: "/settings/profile",
    icon: UserCircleIcon,
    color: "bg-blue-50 text-[#2563EB] border border-blue-100",
    roles: ["admin", "superadmin", "developer", "product_manager", "project_manager", "qa", "sales", "devops", "client"],
  },
  {
    title: "Team & Permissions",
    description: "Invite colleagues, assign operational roles, and review pending access requests.",
    href: "/users",
    icon: UsersIcon,
    color: "bg-purple-50 text-purple-600 border border-purple-100",
    roles: ["admin", "superadmin"],
  },
  {
    title: "Organizations",
    description: "Configure workspace settings, organization slug, and multi-tenant domains.",
    href: "/organizations",
    icon: BuildingOfficeIcon,
    color: "bg-cyan-50 text-cyan-600 border border-cyan-100",
    roles: ["superadmin", "admin"],
  },
  {
    title: "Projects Portfolio",
    description: "View and configure project stage discovery roadmaps and client assignments.",
    href: "/projects",
    icon: FolderIcon,
    color: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    roles: ["admin", "superadmin", "developer", "product_manager", "project_manager"],
  },
];

export default function SettingsPage() {
  const { user, loading } = useAuth();

  // AI Health State
  const [aiHealth, setAiHealth] = useState(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);

  const checkHealth = async () => {
    setIsCheckingHealth(true);
    try {
      const res = await api.get("/health/ai");
      if (res?.success && res.data) {
        setAiHealth({
          status: res.data.status || "healthy",
          latencyMs: res.data.latencyMs ?? 0,
        });
      } else {
        setAiHealth({
          status: "unhealthy",
          latencyMs: res?.data?.latencyMs ?? null,
        });
      }
      setLastChecked(new Date().toLocaleTimeString());
    } catch {
      setAiHealth({ status: "unhealthy", latencyMs: null });
      setLastChecked(new Date().toLocaleTimeString());
    } finally {
      setIsCheckingHealth(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  if (loading) {
    return <Loader />;
  }

  const visibleCards = SETTINGS_CARDS.filter(
    (card) => !card.roles || card.roles.includes(user?.role)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900">
            System Settings & Preferences
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure personal account credentials, team permissions, and workspace parameters.
          </p>
        </div>

        {/* Development Mode API Docs Link */}
        {process.env.NODE_ENV !== "production" && (
          <a
            href="http://localhost:5000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-2xs transition self-start sm:self-auto"
          >
            <DocumentTextIcon className="h-4 w-4 text-[#2563EB]" />
            <span>Interactive API Docs</span>
          </a>
        )}
      </div>

      {/* Settings Navigation Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2">
        {visibleCards.map((card, index) => (
          <Link
            key={index}
            href={card.href}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-xs transition hover:border-[#2563EB] hover:shadow-md"
          >
            <div>
              <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${card.color} group-hover:scale-105 transition-transform`}>
                <card.icon className="h-6 w-6" />
              </div>

              <h3 className="text-base font-bold text-gray-900 group-hover:text-[#2563EB] transition-colors">
                {card.title}
              </h3>
              <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                {card.description}
              </p>
            </div>

            <div className="mt-6 flex items-center text-xs font-semibold text-[#2563EB]">
              <span>Open Configuration</span>
              <ChevronRightIcon className="ml-1 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>

      {/* Production Health & AI Engine Diagnostic Status Panel */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-700 border border-purple-100">
              <CpuChipIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                AI Inference Engine Diagnostic
              </h3>
              <p className="text-xs text-gray-500">
                Direct health check to Gemini 2.5 Flash Lite microservice cluster without exposing internal host addresses.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isCheckingHealth}
            onClick={checkHealth}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 shadow-2xs transition self-start sm:self-auto"
          >
            <ArrowPathIcon className={`h-3.5 w-3.5 ${isCheckingHealth ? "animate-spin" : ""}`} />
            <span>{isCheckingHealth ? "Pinging…" : "Ping AI Service"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-gray-100">
          <div className="rounded-xl bg-gray-50/70 border border-gray-200/80 p-3 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600">Engine Status:</span>
            <div className="flex items-center gap-1.5">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  aiHealth?.status === "healthy"
                    ? "bg-emerald-500 animate-pulse"
                    : "bg-rose-500"
                }`}
              />
              <strong className="text-xs font-bold capitalize text-gray-900">
                {aiHealth?.status || "Checking…"}
              </strong>
            </div>
          </div>

          <div className="rounded-xl bg-gray-50/70 border border-gray-200/80 p-3 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600">Roundtrip Latency:</span>
            <strong className="text-xs font-bold text-gray-900">
              {aiHealth?.latencyMs !== null && aiHealth?.latencyMs !== undefined
                ? `${aiHealth.latencyMs} ms`
                : "N/A"}
            </strong>
          </div>

          <div className="rounded-xl bg-gray-50/70 border border-gray-200/80 p-3 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600">Last Checked:</span>
            <span className="text-xs font-semibold text-gray-700">
              {lastChecked || "Never"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
