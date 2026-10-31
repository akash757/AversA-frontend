"use client";

import { Fragment } from "react";
import {
  XMarkIcon,
  DocumentMagnifyingGlassIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

export default function EvidenceDrawer({
  isOpen,
  onClose,
  item,
  transcriptTitle,
}) {
  if (!isOpen || !item) return null;

  const evidenceList = Array.isArray(item.evidence) ? item.evidence : [];

  const renderTypeBadge = (type) => {
    switch (type) {
      case "requirement":
        return (
          <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#2563EB]">
            Requirement
          </span>
        );
      case "decision":
        return (
          <span className="rounded-md border border-purple-200 bg-purple-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-700">
            Decision
          </span>
        );
      case "action_item":
        return (
          <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800">
            Action Item
          </span>
        );
      case "answer":
        return (
          <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
            Answer
          </span>
        );
      default:
        return (
          <span className="rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-600">
            {type}
          </span>
        );
    }
  };

  const renderConfidenceBadge = (confidence) => {
    const conf = confidence ? String(confidence).toLowerCase() : "medium";
    if (conf === "high") {
      return (
        <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
          High Confidence
        </span>
      );
    }
    if (conf === "medium") {
      return (
        <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
          Medium Confidence
        </span>
      );
    }
    return (
      <span className="rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-bold text-gray-600">
        Low Confidence
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-gray-200 flex items-start justify-between gap-4 bg-gray-50/70">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {renderTypeBadge(item.type)}
              {renderConfidenceBadge(item.confidence)}
              <span className="text-[11px] font-medium text-gray-500">
                Status: <strong className="uppercase font-bold text-gray-700">{item.status}</strong>
              </span>
            </div>
            <h3 className="text-sm font-bold text-gray-900 leading-snug">
              Grounding & Transcript Citations
            </h3>
            {transcriptTitle && (
              <p className="text-xs text-gray-500 mt-0.5 truncate">
                Source: {transcriptTitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200/60 transition"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Item Statement Card */}
          <div className="rounded-2xl border border-gray-200 bg-gray-50/50 p-4 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Extracted Knowledge Statement
            </span>
            <p className="text-sm font-semibold text-gray-900 leading-relaxed">
              {item.text}
            </p>

            {item.question?.text && (
              <div className="pt-2 border-t border-gray-200/80 mt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block mb-0.5">
                  Linked Discovery Question
                </span>
                <p className="text-xs text-gray-700 italic">
                  &ldquo;{item.question.text}&rdquo;
                </p>
              </div>
            )}

            {item.ownerParticipant && (
              <div className="pt-2 border-t border-gray-200/80 flex items-center gap-2 text-xs text-gray-600">
                <UserIcon className="h-3.5 w-3.5 text-gray-400" />
                <span>Assigned Owner:</span>
                <strong className="text-gray-900">{item.ownerParticipant.displayName}</strong>
                <span className="rounded bg-gray-200/80 px-1.5 py-0.2 text-[10px] text-gray-700">
                  {item.ownerParticipant.party}
                </span>
              </div>
            )}

            {item.dueDate && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <ClockIcon className="h-3.5 w-3.5 text-amber-600" />
                <span>Due Date:</span>
                <strong className="text-gray-900">
                  {new Date(item.dueDate).toLocaleDateString()}
                </strong>
                {item.dueText && <span className="text-gray-400">({item.dueText})</span>}
              </div>
            )}
          </div>

          {/* Citations / Evidence Turns */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                <DocumentMagnifyingGlassIcon className="h-4 w-4 text-[#2563EB]" />
                <span>Verbatim Dialogue Evidence ({evidenceList.length})</span>
              </h4>
              <span className="text-[11px] text-gray-400 font-medium">
                Highlighted meeting excerpts
              </span>
            </div>

            {evidenceList.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-xs text-gray-400">
                No direct utterance line numbers were mapped for this item.
              </div>
            ) : (
              <div className="space-y-2.5">
                {evidenceList.map((ev, idx) => {
                  const utterance = ev.utterance || {};
                  return (
                    <div
                      key={ev.id || idx}
                      className="rounded-xl border border-blue-100 bg-blue-50/30 p-3.5 space-y-1.5 shadow-2xs hover:border-blue-300 transition"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-blue-100 px-2 py-0.5 font-bold text-blue-800">
                            {utterance.speakerLabel || "Speaker"}
                          </span>
                          {utterance.seq !== undefined && (
                            <span className="text-gray-400 font-mono text-[10px]">
                              Line #{utterance.seq}
                            </span>
                          )}
                          {utterance.turnNo !== undefined && (
                            <span className="text-gray-400 text-[10px]">
                              Turn #{utterance.turnNo}
                            </span>
                          )}
                        </div>
                        <CheckCircleIcon className="h-4 w-4 text-emerald-600" />
                      </div>
                      <p className="text-xs text-gray-800 leading-relaxed font-sans pl-1 border-l-2 border-blue-400">
                        {utterance.text || ev.contextText || "Dialogue turn text unavailable."}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition shadow-2xs"
          >
            Close Grounding View
          </button>
        </div>
      </div>
    </div>
  );
}

