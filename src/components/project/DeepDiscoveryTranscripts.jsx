"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  DocumentTextIcon,
  SparklesIcon,
  ArrowUpTrayIcon,
  EyeIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  UserPlusIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import {
  previewTranscript,
  uploadTranscript,
  getTranscriptById,
  deleteTranscript,
  triggerTranscriptAnalysis,
  getTranscriptAnalysisStatus,
} from "@/features/transcript/transcript";
import SpeakerMappingModal from "./SpeakerMappingModal";

const FORMAT_OPTIONS = [
  { value: "", label: "Auto-Detect Format (Recommended)" },
  { value: "teams_paste", label: "Microsoft Teams (Chat / Transcript Paste)" },
  { value: "vtt", label: "WebVTT (.vtt format)" },
  { value: "srt", label: "SubRip Subtitles (.srt format)" },
  { value: "timestamp_name", label: "Timestamp + Name (e.g. 01:23 John: text)" },
  { value: "timestamp", label: "Timestamp Only (e.g. 01:23 text)" },
  { value: "labeled", label: "Labeled Speaker (e.g. John Doe: text)" },
  { value: "plain", label: "Plain Text (Paragraphs / Notes)" },
];

const SAMPLE_TRANSCRIPT = `00:00:10 Liam (Tech Lead): Welcome everyone. Today we are kicking off deep discovery to define system scalability, SLA requirements, and the multi-tenant architecture.
00:00:26 Maya (Solutions Architect): Thanks Liam. On the database layer, we anticipate needing schema-per-tenant on PostgreSQL with dedicated read replicas for analytics queries.
00:00:44 Liam (Tech Lead): What is the expected peak write throughput per tenant during business hours?
00:00:58 Maya (Solutions Architect): Up to 3,500 transactions per second during end-of-quarter financial reconciliation.
00:01:15 Liam (Tech Lead): That will require Redis cluster caching for session lookups and Kafka for asynchronous audit events. What are the uptime guarantees?
00:01:32 Maya (Solutions Architect): 99.95% availability with multi-region failover under 60 seconds.`;

