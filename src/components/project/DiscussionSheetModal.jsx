"use client";

import { useState } from "react";
import {
  XMarkIcon,
  PrinterIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

export default function DiscussionSheetModal({
  isOpen,
  onClose,
  project,
  topics = [],
  toast,
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Compile active discussion questions (pending, asked, and suggested follow-ups)
  const discussionTopics = topics
    .map((topic) => {
      const questions = (topic.questions || []).filter(
        (q) => q.status === "pending" || q.status === "asked" || q.status === "suggested"
      );
      return {
        ...topic,
        questions,
      };
    })
    .filter((topic) => topic.questions.length > 0);

  const totalQuestions = discussionTopics.reduce(
    (acc, t) => acc + t.questions.length,
    0
  );

  const handleCopy = () => {
    let sheet = `CLIENT DISCOVERY & ALIGNMENT DISCUSSION SHEET\n`;
    sheet += `Project: ${project?.name || "Discovery"}\n`;
    sheet += `Client: ${project?.clientName || "Client Team"}\n`;
    sheet += `Date: ${new Date().toLocaleDateString()}\n`;
    sheet += `------------------------------------------------------------\n\n`;

    discussionTopics.forEach((t) => {
      sheet += `TOPIC: ${t.title.toUpperCase()}\n`;
      t.questions.forEach((q, idx) => {
        const isFollowUp = q.source === "follow_up";
        const prefix = isFollowUp ? "  ↳ [FOLLOW-UP]" : `[${idx + 1}]`;
        sheet += `${prefix} ${q.text}\n`;
        if (q.reason) sheet += `    Context/Reason: ${q.reason}\n`;
        sheet += `    Confirmed Notes: ____________________________________\n\n`;
      });
    });

    navigator.clipboard.writeText(sheet);
    setCopied(true);
    toast?.show("Discussion sheet copied to clipboard.", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-3xl max-h-[85vh] rounded-2xl bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#2563EB]">
                Meeting Readiness
              </span>
              <span className="text-xs text-gray-500">
                {totalQuestions} Active Question{totalQuestions !== 1 ? "s" : ""}
              </span>
            </div>
            <h3 className="text-base font-bold text-gray-900 mt-1">
              Client Discovery Discussion Sheet
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-2xs transition"
            >
              {copied ? (
                <>
                  <ClipboardDocumentCheckIcon className="h-4 w-4 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <ClipboardDocumentIcon className="h-4 w-4 text-gray-500" />
                  <span>Copy Sheet</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gray-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#2563EB] shadow-2xs transition"
            >
              <PrinterIcon className="h-4 w-4" />
              <span>Print / PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 print:p-0">
          <div className="border-b border-gray-200 pb-4">
            <h2 className="text-lg font-black text-gray-900">{project?.name || "Client Project"}</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Client: {project?.clientName || "Client"} • Prepared for Upcoming Alignment Sessions
            </p>
          </div>

          {discussionTopics.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-500">
              All discovery questions for this project have been answered or skipped.
            </div>
          ) : (
            discussionTopics.map((topic) => (
              <div key={topic.id || topic._id || topic.key} className="space-y-3">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-1">
                  <span className="h-2 w-2 rounded-full bg-[#2563EB]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800">
                    {topic.title}
                  </h4>
                </div>

                <div className="space-y-3">
                  {topic.questions.map((q) => {
                    const isFollowUp = q.source === "follow_up";
                    return (
                      <div
                        key={q.id || q._id}
                        className={`rounded-xl border p-3 text-xs space-y-1.5 ${
                          isFollowUp
                            ? "border-purple-200 bg-purple-50/30 ml-4"
                            : "border-gray-200 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {isFollowUp && (
                              <span className="rounded bg-purple-100 px-1.5 py-0.2 text-[9px] font-bold text-purple-800 flex items-center gap-1">
                                <SparklesIcon className="h-2.5 w-2.5" />
                                Follow-Up
                              </span>
                            )}
                            <span className="font-semibold text-gray-900">{q.text}</span>
                          </div>
                          <span className="text-[10px] uppercase font-bold text-gray-400">
                            [{q.status}]
                          </span>
                        </div>

                        {q.reason && (
                          <p className="text-[11px] text-gray-500 italic">
                            Context: {q.reason}
                          </p>
                        )}

                        <div className="mt-2 pt-2 border-t border-dashed border-gray-200 text-[10px] text-gray-400">
                          Client Notes: ___________________________________________________________
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            Tip: Keep this discussion sheet handy during discovery calls.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

