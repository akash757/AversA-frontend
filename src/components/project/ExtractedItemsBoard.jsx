"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  DocumentCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  PencilSquareIcon,
  DocumentMagnifyingGlassIcon,
  CheckIcon,
  XMarkIcon,
  UserIcon,
  ClockIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import {
  getTranscriptItems,
  updateExtractedItem,
} from "@/features/items/item";
import EvidenceDrawer from "./EvidenceDrawer";

export default function ExtractedItemsBoard({
  projectId,
  transcripts = [],
  participants = [],
  toast,
  onRefreshProject,
}) {
  const [selectedTranscriptId, setSelectedTranscriptId] = useState("all");
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all"); // "all" | "answer" | "decision" | "requirement" | "action_item"
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "proposed" | "accepted" | "rejected"
  const [searchQuery, setSearchQuery] = useState("");

  // Evidence Drawer State
  const [activeEvidenceItem, setActiveEvidenceItem] = useState(null);

  // Inline Editing State
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [isUpdating, setIsUpdating] = useState({});

  // 409 Answer Replacement Conflict Modal State
  const [conflictModal, setConflictModal] = useState({
    isOpen: false,
    item: null,
  });

  // Action item assignment state
  const [assigningOwnerId, setAssigningOwnerId] = useState({});

  // Load items from selected transcript or all transcripts
  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const targetTranscripts =
        selectedTranscriptId === "all"
          ? transcripts.filter((t) => t.analysisStatus === "ready")
          : transcripts.filter((t) => (t.id || t._id) === selectedTranscriptId);

      if (targetTranscripts.length === 0) {
        setItems([]);
        setIsLoading(false);
        return;
      }

      // Fetch items in parallel for selected transcripts
      const responses = await Promise.all(
        targetTranscripts.map((t) =>
          getTranscriptItems(t.id || t._id).catch(() => ({ data: [] }))
        )
      );

      const combined = [];
      responses.forEach((res, idx) => {
        const transcriptData = targetTranscripts[idx];
        const resItems = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.items)
          ? res.data.items
          : [];
        resItems.forEach((item) => {
          combined.push({
            ...item,
            transcriptTitle: transcriptData.title,
            transcriptMeetingDate: transcriptData.meetingDate,
          });
        });
      });

      setItems(combined);
    } catch (err) {
      console.error("Failed to load extracted items:", err);
      toast?.show("Failed to load extracted items.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [selectedTranscriptId, transcripts, toast]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Handle status update (accept / reject / reopen) optimistically
  const handleUpdateStatus = async (item, newStatus, replaceAnswer = false) => {
    const itemId = item.id || item._id;
    const previousStatus = item.status;

    // Instant optimistic update
    setItems((prev) =>
      prev.map((it) =>
        (it.id || it._id) === itemId ? { ...it, status: newStatus } : it
      )
    );

    try {
      await updateExtractedItem(itemId, {
        status: newStatus,
        replaceAnswer,
      });

      toast?.show(
        `Item ${newStatus === "accepted" ? "accepted" : newStatus === "rejected" ? "rejected" : "updated"} successfully.`,
        "success"
      );

      if (onRefreshProject) {
        onRefreshProject();
      }
    } catch (err) {
      // Revert state on failure
      setItems((prev) =>
        prev.map((it) =>
          (it.id || it._id) === itemId ? { ...it, status: previousStatus } : it
        )
      );

      const status = err?.status || err?.response?.status;
      const message = err?.message || err?.response?.data?.message || "";

      // Check for 409 Conflict when accepting an answer item
      if (status === 409 && item.type === "answer") {
        setConflictModal({
          isOpen: true,
          item,
        });
        return;
      }

      toast?.show(message || "Failed to update item status.", "error");
    }
  };

  // Save inline text edits
  const handleSaveTextEdit = async (itemId) => {
    if (!editingText.trim()) return;
    setIsUpdating((prev) => ({ ...prev, [itemId]: true }));

    try {
      await updateExtractedItem(itemId, { text: editingText.trim() });
      setItems((prev) =>
        prev.map((it) =>
          (it.id || it._id) === itemId ? { ...it, text: editingText.trim() } : it
        )
      );
      setEditingItemId(null);
      toast?.show("Item statement updated.", "success");
    } catch (err) {
      toast?.show(err?.message || "Failed to update item text.", "error");
    } finally {
      setIsUpdating((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  // Update Action Item Owner
  const handleOwnerChange = async (itemId, ownerParticipantId) => {
    setIsUpdating((prev) => ({ ...prev, [itemId]: true }));
    try {
      await updateExtractedItem(itemId, {
        ownerParticipantId: ownerParticipantId || null,
      });
      const selectedParticipant = participants.find(
        (p) => (p.id || p._id) === ownerParticipantId
      );
      setItems((prev) =>
        prev.map((it) =>
          (it.id || it._id) === itemId
            ? {
                ...it,
                ownerParticipantId: ownerParticipantId || null,
                ownerParticipant: selectedParticipant || null,
              }
            : it
        )
      );
      toast?.show("Assigned owner updated.", "success");
    } catch (err) {
      toast?.show(err?.message || "Failed to assign owner.", "error");
    } finally {
      setIsUpdating((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  // Update Action Item Due Date
  const handleDueDateChange = async (itemId, dueDate) => {
    setIsUpdating((prev) => ({ ...prev, [itemId]: true }));
    try {
      await updateExtractedItem(itemId, {
        dueDate: dueDate || null,
      });
      setItems((prev) =>
        prev.map((it) =>
          (it.id || it._id) === itemId ? { ...it, dueDate: dueDate || null } : it
        )
      );
      toast?.show("Due date updated.", "success");
    } catch (err) {
      toast?.show(err?.message || "Failed to update due date.", "error");
    } finally {
      setIsUpdating((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (typeFilter !== "all" && item.type !== typeFilter) return false;
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesText = item.text?.toLowerCase().includes(query);
        const matchesQuestion = item.question?.text?.toLowerCase().includes(query);
        const matchesOwner = item.ownerParticipant?.displayName
          ?.toLowerCase()
          .includes(query);
        if (!matchesText && !matchesQuestion && !matchesOwner) return false;
      }
      return true;
    });
  }, [items, typeFilter, statusFilter, searchQuery]);

  // Counts for Metrics
  const stats = useMemo(() => {
    const total = items.length;
    const proposed = items.filter((i) => i.status === "proposed").length;
    const accepted = items.filter((i) => i.status === "accepted").length;
    const rejected = items.filter((i) => i.status === "rejected").length;
    const answers = items.filter((i) => i.type === "answer").length;
    const decisions = items.filter((i) => i.type === "decision").length;
    const requirements = items.filter((i) => i.type === "requirement").length;
    const actions = items.filter((i) => i.type === "action_item").length;

    return { total, proposed, accepted, rejected, answers, decisions, requirements, actions };
  }, [items]);

  return (
    <div className="space-y-6">
      {/* Metrics Banner */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 flex items-center gap-2">
              <DocumentCheckIcon className="h-4 w-4 text-[#2563EB]" />
              <span>Extracted Knowledge Review Board</span>
            </h3>
            <p className="mt-0.5 text-xs text-gray-500">
              Review, accept, or reject AI-discovered answers, architectural decisions, specifications, and action items.
            </p>
          </div>

          {/* Transcript Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500 shrink-0">Source Transcript:</span>
            <select
              value={selectedTranscriptId}
              onChange={(e) => setSelectedTranscriptId(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#2563EB] shadow-2xs"
            >
              <option value="all">All Indexed Transcripts ({transcripts.length})</option>
              {transcripts.map((t) => (
                <option key={t.id || t._id} value={t.id || t._id}>
                  {t.title} ({t.itemCount ?? 0} items)
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={fetchItems}
              disabled={isLoading}
              className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
              title="Refresh extracted items"
            >
              <ArrowPathIcon className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Quick Count Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-gray-100">
          <div className="rounded-xl bg-gray-50 border border-gray-100 p-2.5 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Extracted</span>
            <p className="text-base font-black text-gray-900">{stats.total}</p>
          </div>
          <div className="rounded-xl bg-amber-50/70 border border-amber-100 p-2.5 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Pending Review</span>
            <p className="text-base font-black text-amber-900">{stats.proposed}</p>
          </div>
          <div className="rounded-xl bg-emerald-50/70 border border-emerald-100 p-2.5 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Accepted</span>
            <p className="text-base font-black text-emerald-900">{stats.accepted}</p>
          </div>
          <div className="rounded-xl bg-gray-100/70 border border-gray-200 p-2.5 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Rejected</span>
            <p className="text-base font-black text-gray-700">{stats.rejected}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs space-y-3">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setTypeFilter("all")}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              typeFilter === "all"
                ? "bg-gray-900 text-white shadow-2xs"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All Categories ({stats.total})
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter("answer")}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              typeFilter === "answer"
                ? "bg-emerald-600 text-white shadow-2xs"
                : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
            }`}
          >
            Answers ({stats.answers})
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter("decision")}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              typeFilter === "decision"
                ? "bg-purple-600 text-white shadow-2xs"
                : "bg-purple-50 text-purple-800 hover:bg-purple-100"
            }`}
          >
            Decisions ({stats.decisions})
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter("requirement")}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              typeFilter === "requirement"
                ? "bg-blue-600 text-white shadow-2xs"
                : "bg-blue-50 text-blue-700 hover:bg-blue-100"
            }`}
          >
            Requirements ({stats.requirements})
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter("action_item")}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              typeFilter === "action_item"
                ? "bg-amber-600 text-white shadow-2xs"
                : "bg-amber-50 text-amber-800 hover:bg-amber-100"
            }`}
          >
            Action Items ({stats.actions})
          </button>
        </div>

        {/* Sub-Filters: Search and Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-gray-100">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search statements, questions, or assignees…"
              className="w-full rounded-xl border border-gray-200 bg-white pl-9 pr-8 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#2563EB] focus:outline-none shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mr-1">Review:</span>
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                statusFilter === "all"
                  ? "bg-gray-800 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("proposed")}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                statusFilter === "proposed"
                  ? "bg-amber-600 text-white"
                  : "bg-amber-50 text-amber-800 hover:bg-amber-100"
              }`}
            >
              Proposed ({stats.proposed})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("accepted")}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                statusFilter === "accepted"
                  ? "bg-emerald-600 text-white"
                  : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
              }`}
            >
              Accepted ({stats.accepted})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("rejected")}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                statusFilter === "rejected"
                  ? "bg-gray-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Rejected ({stats.rejected})
            </button>
          </div>
        </div>
      </div>

      {/* Items List */}
      {isLoading ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center text-xs text-gray-500 shadow-xs">
          <ArrowPathIcon className="mx-auto h-8 w-8 text-gray-400 animate-spin mb-2" />
          Loading extracted items…
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-xs">
          <QuestionMarkCircleIcon className="mx-auto h-12 w-12 text-gray-300 stroke-1" />
          <h4 className="mt-3 text-sm font-bold text-gray-900">No items match your criteria</h4>
          <p className="mt-1 text-xs text-gray-500 max-w-sm mx-auto">
            Try adjusting your category or status filters, or run AI analysis on your uploaded meeting transcripts.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const itemId = item.id || item._id;
            const isEditing = editingItemId === itemId;
            const updating = Boolean(isUpdating[itemId]);
            const evidenceCount = Array.isArray(item.evidence) ? item.evidence.length : 0;

            return (
              <div
                key={itemId}
                className={`rounded-2xl border p-4 shadow-xs transition-all ${
                  item.status === "accepted"
                    ? "border-emerald-200 bg-emerald-50/20"
                    : item.status === "rejected"
                    ? "border-gray-200 bg-gray-50/40 opacity-75"
                    : "border-gray-200 bg-white hover:border-blue-300"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div className="flex-1 min-w-0 space-y-2">
                    {/* Header Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          item.type === "answer"
                            ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                            : item.type === "decision"
                            ? "border border-purple-200 bg-purple-50 text-purple-700"
                            : item.type === "requirement"
                            ? "border border-blue-200 bg-blue-50 text-[#2563EB]"
                            : "border border-amber-200 bg-amber-50 text-amber-800"
                        }`}
                      >
                        {item.type?.replace("_", " ")}
                      </span>

                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          item.status === "accepted"
                            ? "bg-emerald-100 text-emerald-800"
                            : item.status === "rejected"
                            ? "bg-gray-100 text-gray-600"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {item.status}
                      </span>

                      {item.confidence && (
                        <span className="text-[10px] text-gray-400 font-medium">
                          Confidence: {item.confidence}
                        </span>
                      )}

                      {item.transcriptTitle && (
                        <span className="text-[10px] text-gray-400">
                          • {item.transcriptTitle}
                        </span>
                      )}
                    </div>

                    {/* Statement Text or Edit Form */}
                    {isEditing ? (
                      <div className="space-y-2">
                        <textarea
                          rows={2}
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="w-full rounded-xl border border-gray-200 p-2.5 text-xs text-gray-900 focus:border-[#2563EB] focus:outline-none"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={updating}
                            onClick={() => handleSaveTextEdit(itemId)}
                            className="rounded-lg bg-[#2563EB] px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
                          >
                            Save Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingItemId(null)}
                            className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="group relative">
                        <p className="text-xs font-semibold text-gray-900 leading-relaxed pr-6">
                          {item.text}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingItemId(itemId);
                            setEditingText(item.text);
                          }}
                          className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-700 transition"
                          title="Edit statement"
                        >
                          <PencilSquareIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Linked Discovery Question (For Answer Items) */}
                    {item.question?.text && (
                      <div className="rounded-xl bg-blue-50/60 border border-blue-100 p-2.5 text-xs text-blue-900">
                        <span className="font-bold text-[10px] uppercase tracking-wider text-blue-700 block mb-0.5">
                          Answers Discovery Question:
                        </span>
                        <p className="italic font-medium">&ldquo;{item.question.text}&rdquo;</p>
                        {item.question.topic?.title && (
                          <span className="mt-1 inline-block rounded bg-blue-100/80 px-1.5 py-0.2 text-[9px] font-semibold text-blue-800">
                            Topic: {item.question.topic.title}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Action Item Owner & Due Date Controls */}
                    {item.type === "action_item" && (
                      <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                        <div className="flex items-center gap-1.5">
                          <UserIcon className="h-3.5 w-3.5 text-gray-400" />
                          <span className="text-gray-500 text-[11px]">Owner:</span>
                          <select
                            value={item.ownerParticipantId || ""}
                            onChange={(e) => handleOwnerChange(itemId, e.target.value)}
                            className="rounded-lg border border-gray-200 bg-white px-2 py-0.5 text-xs font-medium text-gray-800 focus:outline-none focus:border-[#2563EB]"
                          >
                            <option value="">Unassigned</option>
                            {participants.map((p) => (
                              <option key={p.id || p._id} value={p.id || p._id}>
                                {p.displayName} ({p.party})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <ClockIcon className="h-3.5 w-3.5 text-gray-400" />
                          <span className="text-gray-500 text-[11px]">Due Date:</span>
                          <input
                            type="date"
                            value={
                              item.dueDate
                                ? new Date(item.dueDate).toISOString().split("T")[0]
                                : ""
                            }
                            onChange={(e) => handleDueDateChange(itemId, e.target.value)}
                            className="rounded-lg border border-gray-200 bg-white px-2 py-0.5 text-xs font-medium text-gray-800 focus:outline-none focus:border-[#2563EB]"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-wrap md:flex-col items-end gap-2 shrink-0">
                    {/* View Evidence Button */}
                    <button
                      type="button"
                      onClick={() => setActiveEvidenceItem(item)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-blue-50 hover:text-[#2563EB] hover:border-blue-200 transition shadow-2xs"
                      title="Inspect verbatim dialogue turns"
                    >
                      <DocumentMagnifyingGlassIcon className="h-3.5 w-3.5 text-[#2563EB]" />
                      <span>{evidenceCount > 0 ? `${evidenceCount} Citations` : "View Citations"}</span>
                    </button>

                    {/* Accept Button */}
                    {item.status !== "accepted" && (
                      <button
                        type="button"
                        disabled={updating}
                        onClick={() => handleUpdateStatus(item, "accepted")}
                        className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition shadow-2xs"
                      >
                        <CheckIcon className="h-3.5 w-3.5" />
                        <span>Accept</span>
                      </button>
                    )}

                    {/* Reject Button */}
                    {item.status !== "rejected" && (
                      <button
                        type="button"
                        disabled={updating}
                        onClick={() => handleUpdateStatus(item, "rejected")}
                        className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 disabled:opacity-50 transition shadow-2xs"
                      >
                        <XMarkIcon className="h-3.5 w-3.5" />
                        <span>Reject</span>
                      </button>
                    )}

                    {/* Reopen Button */}
                    {item.status !== "proposed" && (
                      <button
                        type="button"
                        disabled={updating}
                        onClick={() => handleUpdateStatus(item, "proposed")}
                        className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-2 py-1 text-[11px] font-medium text-gray-500 hover:bg-gray-100 disabled:opacity-50 transition"
                      >
                        <ArrowPathIcon className="h-3 w-3" />
                        <span>Revert to Proposed</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Evidence Drawer */}
      <EvidenceDrawer
        isOpen={Boolean(activeEvidenceItem)}
        onClose={() => setActiveEvidenceItem(null)}
        item={activeEvidenceItem}
        transcriptTitle={activeEvidenceItem?.transcriptTitle}
      />

      {/* 409 Conflict Answer Replacement Modal */}
      {conflictModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <ExclamationTriangleIcon className="h-6 w-6 shrink-0" />
              <h3 className="text-base font-bold text-gray-900">
                Question Already Has An Accepted Answer
              </h3>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              The linked discovery question:
              <strong className="block text-gray-900 mt-1 italic">
                &ldquo;{conflictModal.item?.question?.text}&rdquo;
              </strong>
              already has an accepted answer in the discovery matrix. Do you want to overwrite and replace the existing answer with this new statement?
            </p>

            <div className="rounded-xl bg-gray-50 border border-gray-200 p-3 text-xs text-gray-800">
              <span className="font-bold text-[10px] uppercase tracking-wider text-gray-500 block mb-1">
                New Answer Statement:
              </span>
              {conflictModal.item?.text}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setConflictModal({ isOpen: false, item: null })}
                className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const it = conflictModal.item;
                  setConflictModal({ isOpen: false, item: null });
                  handleUpdateStatus(it, "accepted", true);
                }}
                className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700 transition shadow-2xs"
              >
                Yes, Replace Answer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