export default function DeepDiscoveryTranscripts({
  projectId,
  meetings = [],
  transcripts = [],
  onRefreshTranscripts,
  onSwitchToQuestions,
  onViewItems,
  toast,
}) {
  // Form State
  const [form, setForm] = useState({
    title: "",
    meetingId: "",
    meetingDate: new Date().toISOString().split("T")[0],
    format: "",
    text: "",
  });

  // Preview State
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [showFullPreviewList, setShowFullPreviewList] = useState(false);

  // Submission & Mutation States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Speaker Mapping & AI Analysis States
  const [mappingTranscript, setMappingTranscript] = useState(null);
  const [analyzingIds, setAnalyzingIds] = useState({});

  // Search Filter for Indexed Transcripts
  const [searchQuery, setSearchQuery] = useState("");

  // Utterance Detail Modal
  const [selectedTranscript, setSelectedTranscript] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [utteranceSearch, setUtteranceSearch] = useState("");
  const [copiedUtterances, setCopiedUtterances] = useState(false);

  // Handle Meeting Dropdown Change
  const handleMeetingChange = (meetingId) => {
    if (!meetingId) {
      setForm((prev) => ({ ...prev, meetingId: "" }));
      return;
    }
    const found = meetings.find((m) => (m.id || m._id) === meetingId);
    let dateStr = form.meetingDate;
    if (found?.startTime) {
      try {
        dateStr = new Date(found.startTime).toISOString().split("T")[0];
      } catch {
        // fallback
      }
    }
    setForm((prev) => ({
      ...prev,
      meetingId,
      meetingDate: dateStr,
      title: prev.title || (found?.title ? `Transcript: ${found.title}` : ""),
    }));
  };

  // Quick Sample Loader
  const handleLoadSample = () => {
    setForm((prev) => ({
      ...prev,
      title: prev.title || "Architecture & Scalability Deep Discovery",
      text: SAMPLE_TRANSCRIPT,
    }));
    toast?.info("Sample meeting transcript loaded into text area.");
  };

  // Trigger Background AI Extraction Analysis (Defined once)
  const handleTriggerAnalysis = async (transcriptId) => {
    if (analyzingIds[transcriptId]) return;
    setAnalyzingIds((prev) => ({ ...prev, [transcriptId]: true }));

    try {
      const res = await triggerTranscriptAnalysis(transcriptId);
      if (res?.success) {
        toast?.success("AI extraction pipeline started in background!");
        if (onRefreshTranscripts) {
          await onRefreshTranscripts();
        }
      } else {
        toast?.error(res?.message || "Failed to trigger AI analysis.");
      }
    } catch (err) {
      toast?.error(err?.message || "Error starting transcript analysis.");
    } finally {
      setAnalyzingIds((prev) => ({ ...prev, [transcriptId]: false }));
    }
  };

  // Poll for background analysis completion
  useEffect(() => {
    const running = (transcripts || []).filter((t) => t.analysisStatus === "running");
    if (running.length === 0) return;

    const intervalId = setInterval(async () => {
      let shouldRefresh = false;
      for (const t of running) {
        const trnId = t.id || t._id;
        try {
          const statusRes = await getTranscriptAnalysisStatus(trnId);
          if (statusRes?.success && statusRes.data?.status !== "running") {
            shouldRefresh = true;
            if (statusRes.data.status === "ready") {
              toast?.success(`✨ AI Analysis Complete for "${t.title}"! Items and follow-ups extracted.`);
            } else if (statusRes.data.status === "failed") {
              toast?.error(`AI Analysis failed for "${t.title}": ${statusRes.data.error || "Execution error"}`);
            }
          }
        } catch {
          // Silent polling retry
        }
      }
      if (shouldRefresh && onRefreshTranscripts) {
        onRefreshTranscripts();
      }
    }, 4000);

    return () => clearInterval(intervalId);
  }, [transcripts, onRefreshTranscripts, toast]);

  // Preview Parser Handler
  const handlePreview = async () => {
    if (!form.text.trim()) {
      toast?.error("Please paste transcript text to preview.");
      return;
    }
    setIsPreviewing(true);
    try {
      const payload = {
        text: form.text.trim(),
        format: form.format || undefined,
      };

      const res = await previewTranscript(projectId, payload);
      if (res?.success && res.data) {
        setPreviewData(res.data);
        toast?.success("Transcript preview generated successfully.");
      } else {
        toast?.error(res?.message || "Failed to parse transcript preview.");
      }
    } catch (err) {
      toast?.error(err?.message || "Network error generating preview.");
    } finally {
      setIsPreviewing(false);
    }
  };

  // Submit and Index Transcript
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast?.error("Transcript title is required.");
      return;
    }
    if (!form.text.trim()) {
      toast?.error("Transcript dialogue text is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: form.title.trim(),
        text: form.text.trim(),
        meetingDate: form.meetingDate,
        meetingId: form.meetingId || undefined,
        format: form.format || undefined,
      };

      const res = await uploadTranscript(projectId, payload);
      if (res?.success) {
        toast?.success("Transcript uploaded and indexed successfully!");
        setForm({
          title: "",
          meetingId: "",
          meetingDate: new Date().toISOString().split("T")[0],
          format: "",
          text: "",
        });
        setPreviewData(null);
        if (onRefreshTranscripts) {
          await onRefreshTranscripts();
        }

        // If unmapped speakers detected, open speaker mapping modal
        const createdTranscript = res.data?.transcript || res.data;
        if (createdTranscript?.status === "needs_speaker_mapping") {
          setMappingTranscript(createdTranscript);
        }
      } else {
        toast?.error(res?.message || "Failed to index transcript.");
      }
    } catch (err) {
      toast?.error(err?.message || "Error submitting transcript.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Transcript
  const handleDelete = async (transcriptId) => {
    if (!confirm("Are you sure you want to delete this transcript and all parsed dialogue turns?")) {
      return;
    }

    setDeletingId(transcriptId);
    try {
      const res = await deleteTranscript(transcriptId);
      if (res?.success) {
        toast?.success("Transcript deleted successfully.");
        if (onRefreshTranscripts) {
          await onRefreshTranscripts();
        }
      } else {
        toast?.error(res?.message || "Failed to delete transcript.");
      }
    } catch (err) {
      toast?.error(err?.message || "Error deleting transcript.");
    } finally {
      setDeletingId(null);
    }
  };

  // View Utterances Detail
  const handleViewUtterances = async (t) => {
    setSelectedTranscript(t);
    setIsLoadingDetail(true);
    setUtteranceSearch("");
    try {
      const trnId = t.id || t._id;
      const res = await getTranscriptById(trnId, true);
      const transcriptData = res?.data?.transcript || res?.data;
      if (res?.success && transcriptData) {
        setSelectedTranscript(transcriptData);
      }
    } catch {
      // Keep summary view if full fetch fails
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Copy Utterances
  const handleCopyUtterances = () => {
    if (!selectedTranscript?.utterances) return;
    const text = selectedTranscript.utterances
      .map((u) => `[${u.speakerLabel || "Unknown"}]: ${u.text}`)
      .join("\n\n");
    navigator.clipboard.writeText(text);
    setCopiedUtterances(true);
    toast?.success("Dialogue copied to clipboard.");
    setTimeout(() => setCopiedUtterances(false), 2000);
  };

  // Filtered Transcripts
  const filteredTranscripts = useMemo(() => {
    if (!searchQuery.trim()) return transcripts;
    const query = searchQuery.toLowerCase();
    return transcripts.filter((t) => {
      const titleMatch = t.title?.toLowerCase().includes(query);
      const meetingMatch = t.meeting?.title?.toLowerCase().includes(query);
      const formatMatch = t.sourceFormat?.toLowerCase().includes(query);
      return titleMatch || meetingMatch || formatMatch;
    });
  }, [transcripts, searchQuery]);

  // Filtered Utterances in Detail Modal
  const filteredUtterances = useMemo(() => {
    const list = selectedTranscript?.utterances || [];
    if (!utteranceSearch.trim()) return list;
    const q = utteranceSearch.toLowerCase();
    return list.filter(
      (u) => u.text?.toLowerCase().includes(q) || u.speakerLabel?.toLowerCase().includes(q)
    );
  }, [selectedTranscript, utteranceSearch]);

  const lineCount = form.text ? form.text.split("\n").length : 0;
  const charCount = form.text ? form.text.length : 0;

  const formatTime = (ms) => {
    if (ms === null || ms === undefined) return "";
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const renderConfidenceBadge = (confidence) => {
    switch (confidence) {
      case "high":
        return (
          <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
            High Confidence
          </span>
        );
      case "medium":
        return (
          <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
            Medium Confidence
          </span>
        );
      case "low":
        return (
          <span className="rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-700">
            Low Confidence
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-white p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="rounded-md border border-blue-300 bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#2563EB]">
                Stage: Deep Discovery Active
              </span>
              <span className="text-xs text-gray-500 font-medium">
                {transcripts.length} Indexed Call{transcripts.length !== 1 ? "s" : ""}
              </span>
            </div>
            <h2 className="text-base font-bold text-gray-900 tracking-tight">
              Call Transcript Processing & Dialogue Synthesis
            </h2>
            <p className="text-xs text-gray-600 max-w-2xl leading-relaxed">
              Upload meeting recordings, Teams chat dumps, or subtitle exports. AversA normalizes dialogue turns, maps speaker aliases to client stakeholders, and runs LLM extraction to automatically answer discovery items.
            </p>
          </div>

          <button
            type="button"
            onClick={onSwitchToQuestions}
            className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-white px-3.5 py-2 text-xs font-semibold text-[#2563EB] hover:bg-blue-50 transition shadow-2xs self-start md:self-auto shrink-0"
            title="Inspect Day 1 Baseline Questions"
          >
            <InformationCircleIcon className="h-4 w-4" />
            <span>View Day 1 Questionnaire</span>
          </button>
        </div>
      </div>

      {/* 2. Ingestion & Preview Section */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 flex items-center gap-2">
              <ArrowUpTrayIcon className="h-4 w-4 text-[#2563EB]" />
              <span>1. Upload Call Transcript</span>
            </h3>
            <p className="mt-0.5 text-xs text-gray-500">
              Paste raw transcript dialogue from Teams, Zoom, Google Meet, or WebVTT / SRT files.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLoadSample}
            className="inline-flex items-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-800 hover:bg-purple-100 transition shadow-2xs self-start sm:self-auto"
          >
            <SparklesIcon className="h-3.5 w-3.5 text-purple-600" />
            <span>Load Sample Architecture Dialogue</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Metadata Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Transcript Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Kickoff Architecture Discovery with CTO"
                className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs font-medium text-gray-900 focus:border-[#2563EB] focus:ring-1 focus:ring-blue-500 focus:outline-none transition"
              />
            </div>

            {/* Linked Meeting */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Link to Meeting <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <select
                value={form.meetingId}
                onChange={(e) => handleMeetingChange(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs font-medium text-gray-900 focus:border-[#2563EB] focus:ring-1 focus:ring-blue-500 focus:outline-none transition"
              >
                <option value="">-- No Meeting Linked (Ad-hoc) --</option>
                {meetings.map((m) => {
                  const mId = m.id || m._id;
                  const dateStr = m.startTime
                    ? new Date(m.startTime).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    : "";
                  return (
                    <option key={mId} value={mId}>
                      {m.title} {dateStr ? `(${dateStr})` : ""} [{m.status}]
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Meeting Date & Format Override */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Meeting Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={form.meetingDate}
                  onChange={(e) => setForm((prev) => ({ ...prev, meetingDate: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs font-medium text-gray-900 focus:border-[#2563EB] focus:ring-1 focus:ring-blue-500 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Format
                </label>
                <select
                  value={form.format}
                  onChange={(e) => setForm((prev) => ({ ...prev, format: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs font-medium text-gray-900 focus:border-[#2563EB] focus:ring-1 focus:ring-blue-500 focus:outline-none transition truncate"
                >
                  {FORMAT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Big Textarea */}
          <div className="relative">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>
                Transcript Text <span className="text-rose-500">*</span>
              </span>
              <span className="text-[11px] font-normal text-gray-400">
                {lineCount} lines • {charCount.toLocaleString()} chars
              </span>
            </label>
            <textarea
              rows={11}
              value={form.text}
              onChange={(e) => setForm((prev) => ({ ...prev, text: e.target.value }))}
              placeholder={`Paste raw transcript text here...

Example formats supported:
1. Microsoft Teams chat paste:
   John Doe 10:15 AM
   Here are our core performance metrics...

2. Timestamped dialogue:
   00:01:23 Sarah: We must maintain latency below 200ms.
   00:01:35 Alex: Understood, we will configure Redis clusters.

3. Standard WebVTT (.vtt) or SubRip (.srt) subtitle files.`}
              className="w-full font-mono text-xs text-gray-900 bg-gray-50/50 rounded-2xl border border-gray-200 p-4 leading-relaxed focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition"
            />
          </div>

          {/* Actions Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="text-[11px] text-gray-500 flex items-center gap-1.5">
              <InformationCircleIcon className="h-4 w-4 text-blue-500 shrink-0" />
              <span>Filler words (uh, um, you know) are scrubbed automatically without altering meaning.</span>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                disabled={isPreviewing || !form.text.trim()}
                onClick={handlePreview}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition shadow-2xs"
              >
                <EyeIcon className="h-4 w-4 text-gray-500" />
                <span>{isPreviewing ? "Analyzing Structure…" : "Preview Parsed Turns"}</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !form.text.trim()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-5 py-2 text-xs font-bold text-white hover:bg-[#1d4ed8] disabled:opacity-50 transition shadow-xs"
              >
                <ArrowUpTrayIcon className="h-4 w-4" />
                <span>{isSubmitting ? "Indexing Dialogue…" : "Submit & Index Transcript"}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Real-Time Preview Results Drawer */}
        {previewData && (
          <div className="rounded-2xl border border-blue-200 bg-blue-50/30 p-5 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-start justify-between">
              <div>
                <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#2563EB]">
                  Parser Diagnostics & Quality Assessment
                </span>
                <h4 className="text-sm font-bold text-gray-900 mt-1">
                  Format Detected: <span className="uppercase text-[#2563EB]">{previewData.detectedFormat}</span>
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setPreviewData(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="rounded-xl bg-white border border-blue-100 p-2.5 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Turns</span>
                <p className="text-base font-black text-gray-900">{previewData.utteranceCount}</p>
              </div>

              <div className="rounded-xl bg-white border border-blue-100 p-2.5 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Unique Speakers</span>
                <p className="text-base font-black text-[#2563EB]">
                  {Array.isArray(previewData.detectedSpeakers) ? previewData.detectedSpeakers.length : 0}
                </p>
              </div>

              <div className="rounded-xl bg-white border border-blue-100 p-2.5 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Confidence</span>
                <div className="mt-0.5 flex justify-center">
                  {renderConfidenceBadge(previewData.confidence)}
                </div>
              </div>

              <div className="rounded-xl bg-white border border-blue-100 p-2.5 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Estimated Duration</span>
                <p className="text-base font-black text-gray-900">
                  {previewData.durationMs ? formatTime(previewData.durationMs) : "Unknown"}
                </p>
              </div>
            </div>

            {/* Warnings if any */}
            {Array.isArray(previewData.warnings) && previewData.warnings.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ExclamationTriangleIcon className="h-4 w-4 text-amber-600" />
                  Parser Warnings ({previewData.warnings.length}):
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-700">
                  {previewData.warnings.map((w, idx) => (
                    <li key={idx}>
                      {w.code ? `[${w.code}] ` : ""}
                      {w.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Utterance preview sample */}
            {Array.isArray(previewData.previewUtterances) && previewData.previewUtterances.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    Sample Parsed Dialogue (Showing first {previewData.previewUtterances.length} turns):
                  </span>
                  {previewData.previewUtterances.length > 5 && (
                    <button
                      type="button"
                      onClick={() => setShowFullPreviewList((p) => !p)}
                      className="text-xs font-semibold text-[#2563EB] hover:underline"
                    >
                      {showFullPreviewList ? "Show Less" : "Show All Preview"}
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {(showFullPreviewList
                    ? previewData.previewUtterances
                    : previewData.previewUtterances.slice(0, 5)
                  ).map((u, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-gray-200/80 bg-white p-2.5 text-xs shadow-2xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-gray-900">
                          {u.speakerLabel || "Unknown Speaker"}
                        </span>
                        <div className="flex items-center gap-2 text-gray-400">
                          {u.startMs !== null && u.startMs !== undefined && (
                            <span>{formatTime(u.startMs)}</span>
                          )}
                          {u.isFiller && (
                            <span className="rounded bg-gray-100 px-1.5 py-0.2 text-[9px] font-medium text-gray-500">
                              Filler
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-700 leading-relaxed font-sans">{u.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Indexed Meeting Transcripts Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 flex items-center gap-2">
              <DocumentTextIcon className="h-4 w-4 text-[#2563EB]" />
              <span>2. Indexed Call Transcripts ({transcripts.length})</span>
            </h3>
            <p className="mt-0.5 text-xs text-gray-500">
              Structured transcripts available for requirements validation and deep synthesis.
            </p>
          </div>

          {transcripts.length > 0 && (
            <div className="relative min-w-[240px]">
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search transcripts or speakers…"
                className="w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 py-1.5 text-xs text-gray-900 focus:border-[#2563EB] focus:outline-none"
              />
            </div>
          )}
        </div>

        {transcripts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-xs">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-300 stroke-1" />
            <h4 className="mt-3 text-sm font-bold text-gray-900">
              No meeting transcripts indexed yet
            </h4>
            <p className="mt-1 text-xs text-gray-500 max-w-md mx-auto">
              Paste your first call transcription above and click &quot;Submit & Index Transcript&quot; to begin deep discovery analysis.
            </p>
          </div>
        ) : filteredTranscripts.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-xs text-gray-500">
            No transcripts matched your search for &quot;{searchQuery}&quot;.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredTranscripts.map((t) => {
              const trnId = t.id || t._id;
              const dateStr = t.meetingDate
                ? new Date(t.meetingDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "No date";

              return (
                <div
                  key={trnId}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs hover:border-blue-300 transition-all space-y-3"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-700">
                          {t.sourceFormat || "Transcript"}
                        </span>
                        {renderConfidenceBadge(t.parseConfidence)}
                        <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-[#2563EB]">
                          {t.utteranceCount ?? 0} Utterances
                        </span>
                        {t.status === "needs_speaker_mapping" ? (
                          <button
                            type="button"
                            onClick={() => setMappingTranscript(t)}
                            className="inline-flex items-center gap-1 rounded-md border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 hover:bg-amber-100 transition shadow-2xs cursor-pointer"
                          >
                            <UserPlusIcon className="h-3 w-3 text-amber-600" />
                            <span>Needs Speaker Mapping</span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                            <ShieldCheckIcon className="h-3 w-3 text-emerald-600" />
                            <span>Speakers Mapped</span>
                          </span>
                        )}
                        {t.durationMs > 0 && (
                          <span className="text-[11px] text-gray-400 flex items-center gap-1">
                            <ClockIcon className="h-3 w-3" />
                            {formatTime(t.durationMs)}
                          </span>
                        )}
                      </div>

                      <h4 className="text-base font-bold text-gray-900 tracking-tight truncate">
                        {t.title}
                      </h4>

                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <CalendarDaysIcon className="h-3.5 w-3.5 text-gray-400" />
                          Meeting Date: <strong className="text-gray-700 font-semibold">{dateStr}</strong>
                        </span>
                        {t.meeting?.title && (
                          <span className="flex items-center gap-1">
                            • Linked Call: <strong className="text-[#2563EB] font-semibold">{t.meeting.title}</strong>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2 self-start md:self-auto shrink-0">
                      {/* AI Analysis Button & Status */}
                      {t.analysisStatus === "running" ? (
                        <div className="inline-flex items-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50/90 px-3 py-1.5 text-xs font-semibold text-purple-700 animate-pulse shadow-2xs">
                          <SparklesIcon className="h-3.5 w-3.5 animate-spin text-purple-600" />
                          <span>AI Analyzing Dialogue…</span>
                        </div>
                      ) : t.analysisStatus === "ready" ? (
                        <div className="inline-flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700">
                            <CheckCircleIcon className="h-3.5 w-3.5 text-emerald-600" />
                            <span>{t.itemCount ?? 0} Items</span>
                            {t.followUpCount > 0 && <span className="text-emerald-600">• {t.followUpCount} Follow-ups</span>}
                          </span>
                          {onViewItems && (
                            <button
                              type="button"
                              onClick={() => onViewItems(trnId)}
                              className="inline-flex items-center gap-1 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 px-2.5 py-1.5 text-xs font-semibold shadow-2xs transition cursor-pointer"
                            >
                              <span>View Discovered Items &rarr;</span>
                            </button>
                          )}
                          <button
                            type="button"
                            disabled={analyzingIds[trnId]}
                            onClick={() => handleTriggerAnalysis(trnId)}
                            className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 shadow-2xs transition"
                            title="Re-run AI extraction pipeline"
                          >
                            <ArrowPathIcon className="h-3 w-3 text-gray-400" />
                            <span>Re-run</span>
                          </button>
                        </div>
                      ) : t.analysisStatus === "failed" ? (
                        <button
                          type="button"
                          disabled={analyzingIds[trnId]}
                          onClick={() => handleTriggerAnalysis(trnId)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 shadow-2xs transition"
                        >
                          <ArrowPathIcon className="h-3.5 w-3.5" />
                          <span>Retry AI Analysis</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={analyzingIds[trnId] || t.status === "needs_speaker_mapping"}
                          onClick={() => handleTriggerAnalysis(trnId)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-purple-200 bg-gradient-to-r from-purple-600 to-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 shadow-xs transition active:scale-95 cursor-pointer"
                          title={
                            t.status === "needs_speaker_mapping"
                              ? "Map speakers before triggering AI analysis"
                              : "Synthesize transcript with AI"
                          }
                        >
                          <SparklesIcon className="h-3.5 w-3.5" />
                          <span>Analyze Transcript</span>
                        </button>
                      )}

                      {/* View Utterances Button */}
                      <button
                        type="button"
                        onClick={() => handleViewUtterances(t)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-2xs transition"
                        title="View parsed turn-by-turn dialogue"
                      >
                        <EyeIcon className="h-3.5 w-3.5 text-gray-500" />
                        <span>Inspect Turns</span>
                      </button>

                      {/* Delete Transcript Button */}
                      <button
                        type="button"
                        disabled={deletingId === trnId}
                        onClick={() => handleDelete(trnId)}
                        className="rounded-xl border border-rose-100 bg-rose-50/50 p-1.5 text-rose-600 hover:bg-rose-100 disabled:opacity-50 transition shadow-2xs"
                        title="Delete transcript"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Utterance Detail Inspection Modal */}
      {selectedTranscript && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-4xl max-h-[85vh] rounded-2xl bg-white shadow-2xl flex flex-col">
            {/* Header */}
            <div className="p-5 border-b border-gray-200 flex items-start justify-between gap-4 bg-gray-50/80">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="rounded-md border border-gray-200 bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-700">
                    {selectedTranscript.sourceFormat || "Transcript"}
                  </span>
                  {renderConfidenceBadge(selectedTranscript.parseConfidence)}
                </div>
                <h3 className="text-base font-bold text-gray-900 truncate">
                  {selectedTranscript.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTranscript(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Toolbar */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={utteranceSearch}
                  onChange={(e) => setUtteranceSearch(e.target.value)}
                  placeholder="Search verbatim dialogue…"
                  className="w-full rounded-xl border border-gray-200 pl-9 pr-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <button
                type="button"
                onClick={handleCopyUtterances}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-2xs"
              >
                {copiedUtterances ? (
                  <>
                    <ClipboardDocumentCheckIcon className="h-4 w-4 text-emerald-600" />
                    <span className="text-emerald-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <ClipboardDocumentIcon className="h-4 w-4 text-gray-500" />
                    <span>Copy Full Dialogue</span>
                  </>
                )}
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-2">
              {isLoadingDetail ? (
                <div className="p-8 text-center text-xs text-gray-500">
                  <ArrowPathIcon className="h-6 w-6 animate-spin mx-auto text-blue-600 mb-2" />
                  Loading verbatim dialogue turns…
                </div>
              ) : filteredUtterances.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-500">
                  No turns matched your search.
                </div>
              ) : (
                filteredUtterances.map((u, i) => (
                  <div
                    key={u.id || i}
                    className="rounded-xl border border-gray-200/80 bg-white p-3 text-xs shadow-2xs space-y-1 hover:border-blue-200 transition"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-gray-100 px-2 py-0.5 font-bold text-gray-800">
                          {u.speakerLabel || "Unknown Speaker"}
                        </span>
                        {u.seq !== undefined && (
                          <span className="text-gray-400 font-mono text-[10px]">
                            #{u.seq}
                          </span>
                        )}
                      </div>
                      {u.startMs !== null && u.startMs !== undefined && (
                        <span className="text-gray-400 font-mono">
                          {formatTime(u.startMs)}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 leading-relaxed font-sans pl-1">
                      {u.text}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedTranscript(null)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Speaker Mapping Modal */}
      {mappingTranscript && (
        <SpeakerMappingModal
          isOpen={Boolean(mappingTranscript)}
          onClose={() => setMappingTranscript(null)}
          transcriptId={mappingTranscript.id || mappingTranscript._id}
          transcriptTitle={mappingTranscript.title}
          projectId={projectId}
          toast={toast}
          onSuccess={() => {
            setMappingTranscript(null);
            if (onRefreshTranscripts) {
              onRefreshTranscripts();
            }
          }}
        />
      )}
    </div>
  );
}
