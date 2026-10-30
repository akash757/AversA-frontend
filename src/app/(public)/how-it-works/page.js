"use client";

import Link from "next/link";
import ScrollReveal from "@/components/ScrollReveal";
import {
  SparklesIcon,
  FolderPlusIcon,
  VideoCameraIcon,
  CpuChipIcon,
  DocumentChartBarIcon,
  RocketLaunchIcon,
  CheckBadgeIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

const phases = [
  {
    number: "01",
    title: "Capture — Stage gate discovery",
    icon: FolderPlusIcon,
    description:
      "When a project is created, AversA provisions structured Day 1 discovery questions across eight dimensions: Problem, Users, Success Goals, Core Features, Existing Architecture, Constraints, Stakeholders, and Next Steps.",
    details: [
      "Standardized questionnaire templates pre-seeded into the project",
      "Status tracking: Pending, Asked, Answered, and Skipped",
      "Custom questions for specialized engagements",
    ],
  },
  {
    number: "02",
    title: "Align — Google Meet & calendar",
    icon: VideoCameraIcon,
    description:
      "Connect Google Workspace with one click. Schedule client syncs, check participant availability, and generate secure Google Meet rooms without leaving AversA.",
    details: [
      "Real-time calendar conflict detection across invitees",
      "Automatic Calendar events and email notifications",
      "Session notes captured for executive review",
    ],
  },
  {
    number: "03",
    title: "Analyze — AI transcript intelligence",
    icon: CpuChipIcon,
    description:
      "AversA’s Product Management Agent (powered by Gemini) reads meeting transcripts with context from prior analyses, then extracts requirements, risks, gaps, and decisions for human confirmation.",
    details: [
      "Context-aware analysis across consecutive meetings",
      "Structured requirements ready for engineering handoff",
      "Risks and missing information flagged early",
    ],
  },
  {
    number: "04",
    title: "Plan — Estimates, proposals & tasks",
    icon: DocumentChartBarIcon,
    description:
      "Turn confirmed scope into effort estimates, a client-ready proposal, and granular tasks tagged frontend, backend, or design — each linked to a requirement ID.",
    details: [
      "AI-assisted estimation and proposal drafts",
      "One-click task generation from analyzed requirements",
      "Domain tags and REQ-IDs for full traceability",
    ],
  },
  {
    number: "05",
    title: "Deliver — Assign & track",
    icon: RocketLaunchIcon,
    description:
      "Assign project managers, developers, and designers. Move work through todo, in progress, review, and done — always tied back to what the client agreed on the call.",
    details: [
      "Role-aware assignment workflows",
      "Progress that maps to confirmed requirements",
      "Multi-tenant RBAC keeping orgs partitioned",
    ],
  },
];

const stats = [
  { value: "8", label: "Discovery dimensions" },
  { value: "5", label: "Methodology steps" },
  { value: "3", label: "Delivery domains" },
  { value: "1", label: "AI product manager (live)" },
];

const faqs = [
  {
    q: "How does AversA differ from conventional project trackers?",
    a: "Unlike tools that only track tasks after they are defined, AversA focuses on turning ambiguous client conversations into verified, structured requirements with guided discovery, AI analysis, and Google Meet synchronization.",
  },
  {
    q: "Do I need a Google Workspace account?",
    a: "You can use AversA with email/password authentication. Connecting Google Calendar enables automatic Meet links and availability checks. AI transcript analysis works either way.",
  },
  {
    q: "How does the AI product manager work?",
    a: "After a meeting, upload or capture the transcript. AversA’s Product Management Agent analyzes it (with prior session context), extracts requirements and risks, and can generate estimates, proposals, and domain-tagged tasks.",
  },
  {
    q: "Is AversA multi-tenant and secure?",
    a: "Yes. AversA enforces organization partitioning, role-based authorization (Superadmin, Admin, PM, Engineer, Designer, Client, and more), and encrypted authentication.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="relative min-h-screen bg-white text-gray-900 selection:bg-blue-600 selection:text-white">
      <section className="relative overflow-hidden aurora-bg bg-dot-grid-dark pt-32 pb-16 sm:pt-40 sm:pb-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-20 h-64 w-64 rounded-full bg-blue-600/25 blur-3xl animate-aurora" />
          <div className="absolute bottom-0 right-1/4 h-56 w-56 rounded-full bg-cyan-500/20 blur-3xl animate-aurora" style={{ animationDelay: "2s" }} />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-blue-200 backdrop-blur-sm">
            <SparklesIcon className="h-3.5 w-3.5 text-cyan-300" />
            The AversA methodology
          </div>
          <h1 className="mt-6 text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl leading-tight">
            How AversA turns conversations into{" "}
            <span className="text-gradient">shipped work</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
            A five-step loop: capture discovery, align on Meet, analyze with AI,
            plan estimates and tasks, then deliver with full REQ traceability.
          </p>
        </div>
      </section>

      <section className="relative border-b border-gray-200 bg-[#fafafa] py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-6">
          {phases.map((phase, idx) => {
            const Icon = phase.icon;
            return (
              <ScrollReveal key={phase.number} delay={idx * 40}>
                <div className="rounded-3xl border border-gray-200 bg-white p-7 shadow-xs transition hover:border-blue-300 hover:shadow-md sm:p-10">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-mono text-sm font-black text-blue-600">
                          {phase.number}
                        </span>
                        <h2 className="text-xl font-bold text-gray-950 sm:text-2xl">
                          {phase.title}
                        </h2>
                      </div>
                      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-600 sm:text-base">
                        {phase.description}
                      </p>
                      <div className="mt-6 grid grid-cols-1 gap-3 border-t border-gray-100 pt-6 md:grid-cols-3">
                        {phase.details.map((detail) => (
                          <div
                            key={detail}
                            className="flex items-start gap-2.5 rounded-xl border border-gray-200 bg-gray-50/70 p-3 text-sm text-gray-700"
                          >
                            <CheckBadgeIcon className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                            <span>{detail}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      <section className="relative border-b border-gray-200 bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-gray-200 bg-gray-50/50 p-6 text-center shadow-xs"
              >
                <p className="text-2xl font-black text-gray-950 sm:text-4xl">{s.value}</p>
                <p className="mt-1 text-xs text-gray-500 sm:text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative border-b border-gray-200 bg-[#fafafa] py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-10 text-center text-2xl font-bold text-gray-950 sm:text-3xl">
            Frequently asked questions
          </h2>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <div
                key={faq.q}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs"
              >
                <h3 className="text-sm font-bold text-gray-950 sm:text-base">{faq.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden aurora-bg bg-dot-grid-dark py-20 text-center">
        <div className="relative z-10 mx-auto max-w-3xl px-4">
          <h2 className="text-2xl font-black text-white sm:text-3xl">
            Experience AversA for your team
          </h2>
          <p className="mt-3 text-sm text-slate-300 sm:text-base">
            Create an account in under a minute and start aligning discovery with AI.
          </p>
          <div className="mt-6 flex justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500"
            >
              Get started free
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
