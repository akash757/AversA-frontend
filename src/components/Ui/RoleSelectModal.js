"use client";

import { useState } from "react";
import AversALogo from "@/components/Ui/AversALogo";

const ROLES = [
  { value: "client", label: "Client", desc: "Review project briefs, discovery milestones & schedule meetings" },
  { value: "product_manager", label: "Product Manager", desc: "Lead discovery matrix, product strategy & scope definition" },
  { value: "project_manager", label: "Project Manager", desc: "Coordinate delivery schedules, team alignment & execution" },
  { value: "developer", label: "Developer", desc: "Implement architecture, system specs & technical discovery" },
  { value: "designer", label: "Designer", desc: "Craft user experiences, interactive prototypes & design tokens" },
  { value: "qa", label: "QA Engineer", desc: "Design acceptance criteria, test matrices & quality gates" },
  { value: "devops", label: "DevOps Engineer", desc: "Manage cloud infrastructure, deployment pipelines & observability" },
  { value: "sales", label: "Sales & Solutions", desc: "Manage client discovery, deal scopes & feasibility handoffs" },
];

export default function RoleSelectModal({ open, onSelect, onCancel, loading }) {
  const [selected, setSelected] = useState("client");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl mx-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <AversALogo size="sm" showTagline={false} />
          <div>
            <h2 className="text-lg font-bold text-gray-950">Select Your Role</h2>
            <p className="text-xs text-gray-500">
              Personalize your workspace and permission defaults.
            </p>
          </div>
        </div>

        {/* Role list */}
        <div className="mt-4 space-y-2 max-h-[340px] overflow-y-auto pr-1">
          {ROLES.map((r) => {
            const isSelected = selected === r.value;
            return (
              <button
                key={r.value}
                type="button"
                onClick={() => setSelected(r.value)}
                className={`flex w-full items-center gap-3.5 rounded-xl border p-3.5 text-left transition-all duration-150 ${
                  isSelected
                    ? "border-[#2563EB] bg-blue-50/70 ring-2 ring-blue-500/20"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                    isSelected
                      ? "border-[#2563EB] bg-[#2563EB] text-white"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  {isSelected && (
                    <svg className="h-3 w-3 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">{r.label}</span>
                    {isSelected && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                        Selected
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{r.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSelect(selected)}
            disabled={loading}
            className="flex-1 rounded-xl bg-[#2563EB] py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-[#1d4ed8] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                  <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                </svg>
                Connecting...
              </span>
            ) : (
              "Confirm & Continue"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
