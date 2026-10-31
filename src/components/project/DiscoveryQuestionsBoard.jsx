"use client";

import { useState, useMemo, useCallback } from "react";
import {
  SparklesIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  FunnelIcon,
  PlusIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  LightBulbIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  QuestionMarkCircleIcon,
  ChatBubbleBottomCenterTextIcon,
  ClockIcon,
  ShieldExclamationIcon,
} from "@heroicons/react/24/outline";
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

  // Track expanded question cards for meeting preparation tips & context
  const [expandedQuestionIds, setExpandedQuestionIds] = useState({});
  const [collapsedTopics, setCollapsedTopics] = useState({});

  const toggleQuestionExpanded = (qId) => {
    setExpandedQuestionIds((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  const toggleTopicCollapsed = (topicKey) => {
    setCollapsedTopics((prev) => ({
      ...prev,
      [topicKey]: !prev[topicKey],
    }));
  };

  // Helper for optimistic state updates (background API call)
  const applyOptimisticUpdate = useCallback(
    (questionId, patchPayload, successMsg = "") => {
      // 1. Keep snapshot for rollback
      let previousTopics;
      setTopics((prev) => {
        previousTopics = prev;
        return prev.map((topic) => ({
          ...topic,
          questions: (topic.questions || []).map((q) =>
            (q.id === questionId || q._id === questionId) ? { ...q, ...patchPayload } : q
          ),
        }));
      });

      if (successMsg) {
        toast?.success?.(successMsg);
      }

      // 2. Fire API in background without blocking UI
      updateProjectQuestion(questionId, patchPayload, projectId)
        .then((res) => {
          if (!res?.success) {
            // Revert state
            setTopics(previousTopics);
            toast?.error?.(res?.message || "Could not update question");
          }
        })
        .catch((err) => {
          // Revert state
          setTopics(previousTopics);
          toast?.error?.(err?.message || "Failed to update question. Restored original state.");
        });
    },
    [projectId, setTopics, toast]
  );

  // Optimistic Quick Actions
  const handleAcceptSuggestion = (qId) => {
    applyOptimisticUpdate(qId, { status: "pending" }, "Added question to discovery backlog");
  };

  const handleDismissSuggestion = (qId) => {
    applyOptimisticUpdate(qId, { status: "skipped" }, "Suggestion dismissed");
  };

  const handleMarkAsked = (qId) => {
    applyOptimisticUpdate(qId, { status: "asked" }, "Marked as In Discussion");
  };

  const handleMarkAnswered = (qId) => {
    applyOptimisticUpdate(qId, { status: "answered" }, "Marked as Confirmed & Answered");
  };

  const handleSkipQuestion = (qId) => {
    applyOptimisticUpdate(qId, { status: "skipped" }, "Question skipped");
  };

  const handleRestoreQuestion = (qId) => {
    applyOptimisticUpdate(qId, { status: "pending" }, "Question restored to backlog");
  };

  const handleReopenQuestion = (qId) => {
    applyOptimisticUpdate(qId, { status: "asked" }, "Question reopened for review");
  };

  // Calculate live dynamic metrics from current topics state
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
            const topicMatch = t.title?.toLowerCase().includes(query);
            if (!textMatch && !reasonMatch && !topicMatch) return false;
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

  return (
    <div className="space-y-5 animate-fade-in">
      {/* ── AI Suggestion Notice ─────────────────────────── */}
      {suggestionStatus === "ready" && stats.suggested > 0 && (
        <div className="rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-50/80 via-indigo-50/60 to-purple-50/80 p-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white shadow-xs">
                <SparklesIcon className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-purple-950 font-display">
                  AI Generated {stats.suggested} Tailored Discovery Questions
                </h4>
                <p className="text-[11px] text-purple-800 mt-0.5">
                  Review these proposed discovery questions. Click &ldquo;Add to Backlog&rdquo; or &ldquo;Dismiss&rdquo; below with instant background sync.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setQuestionStatusFilter("suggested")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-700 transition shadow-xs shrink-0 self-start sm:self-auto"
            >
              <span>View Suggestions ({stats.suggested})</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Metrics & Progress Header ───────────────────── */}
      <Card variant="default" className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#0F172A] font-display">
                Discovery Matrix Alignment
              </h3>
              <Badge variant="brand" size="sm">
                {stats.answered} / {stats.total} Answered
              </Badge>
            </div>
            <p className="text-xs text-[#64748B] mt-1">
              Guiding questions to align scope with client stakeholders before and during meetings.
            </p>
          </div>

          <div className="w-full sm:w-60">
            <ProgressBar
              value={stats.progress}
              color="brand"
              size="md"
              showLabel
              label="Coverage Rate"
            />
          </div>
        </div>

        {/* Quick Filter Count Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-4 mt-4 border-t border-[#F1F5F9]">
          <button
            type="button"
            onClick={() => setQuestionStatusFilter("all")}
            className={[
              "rounded-xl p-2.5 text-center border transition-all text-left",
              questionStatusFilter === "all"
                ? "bg-[#0F172A] text-white border-[#0F172A] shadow-xs"
                : "bg-[#F8FAFC] border-[#E2E8F0] hover:bg-white text-gray-800",
            ].join(" ")}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-70 block">All Questions</span>
            <p className="text-base font-extrabold mt-0.5">{stats.total}</p>
          </button>

          <button
            type="button"
            onClick={() => setQuestionStatusFilter("pending")}
            className={[
              "rounded-xl p-2.5 text-center border transition-all text-left",
              questionStatusFilter === "pending"
                ? "bg-[#2563EB] text-white border-[#2563EB] shadow-xs"
                : "bg-blue-50/60 border-blue-100 hover:bg-blue-50 text-blue-900",
            ].join(" ")}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-70 block">Backlog (Pending)</span>
            <p className="text-base font-extrabold mt-0.5">{stats.pending}</p>
          </button>

          <button
            type="button"
            onClick={() => setQuestionStatusFilter("asked")}
            className={[
              "rounded-xl p-2.5 text-center border transition-all text-left",
              questionStatusFilter === "asked"
                ? "bg-[#D97706] text-white border-[#D97706] shadow-xs"
                : "bg-amber-50/60 border-amber-100 hover:bg-amber-50 text-amber-900",
            ].join(" ")}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-70 block">In Meeting (Asked)</span>
            <p className="text-base font-extrabold mt-0.5">{stats.asked}</p>
          </button>

          <button
            type="button"
            onClick={() => setQuestionStatusFilter("answered")}
            className={[
              "rounded-xl p-2.5 text-center border transition-all text-left",
              questionStatusFilter === "answered"
                ? "bg-[#059669] text-white border-[#059669] shadow-xs"
                : "bg-emerald-50/60 border-emerald-100 hover:bg-emerald-50 text-emerald-900",
            ].join(" ")}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-70 block">Answered & Confirmed</span>
            <p className="text-base font-extrabold mt-0.5">{stats.answered}</p>
          </button>

          <button
            type="button"
            onClick={() => setQuestionStatusFilter("suggested")}
            className={[
              "rounded-xl p-2.5 text-center border transition-all text-left col-span-2 sm:col-span-1",
              questionStatusFilter === "suggested"
                ? "bg-[#7C3AED] text-white border-[#7C3AED] shadow-xs"
                : "bg-purple-50/60 border-purple-100 hover:bg-purple-50 text-purple-900",
            ].join(" ")}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-70 block">AI Suggestions</span>
            <p className="text-base font-extrabold mt-0.5">{stats.suggested}</p>
          </button>
        </div>
      </Card>

      {/* ── Toolbar: Search & Filter ─────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
          <input
            type="text"
            value={questionSearchQuery}
            onChange={(e) => setQuestionSearchQuery(e.target.value)}
            placeholder="Search questions or guidance notes (e.g., API, budget, security)…"
            className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] pl-9 pr-8 py-2 text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:bg-white focus:border-[#2563EB] focus:outline-none transition shadow-2xs"
          />
          {questionSearchQuery && (
            <button
              type="button"
              onClick={() => setQuestionSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedTopicFilter}
            onChange={(e) => setSelectedTopicFilter(e.target.value)}
            className="rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-xs font-semibold text-[#0F172A] focus:border-[#2563EB] focus:outline-none shadow-2xs"
          >
            <option value="all">All Topics ({topics.length})</option>
            {topics.map((t) => (
              <option key={t.id || t._id || t.key} value={t.id || t._id || t.key}>
                {t.title}
              </option>
            ))}
          </select>

          <Button
            variant="primary"
            size="sm"
            onClick={onAddQuestionClick}
            leftIcon={<PlusIcon className="h-3.5 w-3.5" />}
          >
            Add Question
          </Button>
        </div>
      </div>

      {/* ── Topic Groups & Redesigned Question Cards ──────── */}
      {filteredTopics.length === 0 ? (
        <Card variant="bordered" className="p-12 text-center">
          <QuestionMarkCircleIcon className="mx-auto h-10 w-10 text-gray-300 stroke-1" />
          <h4 className="mt-3 text-sm font-bold text-gray-900 font-display">No questions match filter</h4>
          <p className="mt-1 text-xs text-gray-500 max-w-sm mx-auto">
            Try adjusting your search query or reset the topic filter to see the complete discovery checklist.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                setQuestionSearchQuery("");
                setSelectedTopicFilter("all");
                setQuestionStatusFilter("all");
              }}
              className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTopics.map((topic, topicIdx) => {
            const topicKey = topic.id || topic._id || topic.key;
            const isTopicCollapsed = Boolean(collapsedTopics[topicKey]);
            const qList = topic.questions || [];

            return (
              <div
                key={topicKey}
                className="rounded-2xl border border-[#E2E8F0] bg-white shadow-xs overflow-hidden transition"
              >
                {/* Topic Header Accordion */}
                <div
                  className="p-4 flex items-center justify-between border-b border-[#F1F5F9] bg-[#F8FAFC] cursor-pointer hover:bg-gray-100/70 transition select-none"
                  onClick={() => toggleTopicCollapsed(topicKey)}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100/80 text-[#2563EB] text-xs font-bold">
                      {topicIdx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-[#0F172A] font-display">
                          {topic.title}
                        </h4>
                        <span className="text-[11px] font-bold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                          {topic.answeredInTopic}/{topic.totalInTopic} Answered
                        </span>
                      </div>
                      {topic.description && (
                        <p className="text-[11px] text-[#64748B] mt-0.5">{topic.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#94A3B8] font-medium hidden sm:inline">
                      {isTopicCollapsed ? "Show Questions" : "Hide"}
                    </span>
                    <button
                      type="button"
                      className="p-1 text-gray-400 hover:text-gray-700 rounded-lg"
                      aria-label="Toggle Topic"
                    >
                      {isTopicCollapsed ? (
                        <ChevronDownIcon className="h-4 w-4" />
                      ) : (
                        <ChevronUpIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Question List inside Topic */}
                {!isTopicCollapsed && (
                  <div className="p-3.5 space-y-2.5">
                    {qList.map((question) => {
                      const qId = question.id || question._id;
                      const isExpanded = Boolean(expandedQuestionIds[qId]);
                      const isAnswered = question.status === "answered";
                      const isAsked = question.status === "asked";
                      const isPending = question.status === "pending";
                      const isSuggested = question.status === "suggested";
                      const isSkipped = question.status === "skipped";

                      return (
                        <div
                          key={qId}
                          className={[
                            "rounded-xl border transition-all duration-150",
                            isAnswered
                              ? "border-emerald-200 bg-emerald-50/20"
                              : isAsked
                              ? "border-amber-200 bg-amber-50/20"
                              : isSuggested
                              ? "border-purple-200 bg-purple-50/20"
                              : isSkipped
                              ? "border-gray-200 bg-gray-50 opacity-60"
                              : "border-[#E2E8F0] bg-white hover:border-[#CBD5E1]",
                          ].join(" ")}
                        >
                          {/* Main Row */}
                          <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            {/* Left: Badge + Question Text (Click expands context) */}
                            <div
                              className="flex items-start gap-2.5 flex-1 min-w-0 cursor-pointer"
                              onClick={() => toggleQuestionExpanded(qId)}
                            >
                              <div className="mt-0.5">
                                {isAnswered && <Badge variant="success" size="sm">Answered</Badge>}
                                {isAsked && <Badge variant="warning" size="sm">In Discussion</Badge>}
                                {isPending && <Badge variant="brand" size="sm">Backlog</Badge>}
                                {isSuggested && <Badge variant="violet" size="sm">AI Suggested</Badge>}
                                {isSkipped && <Badge variant="neutral" size="sm">Skipped</Badge>}
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="text-xs sm:text-sm font-semibold text-[#0F172A] leading-snug">
                                  {question.text}
                                </p>

                                {/* Subtitle indicator if guidance / reason is available */}
                                {question.reason && (
                                  <p className="text-[11px] text-[#2563EB] flex items-center gap-1 mt-1 font-medium">
                                    <LightBulbIcon className="h-3 w-3 shrink-0" />
                                    <span>
                                      {isExpanded ? "Hide meeting prep context" : "Click to view meeting prep tip"}
                                    </span>
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Right: Exactly 2 Quick Action Buttons with Instant Optimistic Background API */}
                            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                              {/* Option set for AI Suggested */}
                              {isSuggested && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleAcceptSuggestion(qId)}
                                    className="rounded-lg bg-[#7C3AED] px-2.5 py-1 text-xs font-semibold text-white hover:bg-purple-700 transition shadow-2xs"
                                    title="Add to active discovery backlog"
                                  >
                                    Add to Backlog
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDismissSuggestion(qId)}
                                    className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 transition shadow-2xs"
                                    title="Dismiss this suggestion"
                                  >
                                    Dismiss
                                  </button>
                                </>
                              )}

                              {/* Option set for Pending */}
                              {isPending && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleMarkAsked(qId)}
                                    className="rounded-lg bg-[#2563EB] px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-700 transition shadow-2xs"
                                    title="Mark as being discussed in alignment call"
                                  >
                                    Mark in Meeting
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSkipQuestion(qId)}
                                    className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-500 hover:bg-gray-50 transition shadow-2xs"
                                    title="Skip question"
                                  >
                                    Skip
                                  </button>
                                </>
                              )}

                              {/* Option set for In Discussion (Asked) */}
                              {isAsked && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleMarkAnswered(qId)}
                                    className="rounded-lg bg-[#059669] px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700 transition shadow-2xs"
                                    title="Mark as confirmed & answered"
                                  >
                                    Mark Answered
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSkipQuestion(qId)}
                                    className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-500 hover:bg-gray-50 transition shadow-2xs"
                                    title="Skip question"
                                  >
                                    Skip
                                  </button>
                                </>
                              )}

                              {/* Option set for Answered */}
                              {isAnswered && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleReopenQuestion(qId)}
                                    className="rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition shadow-2xs"
                                    title="Reopen question for alignment"
                                  >
                                    Reopen
                                  </button>
                                </>
                              )}

                              {/* Option set for Skipped */}
                              {isSkipped && (
                                <button
                                  type="button"
                                  onClick={() => handleRestoreQuestion(qId)}
                                  className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#2563EB] hover:bg-blue-100 transition shadow-2xs"
                                  title="Restore question to discovery backlog"
                                >
                                  Restore
                                </button>
                              )}

                              {/* Expand/Collapse Chevron */}
                              <button
                                type="button"
                                onClick={() => toggleQuestionExpanded(qId)}
                                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition ml-1"
                                aria-label="Toggle details"
                              >
                                {isExpanded ? (
                                  <ChevronUpIcon className="h-4 w-4" />
                                ) : (
                                  <ChevronDownIcon className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Expandable Meeting Context & Helping Tip Drawer (No cluttered answer form!) */}
                          {isExpanded && (
                            <div className="px-4 pb-4 pt-1 border-t border-gray-100/90 bg-gray-50/50 space-y-2.5 animate-in fade-in duration-150">
                              <div className="flex items-start gap-2 pt-2">
                                <InformationCircleIcon className="h-4 w-4 text-[#2563EB] shrink-0 mt-0.5" />
                                <div className="text-xs space-y-1">
                                  <p className="font-bold text-[#0F172A]">
                                    Meeting Preparation & Context Guidance:
                                  </p>
                                  <p className="text-gray-600 leading-relaxed">
                                    {question.reason ||
                                      "Ask this question during discovery meetings to clarify technical bounds, prevent architectural scope creep, and gather concrete acceptance criteria."}
                                  </p>
                                </div>
                              </div>

                              {/* If previously answered or noted, show read-only record */}
                              {question.answerText && (
                                <div className="rounded-xl border border-emerald-200 bg-white p-3 text-xs">
                                  <span className="font-bold text-emerald-800 uppercase tracking-wider text-[10px] block mb-1">
                                    Recorded Discovery Answer:
                                  </span>
                                  <p className="italic text-gray-800">{question.answerText}</p>
                                </div>
                              )}
                            </div>
                          )}
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
    </div>
  );
}
