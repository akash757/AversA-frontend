"use client";

import Link from "next/link";
import {
  ArrowRightIcon,
  SparklesIcon,
  DocumentTextIcon,
  CpuChipIcon,
} from "@heroicons/react/24/outline";

const extractedReqs = [
  { id: "REQ-001", text: "Real-time inventory sync across POS & warehouse", domain: "backend" },
  { id: "REQ-002", text: "Store manager dashboard with stock alerts", domain: "frontend" },
  { id: "REQ-003", text: "Mobile-first receiving flow for warehouse staff", domain: "design" },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden aurora-bg bg-dot-grid-dark pt-28 pb-16 sm:pt-36 sm:pb-24 lg:pt-40 lg:pb-28">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-blue-600/20 blur-3xl animate-aurora" />
        <div className="absolute right-0 top-40 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl animate-aurora" style={{ animationDelay: "1.5s" }} />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-cyan-500/15 blur-3xl animate-aurora" style={{ animationDelay: "3s" }} />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-blue-200 backdrop-blur-sm">
            <SparklesIcon className="h-3.5 w-3.5 text-cyan-300" />
            <span>AI product manager for client-driven teams</span>
          </div>

          <h1 className="mt-7 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.08]">
            Turn client conversations into{" "}
            <span className="text-gradient">shipped products.</span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
            AversA listens to discovery meetings, extracts requirements with AI,
            builds estimates and proposals, then generates domain-tagged tasks —
            so your team ships what was actually agreed.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500 active:scale-[0.98] sm:w-auto"
            >
              Start free
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <Link
              href="#how-we-work"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10 sm:w-auto"
            >
              See how we work
            </Link>
          </div>
        </div>

        {/* Product mockup */}
        <div className="relative mx-auto mt-14 max-w-5xl animate-fade-up sm:mt-18" style={{ animationDelay: "120ms" }}>
          <div className="gradient-border rounded-3xl bg-[#0e1219]/90 p-3 shadow-2xl shadow-blue-900/40 sm:p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4 px-1">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span className="ml-2 font-mono text-[11px] text-slate-500">
                  aversa.ai / projects / retail-sync
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 font-mono text-[10px] font-semibold text-cyan-300">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                AI analyzing
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {/* Transcript panel */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left">
                <div className="mb-3 flex items-center gap-2">
                  <DocumentTextIcon className="h-4 w-4 text-slate-400" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Meeting transcript
                  </span>
                </div>
                <div className="space-y-3 text-sm leading-relaxed text-slate-300">
                  <p>
                    <span className="font-semibold text-blue-300">Client:</span>{" "}
                    We need inventory to sync between POS and the warehouse in
                    real time. Expanding to 15 stores next quarter.
                  </p>
                  <p>
                    <span className="font-semibold text-indigo-300">PM:</span>{" "}
                    Success looks like sub-second stock updates and alerts when
                    shelves run low.
                  </p>
                  <p className="text-slate-500 italic">
                    …warehouse staff need a simple mobile receiving flow…
                  </p>
                </div>
              </div>

              {/* AI extraction panel */}
              <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-cyan-500/10 p-4 text-left">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CpuChipIcon className="h-4 w-4 text-cyan-300" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-cyan-200">
                      AversA AI
                    </span>
                  </div>
                  <span className="rounded-md bg-white/5 px-2 py-0.5 font-mono text-[10px] text-slate-400">
                    3 requirements
                  </span>
                </div>

                <div className="space-y-2">
                  {extractedReqs.map((req, i) => (
                    <div
                      key={req.id}
                      className="rounded-xl border border-white/10 bg-[#07090f]/60 p-3 animate-fade-up"
                      style={{ animationDelay: `${200 + i * 150}ms` }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[10px] font-semibold text-blue-300">
                          {req.id}
                        </span>
                        <span className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-slate-400">
                          {req.domain}
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs text-slate-200 leading-relaxed">
                        {req.text}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[11px] font-medium text-emerald-300">
                    Estimate draft ready · Proposal queued · 8 tasks generated
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-r from-blue-600/20 via-indigo-500/15 to-cyan-500/20 blur-2xl" />
        </div>
      </div>
    </section>
  );
}
