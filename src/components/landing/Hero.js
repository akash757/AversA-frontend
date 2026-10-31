"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRightIcon,
  SparklesIcon,
  DocumentTextIcon,
  CpuChipIcon,
  ShieldCheckIcon,
  Squares2X2Icon,
  CheckCircleIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import Button from "@/components/Ui/Button";

const tutorialSteps = [
  {
    id: "01",
    tabTitle: "01 · Join Call",
    badge: "Meeting in progress",
    title: "Deep Discovery Meeting",
    subtitle: "Google Meet audio synchronized with speaker diarization",
    content: (
      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] p-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
              <CalendarDaysIcon className="h-4 w-4" />
            </span>
            <div>
              <p className="font-semibold text-white">Retail POS Architecture Sync</p>
              <p className="text-[11px] text-slate-400">4 participants · 38m 12s elapsed</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Recording
          </span>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5 space-y-2 text-xs leading-relaxed text-slate-300">
          <p>
            <span className="font-semibold text-blue-300">Client CTO:</span> &ldquo;We need real-time stock sync across 15 store POS terminals and our central ERP warehouse before Q3 expansion.&rdquo;
          </p>
          <p>
            <span className="font-semibold text-indigo-300">AversA PM:</span> &ldquo;Understood. The target SLA is sub-second synchronization with offline fallback when connectivity drops.&rdquo;
          </p>
        </div>
      </div>
    ),
    aiResult: {
      badge: "AI Listening",
      title: "Audio Stream Analyzed",
      tags: ["POS Sync", "Offline Fallback", "High Priority"],
      message: "Identified 3 core architectural requirements & 1 SLA constraint.",
    },
  },
  {
    id: "02",
    tabTitle: "02 · AI Extracts",
    badge: "AI Extraction Ready",
    title: "Discovered Requirements & Answers",
    subtitle: "Contextual items matched to your Day 1 Discovery Matrix",
    content: (
      <div className="space-y-2">
        {[
          { id: "REQ-001", domain: "backend", text: "Sub-second bidirectional stock sync POS ↔ ERP warehouse" },
          { id: "DEC-002", domain: "architecture", text: "Adopt local SQLite cache for offline register resilience" },
          { id: "REQ-003", domain: "frontend", text: "Store manager tablet dashboard with low-stock alerts" },
        ].map((item) => (
          <div key={item.id} className="rounded-xl border border-white/10 bg-[#07090f]/70 p-3">
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-mono font-bold text-blue-300">{item.id}</span>
              <span className="rounded bg-white/10 px-1.5 py-0.5 uppercase tracking-wide text-slate-300">
                {item.domain}
              </span>
            </div>
            <p className="mt-1.5 text-xs text-slate-200">{item.text}</p>
          </div>
        ))}
      </div>
    ),
    aiResult: {
      badge: "Knowledge Parsed",
      title: "Discovery Matrix Updated",
      tags: ["Questions Answered", "Risks Flagged", "100% Verifiable"],
      message: "Linked directly to verbatim transcript turns for instant auditability.",
    },
  },
  {
    id: "03",
    tabTitle: "03 · Lock Baseline",
    badge: "Scope Confirmed",
    title: "Versioned Scope Baseline (v1.0)",
    subtitle: "Prevent scope creep with an immutable baseline agreed with client",
    content: (
      <div className="space-y-3">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5">
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-300">Baseline v1.0 Locked & Signed Off</span>
          </div>
          <p className="mt-1 text-[11px] text-emerald-200/80">
            14 Requirements · 6 Architecture Decisions · Estimated 340 Engineering Hours
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-center text-xs">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Proposal Value</span>
            <p className="mt-0.5 font-mono text-base font-bold text-white">$48,500</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Target Delivery</span>
            <p className="mt-0.5 font-mono text-base font-bold text-cyan-300">6 Sprints</p>
          </div>
        </div>
      </div>
    ),
    aiResult: {
      badge: "Ready for Delivery",
      title: "Contract Scope Sealed",
      tags: ["Client Approved", "PRD Generated", "Change-Tracked"],
      message: "Any scope modification triggers an automatic change request diff.",
    },
  },
  {
    id: "04",
    tabTitle: "04 · Ship Tasks",
    badge: "Delivery Board",
    title: "Sprint-Ready Domain Tasks",
    subtitle: "Engineered user stories with acceptance criteria & git branch names",
    content: (
      <div className="space-y-2">
        {[
          { tag: "Frontend", title: "POS offline indicator banner & retry queue hook", pts: "3 pts" },
          { tag: "Backend", title: "Redis pub/sub delta sync webhook handler for ERP", pts: "5 pts" },
          { tag: "Design", title: "Tablet barcode scan receiving modal flow", pts: "2 pts" },
        ].map((task, i) => (
          <div key={i} className="flex items-center justify-between rounded-xl border border-white/10 bg-[#07090f]/60 px-3 py-2.5 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-bold text-blue-300 shrink-0">
                {task.tag}
              </span>
              <p className="truncate text-slate-200">{task.title}</p>
            </div>
            <span className="font-mono text-[11px] text-slate-400 shrink-0">{task.pts}</span>
          </div>
        ))}
      </div>
    ),
    aiResult: {
      badge: "Sprint Queued",
      title: "18 Work Items Created",
      tags: ["Jira / Linear Ready", "Full Traceability", "Acceptance Tests"],
      message: "Every ticket links directly back to the original client conversation.",
    },
  },
];

