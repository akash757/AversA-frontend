"use client";

import { useState, useMemo, useCallback } from "react";
import {
  SparklesIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  PlusIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  LightBulbIcon,
  QuestionMarkCircleIcon,
  PencilSquareIcon,
  ClockIcon,
  CheckCircleIcon,
  MinusCircleIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolidIcon } from "@heroicons/react/24/solid";
import Badge from "@/components/Ui/Badge";
import Button from "@/components/Ui/Button";
import Card from "@/components/Ui/Card";
import ProgressBar from "@/components/Ui/ProgressBar";
import { updateProjectQuestion } from "@/features/project/project";

export default function DiscoveryQuestionsBoard({
  projectId,
  topics = [],
  setTopics,
  suggestionStatus = "none",
  briefTooThin = false,
  onRefreshQuestions,
  onAddQuestionClick,
  toast,
}) {
  const [questionSearchQuery, setQuestionSearchQuery] = useState("");
  const [selectedTopicFilter, setSelectedTopicFilter] = useState("all");
  const [questionStatusFilter, setQuestionStatusFilter] = useState("all");

  // Track expanded topics: by default EMPTY ({}), meaning ALL TOPICS ARE CLOSED BY DEFAULT
  const [expandedTopicKeys, setExpandedTopicKeys] = useState({});

  // Question detail tips expanded state
  const [expandedTips, setExpandedTips] = useState({});

  // Active status dropdown menu for a specific question ID
  const [openStatusMenuId, setOpenStatusMenuId] = useState(null);

  // Quick Inline Answer Note Modal State
  const [activeAnswerQuestion, setActiveAnswerQuestion] = useState(null);
  const [answerInputText, setAnswerInputText] = useState("");
  const [isSavingAnswer, setIsSavingAnswer] = useState(false);

  // Toggle individual topic
  const toggleTopicExpand = (topicKey) => {
    setExpandedTopicKeys((prev) => ({
      ...prev,
      [topicKey]: !prev[topicKey],
    }));
  };

  // Toggle tips
  const toggleTipExpanded = (qId) => {
    setExpandedTips((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  // Optimistic status update with automatic state revert on failure
  const applyOptimisticStatus = useCallback(
    (questionId, targetStatus, successMsg = "") => {
      let previousTopics;
      setTopics((prev) => {
        previousTopics = prev;
        return prev.map((topic) => ({
          ...topic,
          questions: (topic.questions || []).map((q) => {
            if (q.id === questionId || q._id === questionId) {
              return { ...q, status: targetStatus };
            }
            return q;
          }),
        }));
      });

      if (successMsg) {
        toast?.success?.(successMsg);
      }

      setOpenStatusMenuId(null);

      updateProjectQuestion(questionId, { status: targetStatus }, projectId)
        .then((res) => {
          if (!res?.success) {
            setTopics(previousTopics);
            toast?.error?.(res?.message || "Could not update status.");
          }
        })
        .catch((err) => {
          setTopics(previousTopics);
          toast?.error?.(err?.message || "Failed to update status. Restored previous state.");
        });
    },
    [projectId, setTopics, toast]
  );

  // Quick 1-click Toggle: cycles To Discuss -> In Meeting -> Confirmed -> To Discuss
  const handleQuickCycleStatus = (question) => {
    const qId = question.id || question._id;
    if (question.status === "answered") {
      applyOptimisticStatus(qId, "pending", "Reopened question (To Discuss)");
    } else if (question.status === "asked") {
      setActiveAnswerQuestion(question);
      setAnswerInputText(question.answerText || "");
    } else {
      applyOptimisticStatus(qId, "asked", "Marked as In Discussion");
    }
  };

  // Submit Answer Note & Confirm
  const handleSaveAnswerNote = async (e) => {
    e.preventDefault();
    if (!activeAnswerQuestion) return;

    const qId = activeAnswerQuestion.id || activeAnswerQuestion._id;
    const text = answerInputText.trim();

    setIsSavingAnswer(true);
    try {
      if (activeAnswerQuestion.status === "pending") {
        await updateProjectQuestion(qId, { status: "asked" }, projectId);
      }

      const patchPayload = {
        status: "answered",
        answerText: text || "Confirmed during discovery alignment",
      };

      const res = await updateProjectQuestion(qId, patchPayload, projectId);
      if (res?.success) {
        toast?.success?.("Requirement confirmed with answer notes!");
        setTopics((prev) =>
          prev.map((topic) => ({
            ...topic,
            questions: (topic.questions || []).map((q) =>
              (q.id === qId || q._id === qId) ? { ...q, ...patchPayload } : q
            ),
          }))
        );
        setActiveAnswerQuestion(null);
        setAnswerInputText("");
      } else {
        toast?.error?.(res?.message || "Failed to save answer.");
      }
    } catch {
      toast?.error?.("Failed to save answer.");
    } finally {
      setIsSavingAnswer(false);
    }
  };

  // Metrics across all questions
  const { allQuestions, stats } = useMemo(() => {
    const list = topics.flatMap((t) => t.questions || []);
    const total = list.length;
    const answered = list.filter((q) => q.status === "answered").length;
    const asked = list.filter((q) => q.status === "asked").length;
    const pending = list.filter((q) => q.status === "pending").length;
    const suggested = list.filter((q) => q.status === "suggested").length;
    const skipped = list.filter((q) => q.status === "skipped").length;
    const progress = total > 0 ? Math.round((answered / total) * 100) : 0;

    return {
      allQuestions: list,
      stats: { total, answered, asked, pending, suggested, skipped, progress },
    };
  }, [topics]);

  // Filtered topics
  const filteredTopics = useMemo(() => {
    return topics
      .filter((t) => {
        if (selectedTopicFilter !== "all" && (t.id || t._id || t.key) !== selectedTopicFilter) {
          return false;
        }
        return true;
      })
      .map((t) => {
        const matchingQuestions = (t.questions || []).filter((q) => {
          if (questionStatusFilter === "suggested" && q.status !== "suggested") return false;
          if (questionStatusFilter === "pending" && q.status !== "pending") return false;
          if (questionStatusFilter === "asked" && q.status !== "asked") return false;
          if (questionStatusFilter === "answered" && q.status !== "answered") return false;
          if (questionStatusFilter === "skipped" && q.status !== "skipped") return false;

          if (questionSearchQuery.trim()) {
            const query = questionSearchQuery.toLowerCase();
            const textMatch = q.text?.toLowerCase().includes(query);
            const reasonMatch = q.reason?.toLowerCase().includes(query);
            const answerMatch = q.answerText?.toLowerCase().includes(query);
            const topicMatch = t.title?.toLowerCase().includes(query);
            if (!textMatch && !reasonMatch && !answerMatch && !topicMatch) return false;
          }
          return true;
        });

        return {
          ...t,
          questions: matchingQuestions,
          totalInTopic: (t.questions || []).length,
          answeredInTopic: (t.questions || []).filter((q) => q.status === "answered").length,
        };
      })
      .filter((t) => {
        if (questionStatusFilter !== "all" || questionSearchQuery.trim()) {
          return t.questions.length > 0;
        }
        return true;
      });
  }, [topics, questionStatusFilter, selectedTopicFilter, questionSearchQuery]);

  // Are all topics open?
  const areAllTopicsOpen = useMemo(() => {
    if (filteredTopics.length === 0) return false;
    return filteredTopics.every((t) => Boolean(expandedTopicKeys[t.id || t._id || t.key]));
  }, [filteredTopics, expandedTopicKeys]);

  // Toggle All Topics (Open All / Close All)
  const handleToggleAllTopics = () => {
    if (areAllTopicsOpen) {
      // Close all
      setExpandedTopicKeys({});
    } else {
      // Open all
      const allOpen = {};
      filteredTopics.forEach((t) => {
        const key = t.id || t._id || t.key;
        if (key) allOpen[key] = true;
      });
      setExpandedTopicKeys(allOpen);
    }
  };

  return (
    <div className="space-y-4">
      {/* ── AI Suggestions Banner (Only if pending suggestions exist) ────── */}
      {suggestionStatus === "ready" && stats.suggested > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-purple-200 bg-purple-50/70 p-3.5 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white shadow-xs">
              <SparklesIcon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-purple-950 font-display">
                {stats.suggested} AI Discovery Recommendations
              </p>
              <p className="text-[11px] text-purple-800">
                Tailored questions generated from your project brief ready for review.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setQuestionStatusFilter("suggested")}
            className="rounded-xl bg-purple-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-purple-700 transition shadow-xs cursor-pointer self-start sm:self-auto"
          >
            Review Suggestions ({stats.suggested})
          </button>
        </div>
      )}

      {/* ── Discovery Control Strip (High-Clarity, Zero Overlap) ─────────── */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-4 space-y-3.5">
        {/* Tier 1: Title, Coverage Metric, Global Expand/Collapse Toggle & Add Question */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#F1F5F9] pb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#0F172A] font-display">
                  Discovery Checklist
                </h3>
                <span className="rounded-full bg-blue-50 border border-blue-200/80 text-[#2563EB] text-[11px] font-bold px-2 py-0.5">
                  {stats.answered} / {stats.total} Confirmed
                </span>
              </div>
              <p className="text-xs text-[#64748B] mt-0.5">
                Technical, operational, and delivery questions to validate with stakeholders.
              </p>
            </div>
          </div>

          {/* Right Action Controls: Expand/Collapse All + Add Question */}
          <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto">
            {/* Live Progress Bar */}
            <div className="hidden lg:flex items-center gap-2 text-xs font-bold text-[#0F172A] mr-2">
              <span>{stats.progress}%</span>
              <div className="w-24">
                <ProgressBar value={stats.progress} color="brand" size="sm" />
              </div>
            </div>

            {/* Toggle All Topics (Open All / Close All) */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleAllTopics}
              leftIcon={
                areAllTopicsOpen ? (
                  <ArrowsPointingInIcon className="h-4 w-4 text-[#2563EB]" />
                ) : (
                  <ArrowsPointingOutIcon className="h-4 w-4 text-[#2563EB]" />
                )
              }
              title={
                areAllTopicsOpen
                  ? "Collapse all question categories"
                  : "Expand all question categories"
              }
            >
              {areAllTopicsOpen ? "Close All" : "Open All"}
            </Button>

            {/* Add Question Button */}
            {onAddQuestionClick && (
              <Button
                variant="primary"
                size="sm"
                onClick={onAddQuestionClick}
                leftIcon={<PlusIcon className="h-4 w-4" />}
              >
                Add Question
              </Button>
            )}
          </div>
        </div>

        {/* Tier 2: Status Filter Tabs (Dedicated Row: Never Overlaps!) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { key: "all", label: "All Questions", count: stats.total },
            { key: "pending", label: "To Discuss", count: stats.pending },
            { key: "asked", label: "In Meeting", count: stats.asked },
            { key: "answered", label: "Confirmed", count: stats.answered },
            ...(stats.suggested > 0
              ? [{ key: "suggested", label: "AI Suggested", count: stats.suggested }]
              : []),
            ...(stats.skipped > 0
              ? [{ key: "skipped", label: "Skipped", count: stats.skipped }]
              : []),
          ].map((tab) => {
            const isActive = questionStatusFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setQuestionStatusFilter(tab.key)}
                className={[
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer select-none shrink-0",
                  isActive
                    ? "bg-[#0F172A] text-white shadow-xs"
                    : "bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0] hover:bg-white hover:text-[#0F172A]",
                ].join(" ")}
              >
                <span>{tab.label}</span>
                <span
                  className={[
                    "rounded-full px-1.5 py-0.2 text-[10px] font-bold",
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-[#E2E8F0] text-[#475569]",
                  ].join(" ")}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tier 3: Search Input & Category Filter Dropdown */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-[#F1F5F9]">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#94A3B8]" />
            <input
              type="text"
              value={questionSearchQuery}
              onChange={(e) => setQuestionSearchQuery(e.target.value)}
              placeholder="Search questions or criteria..."
              className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] pl-8 pr-7 py-2 text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:bg-white focus:border-[#2563EB] focus:outline-none transition shadow-2xs"
            />
            {questionSearchQuery && (
              <button
                type="button"
                onClick={() => setQuestionSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold text-[#64748B] hidden sm:inline">
              Category:
            </span>
            <select
              value={selectedTopicFilter}
              onChange={(e) => setSelectedTopicFilter(e.target.value)}
              className="rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-xs font-semibold text-[#0F172A] focus:border-[#2563EB] focus:outline-none shadow-2xs"
            >
              <option value="all">All Categories ({topics.length})</option>
              {topics.map((t) => (
                <option key={t.id || t._id || t.key} value={t.id || t._id || t.key}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Category Sections & Questions (Default CLOSED for clean view) ── */}
      {filteredTopics.length === 0 ? (
        <Card variant="bordered" className="p-12 text-center">
          <QuestionMarkCircleIcon className="mx-auto h-10 w-10 text-gray-300 stroke-1" />
          <h4 className="mt-3 text-sm font-bold text-gray-900 font-display">No questions match filter</h4>
          <p className="mt-1 text-xs text-gray-500 max-w-sm mx-auto">
            Try adjusting your search query or reset the filter to view the discovery checklist.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                setQuestionSearchQuery("");
                setSelectedTopicFilter("all");
                setQuestionStatusFilter("all");
              }}
              className="rounded-xl border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-2xs"
            >
              Reset Filters
            </button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTopics.map((topic, topicIdx) => {
            const topicKey = topic.id || topic._id || topic.key;
            // Topic is OPEN ONLY IF explicitly set to true in expandedTopicKeys
            const isTopicOpen = Boolean(expandedTopicKeys[topicKey]);
            const qList = topic.questions || [];

            return (
              <div
                key={topicKey}
                className="rounded-2xl border border-[#E2E8F0] bg-white shadow-xs overflow-hidden transition"
              >
                {/* Topic Header: Clean, Crisp, Clickable Bar */}
                <div
                  className="px-4 py-3 flex items-center justify-between bg-[#F8FAFC] cursor-pointer hover:bg-slate-100/70 transition select-none"
                  onClick={() => toggleTopicExpand(topicKey)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100 text-[#2563EB] text-xs font-bold shrink-0">
                      {topicIdx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-[#0F172A] font-display truncate">
                          {topic.title}
                        </h4>
                        <span className="text-[11px] font-bold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/60 shrink-0">
                          {topic.answeredInTopic} / {topic.totalInTopic} Confirmed
                        </span>
                      </div>
                      {topic.description && (
                        <p className="text-[11px] text-[#64748B] truncate mt-0.5">
                          {topic.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Expand/Collapse Indicator */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-[#94A3B8] font-medium hidden sm:inline">
                      {isTopicOpen ? "Close" : "Open"}
                    </span>
                    <div className="p-1 text-gray-400 hover:text-gray-700 rounded-lg">
                      {isTopicOpen ? (
                        <ChevronUpIcon className="h-4 w-4" />
                      ) : (
                        <ChevronDownIcon className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Question Items (Shown ONLY when topic is open) */}
                {isTopicOpen && (
                  <div className="border-t border-[#F1F5F9] divide-y divide-[#F1F5F9]">
                    {qList.map((question) => {
                      const qId = question.id || question._id;
                      const isTipOpen = Boolean(expandedTips[qId]);
                      const isMenuOpen = openStatusMenuId === qId;

                      const isAnswered = question.status === "answered";
                      const isAsked = question.status === "asked";
                      const isPending = question.status === "pending";
                      const isSuggested = question.status === "suggested";
                      const isSkipped = question.status === "skipped";

                      return (
                        <div
                          key={qId}
                          className={[
                            "p-3.5 sm:p-4 transition-colors",
                            isAnswered
                              ? "bg-emerald-50/15"
                              : isAsked
                              ? "bg-amber-50/15"
                              : isSkipped
                              ? "bg-gray-50/50 opacity-60"
                              : "hover:bg-[#F8FAFC]/70",
                          ].join(" ")}
                        >
                          <div className="flex items-start justify-between gap-3">
                            {/* Left: Quick-Toggle Checkbox + Question Content */}
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              {/* 1-Click Interactive Status Icon Toggle */}
                              <button
                                type="button"
                                onClick={() => handleQuickCycleStatus(question)}
                                className="mt-0.5 shrink-0 transition-transform hover:scale-110 cursor-pointer focus:outline-none"
                                title={
                                  isAnswered
                                    ? "Confirmed (Click to reopen)"
                                    : isAsked
                                    ? "In Discussion (Click to confirm answer)"
                                    : "To Discuss (Click to mark in meeting)"
                                }
                              >
                                {isAnswered ? (
                                  <CheckCircleSolidIcon className="h-5 w-5 text-emerald-600" />
                                ) : isAsked ? (
                                  <ClockIcon className="h-5 w-5 text-amber-500" />
                                ) : isSkipped ? (
                                  <MinusCircleIcon className="h-5 w-5 text-gray-400" />
                                ) : (
                                  <div className="h-5 w-5 rounded-full border-2 border-[#CBD5E1] hover:border-[#2563EB] bg-white transition" />
                                )}
                              </button>

                              {/* Question Text & Badges */}
                              <div className="min-w-0 flex-1 space-y-1">
                                <p
                                  className={[
                                    "text-xs sm:text-sm leading-relaxed",
                                    isAnswered
                                      ? "font-semibold text-emerald-950"
                                      : isAsked
                                      ? "font-semibold text-amber-950"
                                      : isSkipped
                                      ? "line-through text-gray-500 font-normal"
                                      : "font-semibold text-[#0F172A]",
                                  ].join(" ")}
                                >
                                  {question.text}
                                </p>

                                {/* Context Tip & Note Pill Bar */}
                                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                                  {question.reason && (
                                    <button
                                      type="button"
                                      onClick={() => toggleTipExpanded(qId)}
                                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2563EB] hover:text-[#1d4ed8] cursor-pointer"
                                    >
                                      <LightBulbIcon className="h-3 w-3 shrink-0" />
                                      <span>{isTipOpen ? "Hide guidance" : "Why ask this?"}</span>
                                    </button>
                                  )}

                                  {isAnswered && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveAnswerQuestion(question);
                                        setAnswerInputText(question.answerText || "");
                                      }}
                                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:underline cursor-pointer"
                                    >
                                      <PencilSquareIcon className="h-3 w-3" />
                                      <span>Edit Answer</span>
                                    </button>
                                  )}
                                </div>

                                {/* Expandable Guidance Prep Note */}
                                {isTipOpen && question.reason && (
                                  <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-2.5 text-xs text-[#334155] leading-relaxed mt-1 animate-fade-in">
                                    <span className="font-bold text-[#0F172A] block text-[10px] uppercase tracking-wider mb-0.5">
                                      Meeting Alignment Tip:
                                    </span>
                                    {question.reason}
                                  </div>
                                )}

                                {/* Recorded Confirmed Answer Block */}
                                {question.answerText && (
                                  <div className="rounded-xl border border-emerald-200 bg-white p-2.5 text-xs text-emerald-900 leading-relaxed shadow-3xs mt-1">
                                    <span className="font-bold text-emerald-800 uppercase tracking-wider text-[10px] block mb-0.5">
                                      Confirmed Requirement:
                                    </span>
                                    {question.answerText}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Right: Explicit Status Dropdown Pill */}
                            <div className="relative shrink-0">
                              <button
                                type="button"
                                onClick={() =>
                                  setOpenStatusMenuId(isMenuOpen ? null : qId)
                                }
                                className={[
                                  "inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-semibold border transition shadow-3xs cursor-pointer select-none",
                                  isAnswered
                                    ? "bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100"
                                    : isAsked
                                    ? "bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100"
                                    : isSuggested
                                    ? "bg-purple-50 border-purple-300 text-purple-800 hover:bg-purple-100"
                                    : isSkipped
                                    ? "bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200"
                                    : "bg-white border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC]",
                                ].join(" ")}
                              >
                                <span>
                                  {isAnswered
                                    ? "Confirmed"
                                    : isAsked
                                    ? "In Meeting"
                                    : isSuggested
                                    ? "AI Suggested"
                                    : isSkipped
                                    ? "Skipped"
                                    : "To Discuss"}
                                </span>
                                <ChevronDownIcon className="h-3 w-3 opacity-60" />
                              </button>

                              {/* Dropdown Options Menu */}
                              {isMenuOpen && (
                                <>
                                  <div
                                    className="fixed inset-0 z-20"
                                    onClick={() => setOpenStatusMenuId(null)}
                                  />
                                  <div className="absolute right-0 mt-1 z-30 w-44 rounded-2xl border border-[#E2E8F0] bg-white p-1.5 shadow-xl animate-scale-in">
                                    <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                                      Change Status:
                                    </p>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        applyOptimisticStatus(qId, "pending", "Set to To Discuss")
                                      }
                                      className="w-full flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-xs font-medium text-[#334155] hover:bg-[#F8FAFC] transition cursor-pointer"
                                    >
                                      <div className="h-2 w-2 rounded-full border border-blue-500" />
                                      <span>To Discuss</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        applyOptimisticStatus(qId, "asked", "Marked as In Meeting")
                                      }
                                      className="w-full flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-xs font-medium text-[#334155] hover:bg-amber-50 hover:text-amber-900 transition cursor-pointer"
                                    >
                                      <ClockIcon className="h-3.5 w-3.5 text-amber-500" />
                                      <span>In Meeting</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOpenStatusMenuId(null);
                                        setActiveAnswerQuestion(question);
                                        setAnswerInputText(question.answerText || "");
                                      }}
                                      className="w-full flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-xs font-semibold text-emerald-800 hover:bg-emerald-50 transition cursor-pointer"
                                    >
                                      <CheckCircleIcon className="h-3.5 w-3.5 text-emerald-600" />
                                      <span>Mark Confirmed</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        applyOptimisticStatus(qId, "skipped", "Question skipped")
                                      }
                                      className="w-full flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-xs font-medium text-gray-500 hover:bg-gray-50 transition cursor-pointer"
                                    >
                                      <MinusCircleIcon className="h-3.5 w-3.5 text-gray-400" />
                                      <span>Skip Question</span>
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modal: Record Confirmed Answer Note ──────────────────────────── */}
      {activeAnswerQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-5 text-gray-900 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-gray-900 font-display">
                  Confirm Discovery Requirement
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveAnswerQuestion(null)}
                className="rounded-lg p-1 text-gray-400 hover:text-gray-700"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAnswerNote} className="mt-4 space-y-3.5">
              <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-3 text-xs">
                <span className="font-bold text-[#64748B] uppercase tracking-wider text-[10px] block mb-1">
                  Question:
                </span>
                <p className="font-semibold text-[#0F172A]">{activeAnswerQuestion.text}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Confirmed Decision / Notes from Meeting (Optional)
                </label>
                <textarea
                  rows={3}
                  value={answerInputText}
                  onChange={(e) => setAnswerInputText(e.target.value)}
                  placeholder="Record key architectural decisions, stakeholder agreement, or SLA bounds..."
                  className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#2563EB] focus:ring-1 focus:ring-blue-500/20 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setActiveAnswerQuestion(null)}
                  className="rounded-xl border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingAnswer}
                  className="rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition shadow-xs disabled:opacity-50"
                >
                  {isSavingAnswer ? "Saving…" : "Save & Confirm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
