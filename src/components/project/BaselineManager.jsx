"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  ShieldCheckIcon,
  DocumentCheckIcon,
  LockClosedIcon,
  PlusIcon,
  TrashIcon,
  PencilSquareIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ClockIcon,
  CheckCircleIcon,
  CheckIcon,
  XMarkIcon,
  ChevronDownIcon,
  InformationCircleIcon,
  SparklesIcon,
  BookmarkSquareIcon,
} from "@heroicons/react/24/outline";
import {
  getProjectBaselines,
  getBaselineById,
  createDraftBaseline,
  addBaselineItem,
  updateBaselineItem,
  deleteBaselineItem,
  updateBaselineNote,
  confirmBaseline,
  discardDraftBaseline,
} from "@/features/baseline/baseline";

export default function BaselineManager({
  projectId,
  userRole = "product_manager",
  topics = [],
  toast,
  onRefreshProject,
}) {
  const [baselines, setBaselines] = useState([]);
  const [selectedBaselineId, setSelectedBaselineId] = useState(null);
  const [currentBaseline, setCurrentBaseline] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Type filter inside baseline
  const [itemTypeFilter, setItemTypeFilter] = useState("all"); // "all" | "requirement" | "decision" | "answer"

  // Draft Edit States
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);

  // Manual Add Item Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    type: "requirement",
    text: "",
    questionText: "",
    topicKey: "",
  });
  const [isSubmittingItem, setIsSubmittingItem] = useState(false);

  // Edit Item Modal
  const [editingItem, setEditingItem] = useState(null);
  const [editItemForm, setEditItemForm] = useState({
    text: "",
    questionText: "",
    topicKey: "",
  });
  const [isUpdatingItem, setIsUpdatingItem] = useState(false);

  // Freeze / Confirm Modal
  const [isFreezeModalOpen, setIsFreezeModalOpen] = useState(false);
  const [freezeData, setFreezeData] = useState(null);
  const [acknowledgeWarnings, setAcknowledgeWarnings] = useState(false);
  const [isFreezing, setIsFreezing] = useState(false);

  // Discard Draft Modal
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);

  // Role permissions
  const isManager = [
    "superadmin",
    "admin",
    "product_manager",
    "project_manager",
  ].includes(userRole);

  const canConfirm = [
    "superadmin",
    "admin",
    "product_manager",
  ].includes(userRole);

  // Fetch all baselines for project
  const fetchBaselines = useCallback(async (selectId = null) => {
    setIsLoading(true);
    try {
      const res = await getProjectBaselines(projectId);
      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.baselines)
        ? res.data.baselines
        : [];
      setBaselines(list);

      // Select target baseline or latest version
      const targetId = selectId || (list.length > 0 ? list[0].id : null);
      setSelectedBaselineId(targetId);
    } catch (err) {
      console.error("Failed to load baselines:", err);
      toast?.show("Failed to load requirement baselines.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [projectId, toast]);

  useEffect(() => {
    fetchBaselines();
  }, [fetchBaselines]);

  // Load detailed baseline data when selectedBaselineId changes
  const fetchBaselineDetail = useCallback(async (id) => {
    if (!id) {
      setCurrentBaseline(null);
      return;
    }
    setIsLoadingDetail(true);
    try {
      const res = await getBaselineById(id);
      const bsl = res?.data?.baseline || res?.data;
      setCurrentBaseline(bsl);
      setNoteText(bsl?.note || "");
    } catch (err) {
      console.error("Failed to load baseline detail:", err);
      toast?.show("Failed to load baseline details.", "error");
    } finally {
      setIsLoadingDetail(false);
    }
  }, [toast]);

  useEffect(() => {
    if (selectedBaselineId) {
      fetchBaselineDetail(selectedBaselineId);
    }
  }, [selectedBaselineId, fetchBaselineDetail]);

  // Create Draft Baseline
  const handleCreateDraft = async () => {
    setIsLoading(true);
    try {
      const res = await createDraftBaseline(projectId);
      const newDraft = res?.data?.baseline || res?.data;
      toast?.show(
        `Draft Baseline v${newDraft?.version || ""} created with accepted discovery items.`,
        "success"
      );
      await fetchBaselines(newDraft?.id);
    } catch (err) {
      const msg = err?.message || err?.response?.data?.message || "Failed to create draft baseline.";
      toast?.show(msg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Save Note
  const handleSaveNote = async () => {
    if (!currentBaseline?.id) return;
    setIsSavingNote(true);
    try {
      await updateBaselineNote(currentBaseline.id, { note: noteText.trim() || null });
      setCurrentBaseline((prev) => ({ ...prev, note: noteText.trim() || null }));
      setIsEditingNote(false);
      toast?.show("Baseline note updated.", "success");
    } catch (err) {
      toast?.show(err?.message || "Failed to save note.", "error");
    } finally {
      setIsSavingNote(false);
    }
  };

  // Add Manual Item
  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!currentBaseline?.id || !addForm.text.trim()) return;

    setIsSubmittingItem(true);
    try {
      const payload = {
        type: addForm.type,
        text: addForm.text.trim(),
        questionText: addForm.type === "answer" ? addForm.questionText.trim() || undefined : undefined,
        topicKey: addForm.topicKey || undefined,
      };
      await addBaselineItem(currentBaseline.id, payload);
      toast?.show("Item added to draft baseline.", "success");
      setIsAddModalOpen(false);
      setAddForm({ type: "requirement", text: "", questionText: "", topicKey: "" });
      fetchBaselineDetail(currentBaseline.id);
    } catch (err) {
      toast?.show(err?.message || "Failed to add baseline item.", "error");
    } finally {
      setIsSubmittingItem(false);
    }
  };

  // Save Item Edit
  const handleSaveItemEdit = async (e) => {
    e.preventDefault();
    if (!currentBaseline?.id || !editingItem?.id || !editItemForm.text.trim()) return;

    setIsUpdatingItem(true);
    try {
      const payload = {
        text: editItemForm.text.trim(),
        questionText: editingItem.type === "answer" ? editItemForm.questionText.trim() : undefined,
        topicKey: editItemForm.topicKey || undefined,
      };
      await updateBaselineItem(currentBaseline.id, editingItem.id, payload);
      toast?.show("Item updated.", "success");
      setEditingItem(null);
      fetchBaselineDetail(currentBaseline.id);
    } catch (err) {
      toast?.show(err?.message || "Failed to update item.", "error");
    } finally {
      setIsUpdatingItem(false);
    }
  };

  // Delete Baseline Item
  const handleDeleteItem = async (itemId) => {
    if (!currentBaseline?.id) return;
    try {
      await deleteBaselineItem(currentBaseline.id, itemId);
      toast?.show("Item removed from this draft snapshot.", "success");
      fetchBaselineDetail(currentBaseline.id);
    } catch (err) {
      toast?.show(err?.message || "Failed to remove item.", "error");
    }
  };

  // Confirm / Freeze Baseline
  const handleConfirmBaseline = async () => {
    if (!currentBaseline?.id) return;
    setIsFreezing(true);
    try {
      await confirmBaseline(currentBaseline.id, {
        acknowledgeWarnings,
      });
      toast?.show(
        `Requirement Baseline v${currentBaseline.version} confirmed! Stage advanced to Requirements Confirmed.`,
        "success"
      );
      setIsFreezeModalOpen(false);
      setAcknowledgeWarnings(false);
      await fetchBaselines(currentBaseline.id);
      if (onRefreshProject) onRefreshProject();
    } catch (err) {
      const status = err?.status || err?.response?.status;
      const data = err?.data || err?.response?.data;
      if (status === 409 && data?.readiness) {
        setFreezeData(data.readiness);
        setIsFreezeModalOpen(true);
      } else {
        toast?.show(data?.message || err?.message || "Failed to confirm baseline.", "error");
      }
    } finally {
      setIsFreezing(false);
    }
  };

  // Discard Draft
  const handleDiscardDraft = async () => {
    if (!currentBaseline?.id) return;
    setIsDiscarding(true);
    try {
      await discardDraftBaseline(currentBaseline.id);
      toast?.show("Draft baseline discarded.", "success");
      setIsDiscardModalOpen(false);
      await fetchBaselines();
    } catch (err) {
      toast?.show(err?.message || "Failed to discard draft.", "error");
    } finally {
      setIsDiscarding(false);
    }
  };

  const isDraft = currentBaseline?.status === "draft";
  const items = useMemo(
    () => (Array.isArray(currentBaseline?.items) ? currentBaseline.items : []),
    [currentBaseline?.items]
  );

  const filteredItems = useMemo(() => {
    if (itemTypeFilter === "all") return items;
    return items.filter((it) => it.type === itemTypeFilter);
  }, [items, itemTypeFilter]);

  const counts = useMemo(() => {
    const total = items.length;
    const requirements = items.filter((it) => it.type === "requirement").length;
    const decisions = items.filter((it) => it.type === "decision").length;
    const answers = items.filter((it) => it.type === "answer").length;
    return { total, requirements, decisions, answers };
  }, [items]);

  return (
    <div className="space-y-6">
      {/* Header & Baseline Version Bar */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 flex items-center gap-2">
              <ShieldCheckIcon className="h-4 w-4 text-[#2563EB]" />
              <span>Requirement Baselines (Signed Scope Snapshots)</span>
            </h3>
            <p className="mt-0.5 text-xs text-gray-500">
              Immutable versioned specifications freezing agreed client requirements, architectural decisions, and questionnaire answers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Version Selector */}
            {baselines.length > 0 && (
              <select
                value={selectedBaselineId || ""}
                onChange={(e) => setSelectedBaselineId(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#2563EB] shadow-2xs"
              >
                {baselines.map((b) => (
                  <option key={b.id} value={b.id}>
                    v{b.version} [{b.status?.toUpperCase()}] • {b.itemCount ?? 0} items
                  </option>
                ))}
              </select>
            )}

            {/* Create Draft Button */}
            {isManager && !baselines.some((b) => b.status === "draft") && (
              <button
                type="button"
                disabled={isLoading}
                onClick={handleCreateDraft}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gray-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#2563EB] transition shadow-2xs"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Build New Baseline Draft</span>
              </button>
            )}
          </div>
        </div>

        {/* Current Baseline Metadata & Action Pills */}
        {currentBaseline && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-md px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                  currentBaseline.status === "confirmed"
                    ? "border border-emerald-300 bg-emerald-50 text-emerald-800"
                    : currentBaseline.status === "superseded"
                    ? "border border-gray-200 bg-gray-100 text-gray-600"
                    : "border border-amber-300 bg-amber-50 text-amber-900 animate-pulse"
                }`}
              >
                Version {currentBaseline.version} • {currentBaseline.status}
              </span>

              <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                <ClockIcon className="h-3.5 w-3.5" />
                {new Date(currentBaseline.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>

              {currentBaseline.creator?.name && isManager && (
                <span className="text-xs text-gray-400">
                  • Created by {currentBaseline.creator.name}
                </span>
              )}
            </div>

            {/* Manager Actions for Draft */}
            {isDraft && isManager && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-2xs transition"
                >
                  <PlusIcon className="h-3.5 w-3.5 text-[#2563EB]" />
                  <span>Add Manual Item</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsDiscardModalOpen(true)}
                  className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 shadow-2xs transition"
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                  <span>Discard Draft</span>
                </button>

                {canConfirm && (
                  <button
                    type="button"
                    disabled={items.length === 0}
                    onClick={() => {
                      setAcknowledgeWarnings(false);
                      setIsFreezeModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-1.5 text-xs font-bold text-white hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 shadow-xs transition"
                  >
                    <LockClosedIcon className="h-3.5 w-3.5" />
                    <span>Freeze & Confirm Baseline</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Baseline Notes Section (Managers & Delivery Roles) */}
      {currentBaseline && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <BookmarkSquareIcon className="h-4 w-4 text-purple-600" />
              <span>Baseline Release Notes & Architecture Scope</span>
            </span>
            {isDraft && isManager && !isEditingNote && (
              <button
                type="button"
                onClick={() => setIsEditingNote(true)}
                className="text-xs font-semibold text-[#2563EB] hover:underline"
              >
                Edit Note
              </button>
            )}
          </div>

          {isEditingNote ? (
            <div className="space-y-2 pt-1">
              <textarea
                rows={3}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Enter version notes, architectural context, or client sign-off summary…"
                className="w-full rounded-xl border border-gray-200 p-3 text-xs text-gray-900 focus:border-[#2563EB] focus:outline-none"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isSavingNote}
                  onClick={handleSaveNote}
                  className="rounded-lg bg-[#2563EB] px-3.5 py-1 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  Save Note
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingNote(false);
                    setNoteText(currentBaseline.note || "");
                  }}
                  className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-700 leading-relaxed italic bg-gray-50/60 p-3 rounded-xl border border-gray-100">
              {currentBaseline.note || "No release notes entered for this baseline version."}
            </p>
          )}
        </div>
      )}

      {/* Items Filtering Toolbar */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setItemTypeFilter("all")}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              itemTypeFilter === "all"
                ? "bg-gray-900 text-white shadow-2xs"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All Items ({counts.total})
          </button>
          <button
            type="button"
            onClick={() => setItemTypeFilter("requirement")}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              itemTypeFilter === "requirement"
                ? "bg-blue-600 text-white shadow-2xs"
                : "bg-blue-50 text-blue-800 hover:bg-blue-100"
            }`}
          >
            Requirements ({counts.requirements})
          </button>
          <button
            type="button"
            onClick={() => setItemTypeFilter("decision")}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              itemTypeFilter === "decision"
                ? "bg-purple-600 text-white shadow-2xs"
                : "bg-purple-50 text-purple-800 hover:bg-purple-100"
            }`}
          >
            Decisions ({counts.decisions})
          </button>
          <button
            type="button"
            onClick={() => setItemTypeFilter("answer")}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              itemTypeFilter === "answer"
                ? "bg-emerald-600 text-white shadow-2xs"
                : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
            }`}
          >
            Answers ({counts.answers})
          </button>
        </div>
      </div>

      {/* Ordered Baseline Items List */}
      {isLoadingDetail ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center text-xs text-gray-500 shadow-xs">
          <ArrowPathIcon className="mx-auto h-8 w-8 text-gray-400 animate-spin mb-2" />
          Loading baseline snapshot items…
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-xs">
          <DocumentCheckIcon className="mx-auto h-12 w-12 text-gray-300 stroke-1" />
          <h4 className="mt-3 text-sm font-bold text-gray-900">
            {baselines.length === 0
              ? "No requirement baselines built yet"
              : "No items match selected type"}
          </h4>
          <p className="mt-1 text-xs text-gray-500 max-w-sm mx-auto">
            {baselines.length === 0
              ? "When client discovery questions are answered and transcript items are accepted, build your first Baseline Snapshot above."
              : "Try switching category filters to see all frozen baseline items."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item, idx) => {
            const isAnswer = item.type === "answer";
            return (
              <div
                key={item.id || idx}
                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs hover:border-blue-300 transition-all space-y-2"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[10px] text-gray-400 font-bold">
                        #{item.sortOrder ?? idx + 1}
                      </span>
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          item.type === "answer"
                            ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                            : item.type === "decision"
                            ? "border border-purple-200 bg-purple-50 text-purple-800"
                            : "border border-blue-200 bg-blue-50 text-[#2563EB]"
                        }`}
                      >
                        {item.type}
                      </span>
                      {item.topicKey && (
                        <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
                          {item.topicKey}
                        </span>
                      )}
                    </div>

                    {/* Question Text (For Answer Items) */}
                    {isAnswer && item.questionText && (
                      <div className="rounded-xl bg-gray-50 border border-gray-200/80 p-2 text-xs text-gray-700">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
                          Discovery Question:
                        </span>
                        <p className="italic">&ldquo;{item.questionText}&rdquo;</p>
                      </div>
                    )}

                    {/* Confirmed Statement Text */}
                    <p className="text-xs font-semibold text-gray-900 leading-relaxed">
                      {item.text}
                    </p>
                  </div>

                  {/* Draft Actions for Managers */}
                  {isDraft && isManager && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingItem(item);
                          setEditItemForm({
                            text: item.text || "",
                            questionText: item.questionText || "",
                            topicKey: item.topicKey || "",
                          });
                        }}
                        className="rounded-lg p-1.5 text-gray-400 hover:text-[#2563EB] hover:bg-blue-50 transition"
                        title="Edit baseline item snapshot"
                      >
                        <PencilSquareIcon className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        className="rounded-lg p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Remove from draft baseline only"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Add Manual Item */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-gray-900">
                Add Manual Item to Draft Baseline
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Item Category *
                </label>
                <select
                  value={addForm.type}
                  onChange={(e) => setAddForm((p) => ({ ...p, type: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-xs text-gray-800 focus:outline-none focus:border-[#2563EB]"
                >
                  <option value="requirement">Requirement</option>
                  <option value="decision">Decision</option>
                  <option value="answer">Answer</option>
                </select>
              </div>

              {addForm.type === "answer" && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Question Text
                  </label>
                  <input
                    type="text"
                    value={addForm.questionText}
                    onChange={(e) => setAddForm((p) => ({ ...p, questionText: e.target.value }))}
                    placeholder="e.g. What is the single-sign-on protocol required?"
                    className="w-full rounded-xl border border-gray-200 p-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Confirmed Statement / Specification *
                </label>
                <textarea
                  rows={3}
                  required
                  value={addForm.text}
                  onChange={(e) => setAddForm((p) => ({ ...p, text: e.target.value }))}
                  placeholder="Specify requirement statement, technical constraint, or decision outcome…"
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Topic Key / Domain Tag
                </label>
                <input
                  type="text"
                  value={addForm.topicKey}
                  onChange={(e) => setAddForm((p) => ({ ...p, topicKey: e.target.value }))}
                  placeholder="e.g. security_compliance, architecture_scale"
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingItem}
                  className="rounded-xl bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-2xs"
                >
                  {isSubmittingItem ? "Adding…" : "Add Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Item */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-gray-900">
                Edit Baseline Snapshot Item
              </h3>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItemEdit} className="space-y-4">
              {editingItem.type === "answer" && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Question Text
                  </label>
                  <input
                    type="text"
                    value={editItemForm.questionText}
                    onChange={(e) => setEditItemForm((p) => ({ ...p, questionText: e.target.value }))}
                    className="w-full rounded-xl border border-gray-200 p-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Statement Text *
                </label>
                <textarea
                  rows={3}
                  required
                  value={editItemForm.text}
                  onChange={(e) => setEditItemForm((p) => ({ ...p, text: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Topic Key / Domain Tag
                </label>
                <input
                  type="text"
                  value={editItemForm.topicKey}
                  onChange={(e) => setEditItemForm((p) => ({ ...p, topicKey: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingItem}
                  className="rounded-xl bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-2xs"
                >
                  {isUpdatingItem ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Freeze & Confirm Baseline with Readiness Warnings Checklist */}
      {isFreezeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-emerald-600">
              <LockClosedIcon className="h-6 w-6 shrink-0" />
              <h3 className="text-base font-bold text-gray-900">
                Confirm & Freeze Requirement Baseline v{currentBaseline?.version}
              </h3>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Confirming this baseline makes it immutable, marks it as the official contract baseline for Delivery roles, and advances the project stage to <strong className="text-gray-900">Requirements Confirmed</strong>.
            </p>

            {/* Pre-flight readiness warning checklist if any */}
            {freezeData && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 space-y-2 text-xs text-amber-900">
                <div className="flex items-center gap-2 font-bold text-amber-950">
                  <ExclamationTriangleIcon className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>Discovery Readiness Warnings:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-800">
                  {freezeData.pendingOrAskedQuestions > 0 && (
                    <li>
                      <strong>{freezeData.pendingOrAskedQuestions}</strong> discovery questions remain pending or asked.
                    </li>
                  )}
                  {freezeData.proposedExtractedItems > 0 && (
                    <li>
                      <strong>{freezeData.proposedExtractedItems}</strong> extracted items are still proposed without review.
                    </li>
                  )}
                  {freezeData.suggestedFollowUpQuestions > 0 && (
                    <li>
                      <strong>{freezeData.suggestedFollowUpQuestions}</strong> follow-up questions remain suggested.
                    </li>
                  )}
                </ul>

                <label className="flex items-start gap-2 pt-2 border-t border-amber-200/80 cursor-pointer text-xs font-semibold text-amber-950">
                  <input
                    type="checkbox"
                    checked={acknowledgeWarnings}
                    onChange={(e) => setAcknowledgeWarnings(e.target.checked)}
                    className="mt-0.5 rounded border-amber-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>
                    I understand these items remain unresolved and wish to confirm this requirement baseline anyway.
                  </span>
                </label>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsFreezeModalOpen(false)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isFreezing || (freezeData && !acknowledgeWarnings)}
                onClick={handleConfirmBaseline}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50 transition shadow-2xs"
              >
                {isFreezing ? "Freezing…" : "Confirm & Freeze"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Discard Draft */}
      {isDiscardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <TrashIcon className="h-6 w-6 shrink-0" />
              <h3 className="text-base font-bold text-gray-900">
                Discard Draft Baseline?
              </h3>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Are you sure you want to discard Draft Baseline v{currentBaseline?.version}? Any manual items and edits added to this draft snapshot will be permanently removed. Your source accepted items and questions remain untouched.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsDiscardModalOpen(false)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDiscarding}
                onClick={handleDiscardDraft}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50 transition shadow-2xs"
              >
                {isDiscarding ? "Discarding…" : "Yes, Discard Draft"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
