"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AversALogo from "@/components/Ui/AversALogo";
import {
  SparklesIcon,
  CpuChipIcon,
  DocumentTextIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

const features = [
  {
    icon: SparklesIcon,
    title: "AI that remembers the meeting",
    body: "Transcripts become requirements, risks, and gaps — ready for your team to confirm.",
  },
  {
    icon: CpuChipIcon,
    title: "From conversation to tasks",
    body: "Estimates, proposals, and domain-tagged work items linked to every requirement.",
  },
  {
    icon: CheckCircleIcon,
    title: "Aligned delivery, every time",
    body: "Google Meet sync, RBAC, and multi-tenant workspaces keep scope intact across your team.",
  },
];

export default function AuthShell({
  children,
  title = "Welcome to AversA",
  subtitle = "AI product management for client-driven teams",
}) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIdx((v) => (v + 1) % features.length), 4500);
    return () => clearInterval(id);
  }, []);

  const current = features[idx];
  const Icon = current.icon;

  return (
    <div className="flex min-h-screen bg-white text-[#0F172A]">

      {/* ── Left branding panel ──────────────────── */}
      <div className="relative hidden lg:flex lg:w-[46%] xl:w-[44%] flex-col justify-between overflow-hidden aurora-bg-premium">
        {/* Background glows */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-16 top-20 h-72 w-72 rounded-full bg-[#2563EB]/30 blur-3xl animate-aurora" />
          <div
            className="absolute bottom-10 right-0 h-80 w-80 rounded-full bg-[#7C3AED]/20 blur-3xl animate-aurora"
            style={{ animationDelay: "2s" }}
          />
          <div
            className="absolute top-1/2 left-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0891B2]/15 blur-2xl animate-aurora"
            style={{ animationDelay: "4s" }}
          />
        </div>

        {/* Top: Logo */}
        <div className="relative z-10 p-10 xl:p-12">
          <Link href="/" className="inline-block transition hover:opacity-90">
            <AversALogo size="md" showTagline inverted />
          </Link>
        </div>

        {/* Middle: Feature carousel */}
        <div className="relative z-10 px-10 xl:px-12 pb-10">
          {/* AI badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-[11px] font-semibold text-blue-200 backdrop-blur-sm">
            <SparklesIcon className="h-3.5 w-3.5 text-cyan-300" />
            AI Product Management Platform
          </div>

          <h2 className="text-3xl font-black tracking-tight text-white xl:text-4xl font-display leading-tight">
            {title}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-300 max-w-xs">
            {subtitle}
          </p>

          {/* Feature card */}
          <div
            key={idx}
            className="mt-8 rounded-[20px] border border-white/10 bg-white/5 p-5 backdrop-blur-sm animate-fade-up"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-white/10 bg-white/10">
                <Icon className="h-4.5 w-4.5 text-cyan-300" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">{current.title}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-slate-400">{current.body}</p>
              </div>
            </div>

            {/* Progress dots */}
            <div className="mt-4 flex gap-1.5">
              {features.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIdx(i)}
                  className={[
                    "h-1 rounded-full transition-all duration-300",
                    i === idx ? "w-6 bg-blue-400" : "w-1.5 bg-white/20",
                  ].join(" ")}
                  aria-label={`Feature ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Mini extraction preview */}
          <div className="mt-5 gradient-border rounded-[18px] bg-[#0e1219]/80 p-4">
            <div className="flex items-center gap-2 mb-3">
              <CpuChipIcon className="h-4 w-4 text-cyan-300" />
              <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-cyan-200">
                Live extraction preview
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2 rounded-[10px] border border-white/10 bg-white/[0.03] p-2.5">
                <DocumentTextIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" />
                <p className="text-[11px] leading-relaxed text-slate-400">
                  &ldquo;We need real-time inventory sync before Q3 expansion…&rdquo;
                </p>
              </div>
              <div className="rounded-[10px] border border-blue-500/20 bg-blue-500/10 px-3 py-2">
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

        {/* Bottom: Copyright */}
        <p className="relative z-10 px-10 pb-8 xl:px-12 text-[11px] text-slate-600">
          © {new Date().getFullYear()} AversA · Secure multi-tenant workspaces
        </p>
      </div>

      {/* ── Right form panel ────────────────────── */}
      <div className="flex w-full flex-col lg:w-[54%] xl:w-[56%]">
        {/* Desktop top header */}
        <div className="hidden lg:flex items-center justify-end px-8 pt-6">
          <Link
            href="/"
            className="text-xs font-semibold text-gray-500 hover:text-gray-950 transition-colors inline-flex items-center gap-1"
          >
            ← Back to Homepage
          </Link>
        </div>

        {/* Mobile header */}
        <div className="flex items-center justify-between border-b border-[#F1F5F9] px-5 py-4 lg:hidden">
          <Link href="/">
            <AversALogo size="sm" showTagline={false} />
          </Link>
          <Link
            href="/"
            className="text-xs font-semibold text-[#94A3B8] hover:text-[#0F172A] transition-colors"
          >
            ← Back
          </Link>
        </div>

        {/* Form area */}
        <div className="flex flex-1 flex-col items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-[420px]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