export default function Hero() {
  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const activeStep = tutorialSteps[activeStepIdx];

  // Auto-cycle through the tutorial every 5 seconds if user hasn't clicked recently
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStepIdx((prev) => (prev + 1) % tutorialSteps.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative overflow-hidden aurora-bg-premium bg-dot-grid-dark pt-28 pb-16 sm:pt-36 sm:pb-24 lg:pt-40 lg:pb-28">
      {/* Background ambient orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-20 h-80 w-80 rounded-full bg-blue-600/25 blur-3xl animate-aurora" />
        <div
          className="absolute right-0 top-36 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl animate-aurora"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute bottom-10 left-1/3 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl animate-aurora"
          style={{ animationDelay: "4s" }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top headline block */}
        <div className="mx-auto max-w-3xl text-center animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold text-blue-200 backdrop-blur-md shadow-sm">
            <SparklesIcon className="h-3.5 w-3.5 text-cyan-300" />
            <span>Autonomous AI Product & Project Management Agent</span>
          </div>

          <h1 className="mt-7 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl font-display leading-[1.08]">
            Turn client conversations into{" "}
            <span className="text-gradient">shipped products.</span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
            AversA is the autonomous AI product management and project management agent for the software development lifecycle (SDLC). We listen to client discovery calls, structure PRDs, lock scope baselines, and dispatch sprint tasks.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              href="/signup"
              variant="secondary"
              size="lg"
              rightIcon={<ArrowRightIcon className="h-4 w-4" />}
            >
              Start Free Workspace
            </Button>
            <Button
              href="#how-we-work"
              variant="outline"
              size="lg"
              className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30 backdrop-blur-sm"
            >
              Interactive Tutorial Walkthrough
            </Button>
          </div>
        </div>

        {/* ── Interactive Tutorial Tour Product Mockup ──────────────────── */}
        <div className="relative mx-auto mt-14 max-w-5xl animate-fade-up sm:mt-18" style={{ animationDelay: "120ms" }}>
          <div className="gradient-border rounded-3xl bg-[#0e1219]/95 p-3 shadow-2xl shadow-blue-950/60 sm:p-5 backdrop-blur-xl">

            {/* Window bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-3 mb-4 gap-2">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span className="ml-2 font-mono text-[11px] text-slate-400">
                  aversa.ai / interactive-tutorial
                </span>
              </div>

              {/* Step indicator pills */}
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
                {tutorialSteps.map((s, idx) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setActiveStepIdx(idx)}
                    className={[
                      "rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all duration-200 shrink-0",
                      idx === activeStepIdx
                        ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30"
                        : "text-slate-400 hover:text-white hover:bg-white/5",
                    ].join(" ")}
                  >
                    {s.tabTitle}
                  </button>
                ))}
              </div>
            </div>

            {/* 2-Column interactive demo */}
            <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
              {/* Left pane: Workspace step view */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition-all">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DocumentTextIcon className="h-4 w-4 text-slate-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      {activeStep.title}
                    </span>
                  </div>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 font-mono text-[10px] text-slate-300">
                    Step {activeStep.id} of 04
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mb-3">{activeStep.subtitle}</p>

                {/* Dynamic Step Content */}
                {activeStep.content}
              </div>

              {/* Right pane: AI intelligence engine */}
              <div className="rounded-2xl border border-blue-500/25 bg-gradient-to-br from-blue-500/10 via-violet-500/10 to-cyan-500/10 p-4 text-left flex flex-col justify-between">
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CpuChipIcon className="h-4 w-4 text-cyan-300" />
                      <span className="text-xs font-bold uppercase tracking-wider text-cyan-200">
                        AversA Intelligence
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-cyan-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      {activeStep.aiResult.badge}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white font-display">
                    {activeStep.aiResult.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
                    {activeStep.aiResult.message}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {activeStep.aiResult.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-lg border border-white/10 bg-[#07090f]/70 px-2 py-1 text-[10px] font-medium text-slate-300"
                      >
                        ✓ {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom step switcher navigation */}
                <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Click tabs above or navigate →
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveStepIdx((prev) => (prev + 1) % tutorialSteps.length)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20 transition-colors"
                  >
                    <span>Next: {tutorialSteps[(activeStepIdx + 1) % tutorialSteps.length].tabTitle}</span>
                    <ArrowRightIcon className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Underlying gradient glow */}
          <div className="pointer-events-none absolute -inset-4 -z-10 rounded-[2.5rem] bg-gradient-to-r from-blue-600/25 via-violet-600/20 to-cyan-500/20 blur-2xl" />
        </div>
      </div>
    </section>
  );
}
