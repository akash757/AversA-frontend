"use client";

import { useState, useEffect, useRef } from "react";
import {
  SparklesIcon,
  VideoCameraIcon,
  CpuChipIcon,
  RocketLaunchIcon,
  CheckCircleIcon,
  CommandLineIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  ArrowsPointingOutIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import Badge from "@/components/Ui/Badge";
import Button from "@/components/Ui/Button";

const WORKFLOW_STEPS = [
  {
    id: "01",
    tag: "Phase 01 // Blueprint Seeding",
    title: "Raw Idea Ingestion → 8 Discovery Topic Vectors",
    shortTitle: "1. Idea & Discovery",
    icon: SparklesIcon,
    accentColor: "blue",
    badgeLabel: "Pre-Call Matrix Ready",
    narrative:
      "Before your kickoff call, AversA ingests the raw product brief and synthesizes a domain-aware question matrix across Architecture, Security, Data Pipeline, and User Flows.",
    outcome: "12 precision questions ready before you join the call — zero blank stares.",
    metrics: [
      { label: "AI Model", value: "Gemini 2.5 Flash" },
      { label: "Readiness", value: "100% Seeded" },
    ],
    visualType: "discovery",
  },
  {
    id: "02",
    tag: "Phase 02 // Call Diarization",
    title: "Live Meet Stream & Verbatim Audio Diarization",
    shortTitle: "2. Meet & Transcribe",
    icon: VideoCameraIcon,
    accentColor: "cyan",
    badgeLabel: "48kHz Live Audio",
    narrative:
      "AversA joins Google Meet, captures high-fidelity audio, separates multi-speaker discussions with voice recognition, and aligns verbatim dialogue turns in real time.",
    outcome: "Zero rushed notes. Every second of client negotiation is indexed with millisecond precision.",
    metrics: [
      { label: "Speech Engine", value: "Dual-Channel 48kHz" },
      { label: "Accuracy", value: "99.4% Precision" },
    ],
    visualType: "meet",
  },
  {
    id: "03",
    tag: "Phase 03 // Scope Synthesis",
    title: "Gemini AI Synthesizes Scope into Locked PRD",
    shortTitle: "3. PRD & Baseline Lock",
    icon: CpuChipIcon,
    accentColor: "violet",
    badgeLabel: "Scope Baseline Frozen",
    narrative:
      "The AI reasoning engine parses the transcript, generates unambiguous requirement IDs (REQ), catalogs technical decisions, guards scope boundaries, and prepares the client baseline.",
    outcome: "Scope creep blocked. Stakeholders sign off on immutable baseline v1.0.",
    metrics: [
      { label: "Requirements", value: "18 Verified REQs" },
      { label: "Baseline", value: "v1.0 Frozen" },
    ],
    visualType: "synthesis",
  },
  {
    id: "04",
    tag: "Phase 04 // Sprint Handoff",
    title: "One-Click Sprint Tasks Shipped to Engineering",
    shortTitle: "4. Shipped to Code",
    icon: RocketLaunchIcon,
    accentColor: "emerald",
    badgeLabel: "Ready to Code",
    narrative:
      "One click converts the frozen baseline into sprint-ready engineering tickets across Frontend, Backend, and DevOps — complete with acceptance criteria, git branch names, and verification criteria.",
    outcome: "Sprint kicks off immediately. Zero guesswork for developers.",
    metrics: [
      { label: "Sprint Tickets", value: "14 Tasks Linked" },
      { label: "Cycle Speed", value: "4.2x Faster" },
    ],
    visualType: "shipping",
  },
];

export default function FeatureBento() {
  const [activeStep, setActiveStep] = useState(0);
  const cardRefs = useRef([]);

  // Continuously track which card is currently in the reading viewport zone
  useEffect(() => {
    const handleScroll = () => {
      const viewportCenter = window.innerHeight * 0.45;
      let closestIdx = 0;
      let minDistance = Infinity;

      cardRefs.current.forEach((el, idx) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const elementCenter = rect.top + rect.height / 2;
        const distance = Math.abs(viewportCenter - elementCenter);

        if (distance < minDistance) {
          minDistance = distance;
          closestIdx = idx;
        }
      });

      setActiveStep(closestIdx);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToCard = (index) => {
    const target = cardRefs.current[index];
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    setActiveStep(index);
  };

  const currentStep = WORKFLOW_STEPS[activeStep];

  return (
    <section id="product" className="relative scroll-mt-20 border-b border-gray-200/80 bg-[#FAFAFA] py-20 sm:py-28">
      {/* Background radial accent glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 h-[500px] w-[600px] rounded-full bg-blue-100/40 blur-[130px]" />
        <div className="absolute bottom-1/4 left-1/4 h-[500px] w-[600px] rounded-full bg-indigo-100/40 blur-[140px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center mb-14 sm:mb-20">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-blue-600 border border-blue-100">
            <SparklesIcon className="h-3.5 w-3.5" />
            Continuous Execution Pipeline
          </span>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-gray-950 sm:text-4xl lg:text-5xl font-display">
            Everything between the idea and the ship
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-600 sm:text-lg">
            A natural, unbroken flow from raw concept to running production code.
            As you scroll, see how AversA turns dialogue into structured requirements and dispatched tickets.
          </p>

          {/* Mobile Step Pills */}
          <div className="mt-6 flex lg:hidden items-center justify-center gap-1.5 overflow-x-auto scrollbar-hide py-1">
            {WORKFLOW_STEPS.map((step, idx) => (
              <button
                key={step.id}
                type="button"
                onClick={() => scrollToCard(idx)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition shrink-0 ${
                  activeStep === idx
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                <span className="font-mono text-[11px] opacity-80">{step.id}</span>
                <span>{step.shortTitle}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2-Column Continuous Scroll Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Natural Scrolling Cards (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-8 sm:space-y-12 relative">
            {/* Vertical connector spine on desktop */}
            <div className="hidden lg:block absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-blue-500 via-indigo-500 to-emerald-500 opacity-20" />

            {WORKFLOW_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isActive = activeStep === idx;

              return (
                <div
                  key={step.id}
                  ref={(el) => (cardRefs.current[idx] = el)}
                  onClick={() => scrollToCard(idx)}
                  className={`group relative rounded-3xl p-6 sm:p-7 transition-all duration-300 cursor-pointer border ${
                    isActive
                      ? "bg-white border-blue-500/50 shadow-xl shadow-blue-500/5 ring-2 ring-blue-500/10 scale-101"
                      : "bg-white/80 border-gray-200/90 shadow-xs hover:border-gray-300 hover:bg-white"
                  }`}
                >
                  {/* Step header */}
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition-colors ${
                          isActive
                            ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                            : "bg-gray-50 text-gray-700 border-gray-200 group-hover:bg-blue-50 group-hover:text-blue-600"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-blue-600">
                          {step.tag}
                        </span>
                        <h3 className="text-lg sm:text-xl font-black text-gray-950 font-display">
                          {step.title}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed text-gray-600 mb-4">
                    {step.narrative}
                  </p>

                  {/* Outcome pill */}
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-900 flex items-start gap-2.5">
                    <CheckCircleIcon className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="font-medium">{step.outcome}</span>
                  </div>

                  {/* Metric Chips */}
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                    {step.metrics.map((m, mIdx) => (
                      <div key={mIdx} className="flex items-center gap-1.5">
                        <span className="text-gray-400 font-medium">{m.label}:</span>
                        <span className="font-bold text-gray-900 font-mono">{m.value}</span>
                      </div>
                    ))}
                    <span className="text-[11px] font-bold text-blue-600 flex items-center gap-1">
                      {isActive ? "Viewing Live" : "Click to view"}
                      <ChevronRightIcon className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Sticky Live Simulated Console (lg:col-span-7) */}
          <div className="lg:col-span-7 lg:sticky lg:top-24 self-start">
            <div className="rounded-3xl border border-gray-800/80 bg-gray-950 text-white shadow-2xl overflow-hidden backdrop-blur-xl">
              
              {/* Console Top Chrome Bar */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-900/80 text-xs">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                    <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  </div>
                  <span className="font-mono text-[11px] text-gray-400">
                    aversa-pipeline // {currentStep.shortTitle}
                  </span>
                </div>

                {/* Step tabs inside console */}
                <div className="flex items-center gap-1">
                  {WORKFLOW_STEPS.map((s, idx) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => scrollToCard(idx)}
                      className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-semibold transition ${
                        activeStep === idx
                          ? "bg-blue-600 text-white shadow-xs"
                          : "text-gray-400 hover:text-gray-200 bg-gray-800/60"
                      }`}
                    >
                      {s.id}
                    </button>
                  ))}
                </div>
              </div>

              {/* Console Screen Canvas */}
              <div className="p-4 sm:p-6 min-h-[460px] flex flex-col justify-between">
                
                {/* STEP 1: Discovery Blueprint Canvas */}
                {currentStep.visualType === "discovery" && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="rounded-xl border border-blue-500/30 bg-blue-950/30 p-3.5 shadow-inner">
                      <div className="flex items-center justify-between text-xs font-semibold text-blue-300">
                        <div className="flex items-center gap-2">
                          <SparklesIcon className="h-4 w-4 text-blue-400 animate-pulse" />
                          <span>Input Brief: Multi-Tenant Real-Time FinTech Gateway</span>
                        </div>
                        <Badge variant="brand" size="sm">Ingested</Badge>
                      </div>
                      <p className="mt-1.5 font-mono text-[11px] text-blue-200/80">
                        &ldquo;High-frequency order ingestion, sub-100ms audit log, SOC2 compliance.&rdquo;
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs font-bold text-gray-300">
                      <span>Generated Discovery Vectors (8 Tracks)</span>
                      <span className="font-mono text-[11px] text-emerald-400">✓ 12 Questions Seeded</span>
                    </div>

                    <div className="space-y-2.5">
                      {[
                        {
                          topic: "Architecture",
                          color: "text-blue-400 bg-blue-500/10 border-blue-500/30",
                          q: "What is the peak order throughput and failover SLA?",
                          context: "Directly impacts multi-region database replication design.",
                        },
                        {
                          topic: "Security",
                          color: "text-purple-400 bg-purple-500/10 border-purple-500/30",
                          q: "Does customer KYC require Row-Level Security (RLS) data isolation?",
                          context: "Determines database tenancy model before writing schemas.",
                        },
                        {
                          topic: "Integrations",
                          color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
                          q: "Will banking webhook retries include idempotency headers?",
                          context: "Prevents double-debiting on network timeouts.",
                        },
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl border border-gray-800 bg-gray-900/80 p-3 transition hover:border-gray-700"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${item.color}`}>
                              {item.topic}
                            </span>
                            <span className="font-mono text-[10px] text-gray-500">Q-{idx + 1} of 12</span>
                          </div>
                          <p className="mt-1.5 text-xs font-semibold text-gray-100">&ldquo;{item.q}&rdquo;</p>
                          <p className="mt-1 text-[11px] text-gray-400">{item.context}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 2: Google Meet Diarization Canvas */}
                {currentStep.visualType === "meet" && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between rounded-xl bg-gray-900 border border-gray-800 p-3 text-xs">
                      <div className="flex items-center gap-2">
                        <VideoCameraIcon className="h-4 w-4 text-emerald-400" />
                        <span className="font-mono text-gray-200">meet.google.com/avs-sync-892</span>
                      </div>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                        LIVE AUDIO STREAM
                      </span>
                    </div>

                    <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-3">
                      <div className="flex items-center justify-between text-[11px] text-gray-400 mb-2">
                        <span>48kHz Dual-Channel Audio Equalizer</span>
                        <span className="font-mono text-blue-400">Speech Diarization: ACTIVE</span>
                      </div>
                      <div className="flex items-end justify-between gap-1 h-12 px-1">
                        {[40, 75, 50, 95, 65, 100, 80, 45, 90, 100, 65, 85, 55, 80, 95, 70, 45, 90, 75, 55, 85, 65].map(
                          (height, idx) => (
                            <div
                              key={idx}
                              className="w-1.5 rounded-full bg-gradient-to-t from-blue-600 to-cyan-400 transition-all duration-300"
                              style={{
                                height: `${height}%`,
                                opacity: (idx + 1) % 3 === 0 ? 1 : 0.75,
                              }}
                            />
                          )
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="rounded-xl border border-gray-800 bg-gray-900/80 p-3">
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="font-bold text-blue-400">Sarah Jenkins (VP Eng, Client)</span>
                          <span className="text-gray-500">14:22:04</span>
                        </div>
                        <p className="mt-1 text-xs text-gray-200">
                          &ldquo;We cannot afford silent failures. Every checkout event must trigger an immutable audit event with sub-100ms latency.&rdquo;
                        </p>
                      </div>

                      <div className="rounded-xl border border-gray-800 bg-gray-900/80 p-3">
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="font-bold text-purple-400">Marcus Vance (Staff Architect)</span>
                          <span className="text-gray-500">14:22:18</span>
                        </div>
                        <p className="mt-1 text-xs text-gray-200">
                          &ldquo;Understood. We will implement Kafka event streams with a dead-letter queue, isolated by tenant ID.&rdquo;
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: Scope Synthesis Canvas */}
                {currentStep.visualType === "synthesis" && (
                  <div className="space-y-3.5 animate-fadeIn">
                    <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <CpuChipIcon className="h-4 w-4 text-indigo-400" />
                        <span className="font-semibold text-indigo-200">Gemini Reasoning Engine Matrix</span>
                      </div>
                      <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Baseline v1.0 Frozen
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="rounded-xl border border-blue-500/30 bg-blue-950/20 p-3">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-mono font-bold text-blue-400">REQ-101 // Core Architecture</span>
                          <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-blue-300">
                            Critical
                          </span>
                        </div>
                        <p className="mt-1 text-xs font-semibold text-gray-100">
                          Immutable Audit Log with Row-Level Security
                        </p>
                        <p className="mt-0.5 text-[11px] text-gray-400">
                          All financial mutations logged with actor ID, timestamp, and signature hash.
                        </p>
                      </div>

                      <div className="rounded-xl border border-purple-500/30 bg-purple-950/20 p-3">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-mono font-bold text-purple-400">DECISION-04 // Technical Choice</span>
                          <span className="rounded bg-purple-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-purple-300">
                            Approved
                          </span>
                        </div>
                        <p className="mt-1 text-xs font-semibold text-gray-100">
                          Kafka Event Stream with Dead-Letter Queue (DLQ)
                        </p>
                        <p className="mt-0.5 text-[11px] text-gray-400">
                          Selected over direct RabbitMQ polling to support high concurrency peaks.
                        </p>
                      </div>

                      <div className="rounded-xl border border-gray-800 bg-gray-900/80 p-3">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-mono font-bold text-yellow-400">EXCLUSION-01 // Scope Boundary</span>
                          <span className="rounded bg-yellow-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-yellow-300">
                            Deferred v1.2
                          </span>
                        </div>
                        <p className="mt-1 text-xs font-semibold text-gray-100">
                          Automated multi-currency forex hedging
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-2.5 flex items-center justify-between text-xs text-emerald-300">
                      <span className="font-medium">Stakeholder Approval: 4/4 Signed</span>
                      <span className="font-mono text-[10px] font-bold">SHA-256: 8f29c...a109</span>
                    </div>
                  </div>
                )}

                {/* STEP 4: Sprint Handoff Canvas */}
                {currentStep.visualType === "shipping" && (
                  <div className="space-y-3.5 animate-fadeIn">
                    <div className="flex items-center justify-between rounded-xl bg-gray-900 border border-gray-800 p-3 text-xs">
                      <div className="flex items-center gap-2">
                        <RocketLaunchIcon className="h-4 w-4 text-emerald-400" />
                        <span className="font-semibold text-gray-200">Sprint 1 Board · 14 Tasks Dispatched</span>
                      </div>
                      <Badge variant="emerald" size="sm">Ready to Code</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-2.5 space-y-2">
                        <span className="text-[10px] font-mono uppercase font-bold text-gray-400">
                          Ready for Dev (8)
                        </span>
                        <div className="rounded-lg bg-gray-950 border border-gray-800 p-2 text-[11px]">
                          <span className="font-mono text-[9px] text-blue-400 font-bold">[BE] TASK-204</span>
                          <p className="font-medium text-gray-200 mt-0.5">Kafka DLQ consumer hook</p>
                        </div>
                        <div className="rounded-lg bg-gray-950 border border-gray-800 p-2 text-[11px]">
                          <span className="font-mono text-[9px] text-purple-400 font-bold">[FE] TASK-205</span>
                          <p className="font-medium text-gray-200 mt-0.5">Audit log table view</p>
                        </div>
                      </div>

                      <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-2.5 space-y-2">
                        <span className="text-[10px] font-mono uppercase font-bold text-gray-400">
                          In Flight / Review (6)
                        </span>
                        <div className="rounded-lg bg-emerald-950/40 border border-emerald-500/20 p-2 text-[11px]">
                          <span className="font-mono text-[9px] text-emerald-400 font-bold">[PR #182] MERGED</span>
                          <p className="font-medium text-emerald-200 mt-0.5">PostgreSQL RLS migration</p>
                        </div>
                        <div className="rounded-lg bg-gray-950 border border-gray-800 p-2 text-[11px]">
                          <span className="font-mono text-[9px] text-cyan-400 font-bold">[OPS] TASK-208</span>
                          <p className="font-medium text-gray-200 mt-0.5">Staging cluster CI/CD</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-gray-800 bg-black/90 p-3 font-mono text-[11px] text-gray-300">
                      <div className="flex items-center gap-1.5 text-gray-500 mb-1.5 pb-1 border-b border-gray-800">
                        <CommandLineIcon className="h-3.5 w-3.5 text-gray-400" />
                        <span>Developer Terminal</span>
                      </div>
                      <p className="text-emerald-400">$ aversa sprint sync --baseline=v1.0</p>
                      <p className="text-gray-400">✓ Ingested 18 requirements and 4 architectural decisions</p>
                      <p className="text-blue-400">$ git checkout -b feat/req-101-audit-trail</p>
                    </div>
                  </div>
                )}

                {/* Console Bottom Action Bar */}
                <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => scrollToCard(Math.max(0, activeStep - 1))}
                      disabled={activeStep === 0}
                      className="rounded-lg p-1.5 bg-gray-900 hover:bg-gray-800 text-gray-300 disabled:opacity-40 disabled:pointer-events-none border border-gray-800"
                    >
                      <ChevronLeftIcon className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollToCard(Math.min(WORKFLOW_STEPS.length - 1, activeStep + 1))}
                      disabled={activeStep === WORKFLOW_STEPS.length - 1}
                      className="rounded-lg p-1.5 bg-gray-900 hover:bg-gray-800 text-gray-300 disabled:opacity-40 disabled:pointer-events-none border border-gray-800"
                    >
                      <ChevronRightIcon className="h-3.5 w-3.5" />
                    </button>
                    <span className="font-mono text-[11px] text-gray-400 ml-1">
                      Step {activeStep + 1} of 4
                    </span>
                  </div>

                  <span className="font-mono text-[11px] text-blue-400">
                    Scroll down naturally to continue ↓
                  </span>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
