"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AversALogo from "@/components/Ui/AversALogo";
import {
  SparklesIcon,
  CpuChipIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

const valueStatements = [
  {
    title: "AI that remembers the meeting",
    body: "Transcripts become requirements, risks, and gaps — ready for your team to confirm.",
  },
  {
    title: "From conversation to tasks",
    body: "Estimates, proposals, and domain-tagged work items linked to every REQ.",
  },
  {
    title: "Aligned delivery, every time",
    body: "Google Meet syncs, RBAC, and multi-tenant workspaces keep scope intact.",
  },
];

export default function AuthShell({
  children,
  title = "Welcome to AversA",
  subtitle = "AI product management for client-driven teams",
}) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIdx((prev) => (prev + 1) % valueStatements.length);
    }, 4200);
    return () => clearInterval(id);
  }, []);

  const current = valueStatements[idx];

  return (
    <div className="flex min-h-screen bg-white text-gray-900">
      {/* Left branding panel */}
      <div className="relative hidden w-[48%] overflow-hidden aurora-bg bg-dot-grid-dark lg:flex lg:flex-col lg:justify-between p-10 xl:p-14">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-16 top-20 h-64 w-64 rounded-full bg-blue-600/30 blur-3xl animate-aurora" />
          <div className="absolute bottom-10 right-0 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl animate-aurora" style={{ animationDelay: "2s" }} />
        </div>

        <div className="relative z-10">
          <Link href="/" className="inline-block transition hover:opacity-90">
            <AversALogo size="lg" showTagline inverted />
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-blue-200 backdrop-blur-sm">
            <SparklesIcon className="h-3.5 w-3.5 text-cyan-300" />
            AI Product Management Platform
          </div>

          <h2 className="mt-6 text-3xl font-black tracking-tight text-white xl:text-4xl">
            {title}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">{subtitle}</p>

          <div className="mt-8 min-h-[88px] rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-all">
            <p className="text-sm font-bold text-white">{current.title}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{current.body}</p>
            <div className="mt-4 flex gap-1.5">
              {valueStatements.map((_, i) => (
                <span
                  key={i}
                  className={`h-1 rounded-full transition-all ${
                    i === idx ? "w-6 bg-blue-400" : "w-1.5 bg-white/20"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Mini AI preview */}
          <div className="mt-6 gradient-border rounded-2xl bg-[#0e1219]/80 p-4">
            <div className="flex items-center gap-2 mb-3">
              <CpuChipIcon className="h-4 w-4 text-cyan-300" />
              <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-cyan-200">
                Live extraction preview
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
                <DocumentTextIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" />
                <p className="text-[11px] leading-relaxed text-slate-400">
                  “We need real-time inventory sync before Q3 expansion…”
                </p>
              </div>
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-3 py-2">
                <span className="font-mono text-[10px] font-semibold text-blue-300">
                  REQ-001
                </span>
                <p className="mt-1 text-[11px] text-slate-200">
                  Real-time POS ↔ warehouse inventory sync
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-[11px] text-slate-500">
          © {new Date().getFullYear()} AversA · Secure multi-tenant workspaces
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex w-full flex-col lg:w-[52%]">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 lg:hidden">
          <Link href="/">
            <AversALogo size="sm" showTagline={false} />
          </Link>
          <Link href="/" className="text-xs font-semibold text-gray-500 hover:text-gray-900">
            ← Back
          </Link>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-8">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}
