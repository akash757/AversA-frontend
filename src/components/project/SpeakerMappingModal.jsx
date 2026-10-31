"use client";

import { useState, useEffect } from "react";
import {
  XMarkIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  ArrowPathIcon,
  UserPlusIcon,
  ShieldCheckIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import {
  getTranscriptSpeakers,
  mapTranscriptSpeakers,
  getProjectParticipants,
} from "@/features/transcript/transcript";

const PARTY_OPTIONS = [
  { value: "client", label: "Client Team", badgeClass: "bg-blue-50 text-blue-700 border-blue-200" },
  { value: "internal", label: "Internal Team (AversA)", badgeClass: "bg-purple-50 text-purple-700 border-purple-200" },
  { value: "third_party", label: "Third Party / Partner", badgeClass: "bg-amber-50 text-amber-700 border-amber-200" },
];

export default function SpeakerMappingModal({
  isOpen,
  onClose,
  transcriptId,
  projectId,
  transcriptTitle = "Transcript",
  onSuccess,
  toast,
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [speakerGroups, setSpeakerGroups] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [unlabeledCount, setUnlabeledCount] = useState(0);

  // Form mapping state: { [normKey]: { mode: 'existing' | 'new', participantId: '', displayName: '', party: 'client', jobTitle: '', isDecisionMaker: false } }
  const [speakerForms, setSpeakerForms] = useState({});

  useEffect(() => {
    if (!isOpen || !transcriptId) return;

    let isMounted = true;
    setIsLoading(true);

    async function fetchData() {
      try {
        const [speakersRes, partRes] = await Promise.all([
          getTranscriptSpeakers(transcriptId),
          projectId ? getProjectParticipants(projectId) : Promise.resolve({ data: [] }),
        ]);

        if (!isMounted) return;

        const groups = speakersRes?.data?.groups || [];
        setSpeakerGroups(groups);
        setUnlabeledCount(speakersRes?.data?.unlabeledLineCount || 0);

        const loadedParticipants = Array.isArray(partRes?.data) ? partRes.data : [];
        setParticipants(loadedParticipants);

        // Pre-populate forms
        const initial = {};
        for (const g of groups) {
          const key = g.normalizedLabel;
          if (g.isMapped && g.participant) {
            initial[key] = {
              mode: "existing",
              participantId: g.participant.id || g.participant._id,
              displayName: g.participant.displayName || g.displayLabel,
              party: g.participant.party || "client",
              jobTitle: g.participant.jobTitle || "",
              isDecisionMaker: Boolean(g.participant.isDecisionMaker),
            };
          } else {
            // Check if displayLabel matches an existing participant
            const exactMatch = loadedParticipants.find(
              (p) => p.displayName?.toLowerCase().trim() === g.displayLabel?.toLowerCase().trim()
            );

            if (exactMatch) {
              initial[key] = {
                mode: "existing",
                participantId: exactMatch.id || exactMatch._id,
                displayName: exactMatch.displayName,
                party: exactMatch.party || "client",
                jobTitle: exactMatch.jobTitle || "",
                isDecisionMaker: Boolean(exactMatch.isDecisionMaker),
              };
            } else {
              initial[key] = {
                mode: "new",
                participantId: "",
                displayName: g.displayLabel,
                party: "client",
                jobTitle: "",
                isDecisionMaker: false,
              };
            }
          }
        }
        setSpeakerForms(initial);
      } catch (err) {
        toast?.error(err?.message || "Failed to load speaker mapping details.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void fetchData();

    return () => {
      isMounted = false;
    };
  }, [isOpen, transcriptId, projectId, toast]);

  if (!isOpen) return null;

  const handleFieldChange = (key, field, value) => {
    setSpeakerForms((prev) => {
      const current = prev[key] || {};
      const updated = { ...current, [field]: value };

      if (field === "mode" && value === "new") {
        updated.participantId = "";
      } else if (field === "participantId" && value) {
        const found = participants.find((p) => (p.id || p._id) === value);
        if (found) {
          updated.displayName = found.displayName;
          updated.party = found.party;
          updated.jobTitle = found.jobTitle || "";
          updated.isDecisionMaker = Boolean(found.isDecisionMaker);
        }
      }

      return { ...prev, [key]: updated };
    });
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (isSubmitting) return;

    // Validation
    const payloadMappings = [];
    for (const g of speakerGroups) {
      const key = g.normalizedLabel;
      const form = speakerForms[key];

      if (!form) continue;

      if (form.mode === "existing") {
        if (!form.participantId) {
          toast?.error(`Please select a participant for speaker "${g.displayLabel}".`);
          return;
        }
        payloadMappings.push({
          label: g.displayLabel,
          participantId: form.participantId,
        });
      } else {
        if (!form.displayName?.trim()) {
          toast?.error(`Please enter a display name for speaker "${g.displayLabel}".`);
          return;
        }
        if (!form.party) {
          toast?.error(`Please assign a team party for speaker "${g.displayLabel}".`);
          return;
        }
        payloadMappings.push({
          label: g.displayLabel,
          displayName: form.displayName.trim(),
          party: form.party,
          jobTitle: form.jobTitle?.trim() || undefined,
          isDecisionMaker: Boolean(form.isDecisionMaker),
        });
      }
    }

    if (payloadMappings.length === 0) {
      toast?.error("No speaker mappings to save.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await mapTranscriptSpeakers(transcriptId, payloadMappings);
      if (res?.success) {
        toast?.success("Speakers mapped successfully! Transcript is ready for AI analysis.");
        if (onSuccess) onSuccess(res.data);
        onClose();
      } else {
        toast?.error(res?.message || "Failed to save speaker mappings.");
      }
    } catch (err) {
      toast?.error(err?.message || "Error submitting speaker mappings.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 via-white to-purple-50/30">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-xs">
              <UserGroupIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Review & Map Speakers</h3>
              <p className="text-xs text-slate-500 mt-0.5 truncate max-w-lg">
                Link discovered dialogue voices in <span className="font-semibold text-slate-700">{transcriptTitle}</span> to project stakeholders.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {isLoading ? (
            <div className="py-16 text-center flex flex-col items-center justify-center">
              <ArrowPathIcon className="h-8 w-8 text-purple-600 animate-spin mb-3" />
              <p className="text-sm font-semibold text-slate-700">Analyzing speaker utterances…</p>
              <p className="text-xs text-slate-400 mt-1">Extracting unique participant labels from transcript.</p>
            </div>
          ) : speakerGroups.length === 0 ? (
            <div className="py-12 text-center">
              <InformationCircleIcon className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No speaker labels detected</p>
              <p className="text-xs text-slate-500 mt-1">
                This transcript appears to be plain unstructured text without formatted speaker headers.
              </p>
            </div>
          ) : (
            <>
              {unlabeledCount > 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 flex items-start gap-3">
                  <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-800 leading-relaxed">
                    <span className="font-semibold">{unlabeledCount} lines</span> in this transcript do not have a speaker tag. They will be analyzed as general context.
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {speakerGroups.map((group) => {
                  const key = group.normalizedLabel;
                  const form = speakerForms[key] || {
                    mode: "new",
                    displayName: group.displayLabel,
                    party: "client",
                  };

                  return (
                    <div
                      key={key}
                      className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs hover:border-purple-200 transition space-y-3"
                    >
                      {/* Speaker Label & Sample Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-800 font-mono">
                            {group.displayLabel}
                          </span>
                          <span className="text-[11px] font-medium text-slate-400">
                            ({group.lineCount} utterance{group.lineCount > 1 ? "s" : ""})
                          </span>
                          {group.isMapped && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircleIcon className="h-3 w-3" /> Linked
                            </span>
                          )}
                        </div>

                        {/* Mode Selector */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleFieldChange(key, "mode", "existing")}
                            disabled={participants.length === 0}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition ${
                              form.mode === "existing"
                                ? "bg-purple-600 text-white border-purple-600 shadow-2xs"
                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 disabled:opacity-40"
                            }`}
                          >
                            Link Existing
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFieldChange(key, "mode", "new")}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition ${
                              form.mode === "new"
                                ? "bg-purple-600 text-white border-purple-600 shadow-2xs"
                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            + New Participant
                          </button>
                        </div>
                      </div>

                      {/* Sample quote */}
                      {group.exampleLine && (
                        <div className="text-[11px] italic text-slate-500 bg-slate-50/70 p-2.5 rounded-lg border border-slate-100 flex items-start gap-2">
                          <ChatBubbleLeftRightIcon className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">&ldquo;{group.exampleLine}&rdquo;</span>
                        </div>
                      )}

                      {/* Form Inputs based on mode */}
                      {form.mode === "existing" ? (
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Select Project Participant
                          </label>
                          <select
                            value={form.participantId || ""}
                            onChange={(e) => handleFieldChange(key, "participantId", e.target.value)}
                            className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="">-- Choose existing participant --</option>
                            {participants.map((p) => (
                              <option key={p.id || p._id} value={p.id || p._id}>
                                {p.displayName} ({p.party === "client" ? "Client" : p.party === "internal" ? "Internal Team" : "Third Party"})
                                {p.jobTitle ? ` - ${p.jobTitle}` : ""}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              Display Name *
                            </label>
                            <input
                              type="text"
                              value={form.displayName || ""}
                              onChange={(e) => handleFieldChange(key, "displayName", e.target.value)}
                              placeholder="Full Name"
                              className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              Team Party *
                            </label>
                            <select
                              value={form.party || "client"}
                              onChange={(e) => handleFieldChange(key, "party", e.target.value)}
                              className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                              {PARTY_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              Job Title (Optional)
                            </label>
                            <input
                              type="text"
                              value={form.jobTitle || ""}
                              onChange={(e) => handleFieldChange(key, "jobTitle", e.target.value)}
                              placeholder="e.g. CTO, Product Lead"
                              className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                          </div>

                          <div className="sm:col-span-3 flex items-center gap-2 pt-1">
                            <input
                              type="checkbox"
                              id={`decision-${key}`}
                              checked={Boolean(form.isDecisionMaker)}
                              onChange={(e) => handleFieldChange(key, "isDecisionMaker", e.target.checked)}
                              className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 h-3.5 w-3.5"
                            />
                            <label htmlFor={`decision-${key}`} className="text-xs font-medium text-slate-700 cursor-pointer">
                              Key Decision Maker (has sign-off authority on requirements & decisions)
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {speakerGroups.length > 0 && `${speakerGroups.length} speaker voice${speakerGroups.length > 1 ? "s" : ""} to map`}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition shadow-2xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || isLoading || speakerGroups.length === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-purple-600 rounded-xl hover:bg-purple-700 disabled:opacity-50 transition shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <ArrowPathIcon className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving Mappings…</span>
                </>
              ) : (
                <>
                  <ShieldCheckIcon className="h-4 w-4" />
                  <span>Confirm & Save Speakers</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
