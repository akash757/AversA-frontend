"use client";

import { useState } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import {
  LightBulbIcon,
  ClipboardDocumentCheckIcon,
  CodeBracketIcon,
  UserGroupIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

const roles = [
  {
    id: "pm",
    label: "Product Manager",
    icon: LightBulbIcon,
    headline: "Own the brief from conversation to proposal",
    points: [
      "Seed Day 1 discovery and track answer completeness",
      "Let AI extract REQs from alignment meetings",
      "Ship estimates and client-ready proposals faster",
      "Hand off domain-tagged tasks without losing context",
    ],
  },
  {
    id: "proj",
    label: "Project Manager",
    icon: ClipboardDocumentCheckIcon,
    headline: "Sequence work that already knows its why",
    points: [
      "Assign PMs and developers to REQ-linked tasks",
      "Track todo → in progress → review → done",
      "Schedule Meet syncs with conflict awareness",
      "Keep stakeholders aligned on confirmed scope",
    ],
  },
  {
    id: "eng",
    label: "Engineer & Designer",
    icon: CodeBracketIcon,
    headline: "Build against decisions, not vague tickets",
    points: [
      "Tasks arrive tagged frontend, backend, or design",
      "Every task links back to a requirement ID",
      "Meeting context sits next to the work item",
      "Less rework from misunderstood client asks",
    ],
  },
  {
    id: "client",
    label: "Client",
    icon: UserGroupIcon,
    headline: "See progress without chasing status updates",
    points: [
      "Join structured discovery instead of open-ended calls",
      "Review proposals grounded in what you said",
      "Attend Meet sessions booked in one click",
      "Trust that agreed scope isn’t lost in notes",
    ],
  },
];

export default function RolesTabs() {
  const [active, setActive] = useState(roles[0].id);
  const current = roles.find((r) => r.id === active) || roles[0];
  const Icon = current.icon;

  return (
    <section className="relative border-b border-gray-200 bg-[#fafafa] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
              Built for every role
            </span>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
              One workspace. Every seat that matters.
            </h2>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={80}>
          <div className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-2">
            {roles.map((role) => {
              const TabIcon = role.icon;
              const isActive = role.id === active;
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setActive(role.id)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                    isActive
                      ? "bg-gray-950 text-white shadow-sm"
                      : "border border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-950"
                  }`}
                >
                  <TabIcon className="h-4 w-4" />
                  {role.label}
                </button>
              );
            })}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={120} key={current.id}>
          <div className="mx-auto mt-8 max-w-3xl rounded-3xl border border-gray-200 bg-white p-7 shadow-xs sm:p-10">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  {current.label}
                </p>
                <h3 className="text-xl font-bold text-gray-950 sm:text-2xl">
                  {current.headline}
                </h3>
              </div>
            </div>
            <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {current.points.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-2.5 rounded-2xl border border-gray-100 bg-gray-50/80 px-4 py-3 text-sm text-gray-700"
                >
                  <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
