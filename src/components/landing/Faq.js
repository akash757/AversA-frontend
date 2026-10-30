"use client";

import { useState } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

const faqs = [
  {
    q: "How is AversA different from a project tracker?",
    a: "Trackers manage tasks after they’re defined. AversA focuses on the hardest phase — turning ambiguous client conversations into verified requirements, estimates, proposals, and REQ-linked tasks with AI.",
  },
  {
    q: "How accurate is the AI analysis?",
    a: "AversA’s Product Management Agent uses Gemini with context from prior meeting analyses. It surfaces requirements, risks, and gaps for human review — you stay in control of what gets confirmed and shipped.",
  },
  {
    q: "Do I need Google Workspace?",
    a: "You can sign up with email and password. Connecting Google Calendar unlocks automatic Meet link creation, availability checks, and calendar events. AI transcript analysis works either way.",
  },
  {
    q: "What happens to our meeting data?",
    a: "Transcripts and analyses are stored in your organization workspace with role-based access. Orgs are partitioned; only approved members with the right roles can view project data.",
  },
  {
    q: "Can we customize discovery questions?",
    a: "Yes. Projects start with a battle-tested Day 1 template across eight dimensions. Product and project managers can add custom questions under any topic.",
  },
  {
    q: "Is AversA multi-tenant and role-aware?",
    a: "Yes. Strict organization partitioning, invites, admin approvals, and roles spanning Superadmin, PM, Engineer, Designer, Client, and more.",
  },
];

export default function Faq() {
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="relative scroll-mt-20 border-b border-gray-200 bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
              FAQ
            </span>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
              Questions, answered
            </h2>
          </div>
        </ScrollReveal>

        <div className="mt-10 space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = open === idx;
            return (
              <ScrollReveal key={faq.q} delay={idx * 30}>
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs">
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? -1 : idx)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm font-bold text-gray-950 sm:text-base">
                      {faq.q}
                    </span>
                    <ChevronDownIcon
                      className={`h-5 w-5 shrink-0 text-gray-400 transition-transform ${
                        isOpen ? "rotate-180 text-blue-600" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="border-t border-gray-100 px-5 pb-5 pt-3 sm:px-6">
                      <p className="text-sm leading-relaxed text-gray-600">{faq.a}</p>
                    </div>
                  )}
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
