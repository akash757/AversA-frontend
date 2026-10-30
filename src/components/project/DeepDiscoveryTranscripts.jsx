"use client";

import { useState, useMemo } from "react";
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
  ChevronDownIcon,
  ChevronUpIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import {
  previewTranscript,
  uploadTranscript,
  getTranscriptById,
  deleteTranscript,
} from "@/features/transcript/transcript";

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
      if (res?.success) {
        setPreviewData(res.data);
        toast?.success("Transcript preview generated successfully!");
      } else {
        toast?.error(res?.message || "Failed to preview transcript.");
      }
    } catch (err) {
      toast?.error(err?.message || "Error parsing transcript preview.");
    } finally {
      setIsPreviewing(false);
    }
  };

  // Submit and Index Transcript Handler
  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!form.title.trim()) {
      toast?.error("Please enter a title for the transcript.");
      return;
    }
    if (!form.text.trim()) {
      toast?.error("Please paste transcript text before submitting.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: form.title.trim(),
        text: form.text.trim(),
        meetingId: form.meetingId || undefined,
        meetingDate: form.meetingDate
          ? new Date(form.meetingDate).toISOString()
          : new Date().toISOString(),
        format: form.format || undefined,
      };

      const res = await uploadTranscript(projectId, payload);
      if (res?.success) {
        toast?.success(`Transcript saved! Parsed ${res.data?.utteranceCount ?? 0} dialogue turns.`);
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
      } else {
        toast?.error(res?.message || "Failed to upload transcript.");
      }
    } catch (err) {
      toast?.error(err?.message || "Error submitting transcript.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Transcript Handler
  const handleDelete = async (transcriptId) => {
    if (!confirm("Are you sure you want to delete this transcript and its indexed utterances?")) {
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
        toast?.error(res?.message || "Could not delete transcript.");
      }
    } catch (err) {
      toast?.error(err?.message || "Error deleting transcript.");
    } finally {
      setDeletingId(null);
    }
  };

  // Open Utterance Detail Modal
  const handleOpenDetail = async (transcriptId) => {
    setIsLoadingDetail(true);
    setSelectedTranscript({ id: transcriptId, isLoading: true });
    try {
      const res = await getTranscriptById(transcriptId, true);
      if (res?.success) {
        setSelectedTranscript(res.data);
      } else {
        toast?.error(res?.message || "Could not load transcript details.");
        setSelectedTranscript(null);
      }
    } catch (err) {
      toast?.error(err?.message || "Error fetching transcript.");
      setSelectedTranscript(null);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Filtered Transcripts List
  const filteredTranscripts = useMemo(() => {
    if (!searchQuery.trim()) return transcripts;
    const q = searchQuery.toLowerCase();
    return transcripts.filter((t) => {
      const titleMatch = t.title?.toLowerCase().includes(q);
      const formatMatch = t.sourceFormat?.toLowerCase().includes(q);
      const speakerMatch = Array.isArray(t.detectedSpeakers)
        ? t.detectedSpeakers.some((s) => s.toLowerCase().includes(q))
        : false;
      const meetingMatch = t.meeting?.title?.toLowerCase().includes(q);
      return titleMatch || formatMatch || speakerMatch || meetingMatch;
    });
  }, [transcripts, searchQuery]);

  // Filtered Utterances inside modal
  const filteredUtterances = useMemo(() => {
    if (!selectedTranscript?.utterances) return [];
    if (!utteranceSearch.trim()) return selectedTranscript.utterances;
    const q = utteranceSearch.toLowerCase();
    return selectedTranscript.utterances.filter(
      (u) =>
        u.text?.toLowerCase().includes(q) ||
        u.speakerLabel?.toLowerCase().includes(q)
    );
  }, [selectedTranscript, utteranceSearch]);

  // Copy Utterances to Clipboard
  const handleCopyTranscriptDialogue = () => {
    if (!selectedTranscript?.utterances?.length) return;
    const textLines = selectedTranscript.utterances.map((u) => {
      const speaker = u.speakerLabel ? `${u.speakerLabel}: ` : "";
      return `${speaker}${u.text}`;
    });
    navigator.clipboard.writeText(textLines.join("\n"));
    setCopiedUtterances(true);
    toast?.success("Transcript dialogue copied to clipboard!");
    setTimeout(() => setCopiedUtterances(false), 2000);
  };

  // Format milliseconds to mm:ss
  const formatTime = (ms) => {
    if (ms === null || ms === undefined || ms < 0) return null;
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // Confidence pill helper
  const renderConfidenceBadge = (confidence) => {
    const num = typeof confidence === "number" ? Math.round(confidence * 100) : 100;
    let colorClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (num < 50) {
      colorClass = "bg-rose-50 text-rose-700 border-rose-200";
    } else if (num < 80) {
      colorClass = "bg-amber-50 text-amber-700 border-amber-200";
    }
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${colorClass}`}
      >
        <SparklesIcon className="h-3 w-3" />
        {num}% Parse Confidence
      </span>
    );
  };

  const lineCount = form.text ? form.text.split("\n").length : 0;
  const charCount = form.text.length;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. Deep Discovery Header Banner */}
      <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#2563EB] text-white shadow-sm">
              <DocumentTextIcon className="h-6 w-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                  Deep Discovery Active
                </span>
                <span className="text-xs font-semibold text-gray-500">
                  Stage 2 of 3
                </span>
              </div>
              <h2 className="text-lg font-black text-gray-900 tracking-tight mt-1">
                Meeting Transcription & Dialogue Parser
              </h2>
              <p className="mt-1 text-xs text-gray-600 max-w-2xl leading-relaxed">
                Paste meeting transcripts from Zoom, Google Meet, or Microsoft Teams. The engine will segment utterances, extract participants, and index dialogue for automated requirements synthesis.
              </p>
            </div>
          </div>

          {onSwitchToQuestions && (
            <button
              type="button"
              onClick={onSwitchToQuestions}
              className="inline-flex items-center gap-2 self-start md:self-auto rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 hover:border-gray-400 transition active:scale-95 shrink-0"
            >
              <InformationCircleIcon className="h-4 w-4 text-[#2563EB]" />
              <span>Inspect Day 1 Questionnaire</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Paste Transcript Form Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 flex items-center gap-2">
              <ArrowUpTrayIcon className="h-4 w-4 text-[#2563EB]" />
              <span>1. Paste Raw Meeting Transcription</span>
            </h3>
            <p className="mt-0.5 text-xs text-gray-500">
              Supports WebVTT (.vtt), SubRip (.srt), MS Teams transcript copy-paste, or speaker labeled dialogues.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLoadSample}
              className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/80 px-3 py-1.5 text-xs font-semibold text-[#2563EB] hover:bg-blue-100 transition shadow-2xs"
            >
              <SparklesIcon className="h-3.5 w-3.5" />
              <span>Load Sample Transcript</span>
            </button>
            {form.text && (
              <button
                type="button"
                onClick={() => {
                  setForm((prev) => ({ ...prev, text: "" }));
                  setPreviewData(null);
                }}
                className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Metadata Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              rows={13}
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

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <p className="text-[11px] text-gray-500">
              💡 Tip: Click <span className="font-semibold text-gray-700">Preview Parser</span> to verify speaker detection and confidence before saving.
            </p>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                disabled={isPreviewing || !form.text.trim()}
                onClick={handlePreview}
                className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 px-4 py-2.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-2xs active:scale-95"
              >
                {isPreviewing ? (
                  <ArrowPathIcon className="h-4 w-4 animate-spin text-indigo-600" />
                ) : (
                  <SparklesIcon className="h-4 w-4 text-indigo-600" />
                )}
                <span>{isPreviewing ? "Analyzing…" : "Preview Parser"}</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !form.text.trim() || !form.title.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#1d4ed8] disabled:opacity-50 disabled:cursor-not-allowed transition active:scale-95"
              >
                {isSubmitting ? (
                  <ArrowPathIcon className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircleIcon className="h-4 w-4" />
                )}
                <span>{isSubmitting ? "Indexing Transcript…" : "Submit & Index Transcript"}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Live Parser Preview Box */}
        {previewData && (
          <div className="mt-5 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 sm:p-5 space-y-4 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100 pb-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-indigo-950 flex items-center gap-1.5">
                  <SparklesIcon className="h-4 w-4 text-indigo-600" />
                  Parser Preview
                </span>
                <span className="rounded-md bg-white border border-indigo-200 px-2 py-0.5 text-[10px] font-bold uppercase text-indigo-800">
                  Format: {previewData.sourceFormat}
                </span>
                {renderConfidenceBadge(previewData.parseConfidence)}
                <span className="rounded-md bg-white border border-indigo-200 px-2 py-0.5 text-[10px] font-bold text-indigo-800">
                  {previewData.utteranceCount} Utterances
                </span>
                {previewData.durationMs > 0 && (
                  <span className="rounded-md bg-white border border-indigo-200 px-2 py-0.5 text-[10px] font-bold text-indigo-800 flex items-center gap-1">
                    <ClockIcon className="h-3 w-3" />
                    {formatTime(previewData.durationMs)}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setPreviewData(null)}
                className="text-indigo-600 hover:text-indigo-900 text-xs font-semibold self-start sm:self-auto"
              >
                Dismiss Preview
              </button>
            </div>

            {/* Detected Speakers Chips */}
            {Array.isArray(previewData.detectedSpeakers) && previewData.detectedSpeakers.length > 0 && (
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1.5">
                  Detected Speakers ({previewData.detectedSpeakers.length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {previewData.detectedSpeakers.map((spk, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-white px-2.5 py-0.5 text-xs font-semibold text-indigo-900 shadow-2xs"
                    >
                      <UserGroupIcon className="h-3 w-3 text-indigo-500" />
                      {spk}
                    </span>
                  ))}
                </div>
              </div>
            )}

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
                    <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenDetail(trnId)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-2xs transition active:scale-95"
                      >
                        <EyeIcon className="h-4 w-4 text-[#2563EB]" />
                        <span>View Utterances</span>
                      </button>

                      <button
                        type="button"
                        disabled={deletingId === trnId}
                        onClick={() => handleDelete(trnId)}
                        className="rounded-xl border border-red-200 bg-red-50 p-2 text-red-600 hover:bg-red-100 disabled:opacity-50 transition active:scale-95"
                        title="Delete Transcript"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Detected Speakers Chips */}
                  {Array.isArray(t.detectedSpeakers) && t.detectedSpeakers.length > 0 && (
                    <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mr-1">
                        Speakers:
                      </span>
                      {t.detectedSpeakers.map((spk, idx) => (
                        <span
                          key={idx}
                          className="rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] font-medium text-gray-700"
                        >
                          {spk}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. UTTERANCE DETAIL MODAL */}
      {selectedTranscript && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-gray-200 bg-white text-gray-900 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 p-5 shrink-0">
              <div className="min-w-0 pr-4">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-[#2563EB] uppercase">
                    {selectedTranscript.sourceFormat || "Transcript"}
                  </span>
                  {selectedTranscript.parseConfidence !== undefined &&
                    renderConfidenceBadge(selectedTranscript.parseConfidence)}
                  <span className="text-xs text-gray-500">
                    {selectedTranscript.utteranceCount ?? selectedTranscript.utterances?.length ?? 0} Turns
                  </span>
                </div>
                <h3 className="text-base font-bold text-gray-900 truncate">
                  {selectedTranscript.title || "Transcript Utterances"}
                </h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyTranscriptDialogue}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-2xs transition"
                  title="Copy full dialogue text"
                >
                  {copiedUtterances ? (
                    <>
                      <ClipboardDocumentCheckIcon className="h-4 w-4 text-emerald-600" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <ClipboardDocumentIcon className="h-4 w-4 text-gray-500" />
                      <span>Copy Dialogue</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedTranscript(null)}
                  className="rounded-xl p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Filter Search */}
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/60 shrink-0">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={utteranceSearch}
                  onChange={(e) => setUtteranceSearch(e.target.value)}
                  placeholder="Filter dialogue by speaker or keyword…"
                  className="w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 py-1.5 text-xs text-gray-900 focus:border-[#2563EB] focus:outline-none"
                />
              </div>
            </div>

            {/* Scrollable Utterance List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {isLoadingDetail ? (
                <div className="flex items-center justify-center p-12 text-xs text-gray-500">
                  <ArrowPathIcon className="h-5 w-5 animate-spin mr-2 text-[#2563EB]" />
                  Loading transcript turns…
                </div>
              ) : filteredUtterances.length === 0 ? (
                <div className="p-12 text-center text-xs text-gray-500">
                  No dialogue utterances found matching your filter.
                </div>
              ) : (
                filteredUtterances.map((u, idx) => (
                  <div
                    key={u.id || idx}
                    className="rounded-xl border border-gray-200/90 bg-white p-3.5 shadow-2xs space-y-1.5 hover:border-blue-200 transition"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 border border-blue-200/60 px-2 py-0.5 text-[11px] font-bold text-blue-900">
                          {u.speakerLabel || "Unknown Speaker"}
                        </span>
                        {u.isFiller && (
                          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
                            Small Talk / Filler
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-gray-400">
                        {u.startMs !== null && u.startMs !== undefined && (
                          <span className="font-mono text-gray-500">
                            {formatTime(u.startMs)}
                            {u.endMs ? ` - ${formatTime(u.endMs)}` : ""}
                          </span>
                        )}
                        <span className="text-gray-300 font-mono">#{u.seq ?? idx + 1}</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-800 leading-relaxed font-sans">{u.text}</p>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center border-t border-gray-100 p-4 bg-gray-50 shrink-0 text-xs text-gray-500">
              <span>
                Showing {filteredUtterances.length} of {selectedTranscript.utterances?.length ?? 0} dialogue turns
              </span>
              <button
                type="button"
                onClick={() => setSelectedTranscript(null)}
                className="rounded-xl bg-gray-900 px-4 py-2 text-xs font-bold text-white hover:bg-gray-800 transition shadow-2xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

