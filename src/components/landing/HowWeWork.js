"use client";

import { useState } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import {
  FolderPlusIcon,
  VideoCameraIcon,
  CpuChipIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import Badge from "@/components/Ui/Badge";
import Button from "@/components/Ui/Button";

const tutorialPhases = [
  {
    step: "01",
    tag: "Initiation",
    title: "Seed the Discovery Matrix",
    shortTitle: "1. Capture & Matrix",
    icon: FolderPlusIcon,
    accent: "blue",
    description:
      "When you create a project, AversA immediately generates a multi-topic discovery checklist tailored to your domain (Architecture, Security, Business Goals, User Persona, Integrations).",
    highlight: "No more blank stares — enter your client call with the exact questions ready.",
    mockView: (
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <span className="text-xs font-bold text-gray-800">Discovery Backlog · 8 Strategic Topics</span>
          <Badge variant="brand" size="sm">Pre-Seeded</Badge>
        </div>
        {[
          { q: "What is your target Q3 user concurrency and peak throughput?", topic: "Architecture", status: "Ready" },
          { q: "Do external vendors require direct webhook access or polling APIs?", topic: "Integrations", status: "Ready" },
          { q: "What compliance standards apply (SOC2, HIPAA, GDPR)?", topic: "Security", status: "Ready" },
        ].map((item, idx) => (
          <div key={idx} className="rounded-xl border border-gray-200 bg-white p-3 shadow-xs">
            <div className="flex items-center justify-between gap-2 text-[10px]">
              <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{item.topic}</span>
              <span className="text-gray-400 font-medium">Topic {idx + 1}</span>
            </div>
            <p className="mt-1.5 text-xs font-semibold text-gray-900">&ldquo;{item.q}&rdquo;</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    step: "02",
    tag: "Audio Sync",
    title: "Sync Google Meet & Record",
    shortTitle: "2. Google Meet Sync",
    icon: VideoCameraIcon,
    accent: "cyan",
    description:
      "Connect your Google Workspace calendar with one click. AversA schedules sessions, invites stakeholders, and captures verbatim audio transcripts with speaker separation.",
    highlight: "Never scribble rushed notes again during critical high-stakes negotiations.",
    mockView: (
      <div className="space-y-3">
        <div className="rounded-xl bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-100 p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-900">Google Meet Connected</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <p className="mt-1 text-xs text-cyan-800/80">Room: meet.google.com/avs-sync-829</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-3 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Speaker Timeline</span>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-start gap-2">
              <span className="font-bold text-blue-600 shrink-0">Client (VP Eng):</span>
              <p className="text-gray-700">We require sub-second inventory sync between POS & warehouse.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-violet-600 shrink-0">Product Lead:</span>
              <p className="text-gray-700">Agreed. We will build local SQLite cache fallback for offline registers.</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    step: "03",
    tag: "AI Extraction",
    title: "Review Extracted Knowledge Board",
    shortTitle: "3. AI Knowledge Board",
    icon: CpuChipIcon,
    accent: "violet",
    description:
      "AversA’s AI models analyze the dialogue, extract requirements, answers, decisions, and action items, and link them to verbatim transcript turn citations.",
    highlight: "100% verifiable — click any requirement to see the exact second it was spoken.",
    mockView: (
      <div className="space-y-2.5">
        <div className="flex items-center justify-between pb-1 border-b border-gray-100">
          <span className="text-xs font-bold text-gray-800">Extracted Knowledge Items</span>
          <Badge variant="violet" size="sm">3 Discovered</Badge>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3">
          <div className="flex items-center justify-between">
            <Badge variant="success" size="sm">Answer Discovered</Badge>
            <span className="text-[10px] text-gray-400">98% Match</span>
          </div>
          <p className="mt-1 text-xs font-semibold text-gray-900">
            Answers Question: &ldquo;What is the peak concurrency goal?&rdquo;
          </p>
          <p className="text-[11px] text-gray-600 mt-0.5">Statement: 15 retail stores with up to 120 checkout terminals.</p>
        </div>
        <div className="rounded-xl border border-violet-200 bg-violet-50/40 p-3">
          <div className="flex items-center justify-between">
            <Badge variant="violet" size="sm">Architectural Decision</Badge>
            <span className="text-[10px] text-gray-400">Turn #42</span>
          </div>
          <p className="mt-1 text-xs font-semibold text-gray-900">Adopt SQLite local queue for zero-downtime offline fallback.</p>
        </div>
      </div>
    ),
  },
  {
    step: "04",
    tag: "Scope Lock",
    title: "Freeze Versioned Scope Baseline",
    shortTitle: "4. Scope Baseline v1",
    icon: ShieldCheckIcon,
    accent: "emerald",
    description:
      "Compile the accepted requirements and technical decisions into a frozen Baseline v1.0. This forms the legal scope contract that client stakeholders review and approve.",
    highlight: "Scope creep eliminated. Any new idea automatically logs as a v1.1 change request.",
    mockView: (
      <div className="space-y-3">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-xs font-bold text-emerald-950">Baseline v1.0 Confirmed & Locked</p>
              <p className="text-[10px] text-emerald-800">Signed off by Client VP & PM Lead</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-3 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Total Engineering Hours</span>
            <span className="font-mono font-bold text-gray-900">340 hrs</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Proposal Cost</span>
            <span className="font-mono font-bold text-blue-600">$48,500</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Sprint Timeline</span>
            <span className="font-mono font-bold text-gray-900">6 Sprints (12 Wks)</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    step: "05",
    tag: "Delivery",
    title: "Generate Domain Tasks & Ship",
    shortTitle: "5. Dispatch Tasks",
    icon: RocketLaunchIcon,
    accent: "blue",
    description:
      "One click converts the baseline into sprint-ready developer tasks — tagged for Frontend, Backend, and Design — each linked directly to requirement IDs.",
    highlight: "Your engineers open tickets with clear context and zero guesswork on what to build.",
    mockView: (
      <div className="space-y-2">
        <div className="flex items-center justify-between pb-1 border-b border-gray-100">
          <span className="text-xs font-bold text-gray-800">Sprint 1 Board</span>
          <Badge variant="brand" size="sm">Ready to Ship</Badge>
        </div>
        {[
          { id: "TASK-101", tag: "Backend", title: "Redis pub/sub webhook dispatcher for inventory delta", req: "REQ-001" },
          { id: "TASK-102", tag: "Frontend", title: "Offline indicator status pill and queue sync retry hook", req: "DEC-002" },
          { id: "TASK-103", tag: "Design", title: "Tablet receiving flow high-fidelity Figma components", req: "REQ-003" },
        ].map((t) => (
          <div key={t.id} className="rounded-xl border border-gray-200 bg-white p-3 shadow-xs">
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-mono font-bold text-blue-600">{t.id}</span>
              <span className="text-gray-400">Linked: {t.req}</span>
            </div>
            <p className="mt-1 text-xs font-semibold text-gray-900">{t.title}</p>
          </div>
        ))}
      </div>
    ),
  },
];

export default function HowWeWork() {
  const [activeIdx, setActiveIdx] = useState(0);
  const current = tutorialPhases[activeIdx];
  const Icon = current.icon;

  return (
    <section id="how-we-work" className="relative scroll-mt-20 border-b border-gray-200 bg-[#F8FAFC] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Section title */}
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">
              Interactive Tutorial Walkthrough
            </span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#0F172A] sm:text-4xl font-display">
              How AversA powers the Software Development Lifecycle (SDLC)
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#475569] sm:text-base">
              Follow the journey from client discovery conversations to verified sprint code.
              Click any step below to see how our AI Product Management Agent orchestrates every stage.
            </p>
          </div>
        </ScrollReveal>

        {/* Interactive step navigation bar */}
        <div className="mt-12 flex justify-center">
          <div className="flex items-center gap-1.5 overflow-x-auto rounded-2xl border border-gray-200 bg-white p-1.5 shadow-xs scrollbar-hide max-w-full">
            {tutorialPhases.map((phase, idx) => (
              <button
                key={phase.step}
                type="button"
                onClick={() => setActiveIdx(idx)}
                className={[
                  "flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all duration-200 shrink-0",
                  activeIdx === idx
                    ? "bg-[#2563EB] text-white shadow-sm shadow-blue-500/20"
                    : "text-gray-600 hover:text-gray-950 hover:bg-gray-100",
                ].join(" ")}
              >
                <span className="font-mono text-[11px] opacity-80">{phase.step}</span>
                <span>{phase.shortTitle}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Interactive Tutorial Card */}
        <div className="mt-8 mx-auto max-w-5xl">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-md">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-center">

              {/* Left Column: Step Details */}
              <div className="lg:col-span-6 space-y-4 text-left">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                      Step {current.step} · {current.tag}
                    </span>
                    <h3 className="text-xl font-extrabold text-gray-950 font-display">
                      {current.title}
                    </h3>
                  </div>
                </div>

                <p className="text-sm leading-relaxed text-gray-600">
                  {current.description}
                </p>

                {/* Key takeaway callout */}
                <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                  <div className="flex items-start gap-2.5">
                    <SparklesIcon className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-xs font-medium text-blue-900 leading-relaxed">
                      <strong>Why this matters:</strong> {current.highlight}
                    </p>
                  </div>
                </div>

                {/* Progress bar and next control */}
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-400">
                    Step {activeIdx + 1} of {tutorialPhases.length}
                  </span>
                  <div className="flex gap-2">
                    {activeIdx > 0 && (
                      <button
                        type="button"
                        onClick={() => setActiveIdx((prev) => prev - 1)}
                        className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                      >
                        Previous
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setActiveIdx((prev) => (prev + 1) % tutorialPhases.length)}
                      className="inline-flex items-center gap-1 rounded-xl bg-[#2563EB] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition shadow-xs"
                    >
                      <span>{activeIdx === tutorialPhases.length - 1 ? "Start Over" : "Next Step"}</span>
                      <ArrowRightIcon className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Simulated Workspace UI */}
              <div className="lg:col-span-6">
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 shadow-inner">
                  <div className="mb-3 flex items-center justify-between border-b border-gray-200 pb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-red-400" />
                      <span className="h-2 w-2 rounded-full bg-amber-400" />
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      <span className="ml-2 font-mono text-[10px] text-gray-500">
                        aversa.app / step-{current.step}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] font-bold text-blue-600">LIVE DEMO</span>
                  </div>

                  {current.mockView}
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
