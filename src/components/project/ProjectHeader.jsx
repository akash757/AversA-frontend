"use client";

import { useState } from "react";
import Link from "next/link";
import {
  SparklesIcon,
  CalendarDaysIcon,
  BuildingOfficeIcon,
  PencilSquareIcon,
  TrashIcon,
  CheckIcon,
  ChevronRightIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentIcon,
  EllipsisHorizontalIcon,
  ArrowRightIcon,
  ArrowPathIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import Badge from "@/components/Ui/Badge";
import Button from "@/components/Ui/Button";
import RightPanel from "@/components/Ui/RightPanel";
import ProgressBar from "@/components/Ui/ProgressBar";

const STAGES = [
  {
    key: "day_one",
    step: 1,
    label: "Day 1 Discovery",
    desc: "Baseline & initial alignment",
  },
  {
    key: "discovery",
    step: 2,
    label: "Deep Discovery",
    desc: "Transcripts & audio analysis",
  },
  {
    key: "requirements_confirmed",
    step: 3,
    label: "Requirements Confirmed",
    desc: "Scope verified for delivery",
  },
];

export default function ProjectHeader({
  project,
  stats,
  meetingsCount = 0,
  contactsCount = 0,
  transcriptsCount = 0,
  onOpenScheduleModal,
  onOpenEditModal,
  onOpenDeleteModal,
  onOpenDiscussionSheet,
  onCopyAgenda,
  copiedAgenda = false,
  onUpdateStage,
  isUpdatingStage = false,
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  if (!project) return null;

  const statusVariant =
    {
      planning: "brand",
      in_progress: "warning",
      on_hold: "violet",
      completed: "success",
      cancelled: "error",
    }[project.status] || "brand";

  const priorityVariant =
    {
      low: "neutral",
      medium: "warning",
      high: "warning",
      critical: "error",
    }[project.priority] || "neutral";

  const currentStageIndex = STAGES.findIndex((s) => s.key === project.stage);
  const currentStage = STAGES[currentStageIndex] || STAGES[0];
  const nextStage = STAGES[currentStageIndex + 1] || null;

  return (
    <div className="space-y-4">
      {/* ── Top Bar: Breadcrumb & Contextual Info Trigger ──────────────────── */}
      <div className="flex items-center justify-between text-xs text-[#94A3B8]">
        <nav className="flex items-center gap-1.5" aria-label="Breadcrumb">
          <Link
            href="/projects"
            className="hover:text-[#0F172A] transition-colors font-medium text-[#64748B]"
          >
            Projects
          </Link>
          <ChevronRightIcon className="h-3 w-3 shrink-0 text-[#CBD5E1]" />
          <span className="text-[#0F172A] font-semibold truncate max-w-xs">
            {project.name}
          </span>
        </nav>

        {/* Project Info Trigger Button */}
        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-[#64748B] hover:text-[#0F172A] hover:bg-white border border-transparent hover:border-[#E2E8F0] transition cursor-pointer"
          title="View project details, description, and scope"
        >
          <InformationCircleIcon className="h-4 w-4 text-[#2563EB]" />
          <span>Project Info</span>
        </button>
      </div>

      {/* ── Main Compact Header ────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 shadow-xs">
        {/* Left: Project Title & Essential Badges */}
        <div className="space-y-2 min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1
              onClick={() => setIsSidebarOpen(true)}
              className="text-xl sm:text-2xl font-bold text-[#0F172A] font-display tracking-tight truncate cursor-pointer hover:text-[#2563EB] transition"
              title="Click to view Project Info"
            >
              {project.name}
            </h1>

            <div className="flex items-center gap-2">
              <Badge variant={statusVariant} size="sm" dot>
                {project.status?.replace("_", " ")}
              </Badge>

              {project.priority && (
                <Badge variant={priorityVariant} size="sm">
                  {project.priority} priority
                </Badge>
              )}
            </div>
          </div>

          {/* Quick inline metadata (single line, subtle) */}
          <div className="flex items-center gap-3 text-xs text-[#64748B]">
            {project.clientName && (
              <span className="flex items-center gap-1 font-medium">
                <BuildingOfficeIcon className="h-3.5 w-3.5 text-[#94A3B8]" />
                <span>{project.clientName}</span>
              </span>
            )}
            {stats && (
              <span className="text-[#94A3B8]">
                • <strong className="text-[#0F172A] font-semibold">{stats.progress}%</strong> discovery confirmed
              </span>
            )}
          </div>
        </div>

        {/* Right: Primary Project Actions & Next Step */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Next Lifecycle Step Action */}
          {nextStage && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onUpdateStage?.(nextStage.key)}
              disabled={isUpdatingStage}
              leftIcon={
                isUpdatingStage ? (
                  <ArrowPathIcon className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                )
              }
              title={`Advance project stage to ${nextStage.label}`}
            >
              {isUpdatingStage ? "Updating…" : `Next: ${nextStage.label}`}
            </Button>
          )}

          {/* Schedule Alignment Call */}
          {onOpenScheduleModal && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenScheduleModal}
              leftIcon={<CalendarDaysIcon className="h-3.5 w-3.5 text-[#2563EB]" />}
            >
              Schedule Call
            </Button>
          )}

          {/* Discussion Sheet */}
          {onOpenDiscussionSheet && (
            <Button
              variant="soft"
              size="sm"
              onClick={onOpenDiscussionSheet}
              leftIcon={<ChatBubbleLeftRightIcon className="h-3.5 w-3.5" />}
              className="hidden sm:inline-flex"
              title="Open client discovery discussion sheet"
            >
              Discussion Sheet
            </Button>
          )}

          {/* More Actions Menu */}
          <div className="relative">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setIsMoreMenuOpen((prev) => !prev)}
              title="More project actions"
              className="text-[#64748B] hover:text-[#0F172A]"
            >
              <EllipsisHorizontalIcon className="h-4 w-4" />
            </Button>

            {isMoreMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setIsMoreMenuOpen(false)}
                />
                <div className="absolute right-0 mt-1.5 z-30 w-52 rounded-2xl border border-[#E2E8F0] bg-white p-1.5 shadow-xl animate-scale-in">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      setIsSidebarOpen(true);
                    }}
                    className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-[#334155] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition cursor-pointer"
                  >
                    <InformationCircleIcon className="h-4 w-4 text-[#2563EB]" />
                    <span>View Project Details</span>
                  </button>

                  {onOpenEditModal && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMoreMenuOpen(false);
                        onOpenEditModal();
                      }}
                      className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-[#334155] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition cursor-pointer"
                    >
                      <PencilSquareIcon className="h-4 w-4 text-[#64748B]" />
                      <span>Edit Project</span>
                    </button>
                  )}

                  {onCopyAgenda && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMoreMenuOpen(false);
                        onCopyAgenda();
                      }}
                      className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-[#334155] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition cursor-pointer"
                    >
                      {copiedAgenda ? (
                        <ClipboardDocumentCheckIcon className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <ClipboardDocumentIcon className="h-4 w-4 text-[#64748B]" />
                      )}
                      <span>{copiedAgenda ? "Copied Agenda!" : "Copy Agenda"}</span>
                    </button>
                  )}

                  {onOpenDeleteModal && (
                    <div className="pt-1 mt-1 border-t border-[#F1F5F9]">
                      <button
                        type="button"
                        onClick={() => {
                          setIsMoreMenuOpen(false);
                          onOpenDeleteModal();
                        }}
                        className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 transition cursor-pointer"
                      >
                        <TrashIcon className="h-4 w-4 text-red-500" />
                        <span>Delete Project</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Project Lifecycle Indicator ────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-3 sm:p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <SparklesIcon className="h-4 w-4 text-[#2563EB]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
              Project Lifecycle
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#64748B]">
            <span>Current Stage:</span>
            <span className="font-semibold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60">
              {currentStage.label}
            </span>
          </div>
        </div>

        {/* Stepper track */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3">
          {STAGES.map((s, idx) => {
            const isCompleted = currentStageIndex > idx;
            const isCurrent = currentStageIndex === idx;
            const isUpcoming = currentStageIndex < idx;

            return (
              <button
                key={s.key}
                type="button"
                disabled={isUpdatingStage || isCurrent}
                onClick={() => onUpdateStage?.(s.key)}
                className={[
                  "flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all select-none",
                  isCurrent
                    ? "border-[#2563EB] bg-[#EFF6FF] shadow-xs cursor-default ring-1 ring-blue-500/10"
                    : isCompleted
                    ? "border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50 cursor-pointer"
                    : "border-[#E2E8F0] bg-[#F8FAFC] hover:border-[#CBD5E1] hover:bg-white cursor-pointer",
                ].join(" ")}
                title={
                  isCurrent
                    ? "Current active stage"
                    : isCompleted
                    ? `Completed. Click to return to ${s.label}`
                    : `Upcoming. Click to advance to ${s.label}`
                }
              >
                {/* Step indicator circle */}
                <div
                  className={[
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition",
                    isCurrent
                      ? "bg-[#2563EB] text-white shadow-xs shadow-blue-500/30"
                      : isCompleted
                      ? "bg-[#059669] text-white shadow-xs shadow-emerald-500/20"
                      : "bg-[#E2E8F0] text-[#64748B]",
                  ].join(" ")}
                >
                  {isCompleted ? (
                    <CheckIcon className="h-4 w-4 stroke-[3]" />
                  ) : (
                    <span>0{s.step}</span>
                  )}
                </div>

                {/* Step metadata */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <p
                      className={[
                        "text-xs font-bold truncate",
                        isCurrent
                          ? "text-[#2563EB]"
                          : isCompleted
                          ? "text-emerald-950"
                          : "text-[#475569]",
                      ].join(" ")}
                    >
                      {s.label}
                    </p>
                    {isCurrent && (
                      <span className="rounded-full bg-[#2563EB] text-white text-[9px] font-bold px-1.5 py-0.2 shrink-0">
                        Active
                      </span>
                    )}
                    {isCompleted && (
                      <span className="text-[10px] font-semibold text-emerald-700 shrink-0">
                        Done
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#94A3B8] truncate mt-0.5">
                    {s.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Slide-in Project Info Sidebar (RightPanel: Polished & Preserved) ── */}
      <RightPanel
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        size="lg"
      >
        <RightPanel.Header
          title="Project Profile & Scope"
          onClose={() => setIsSidebarOpen(false)}
        />

        <RightPanel.Body className="space-y-6">
          {/* Identity Card */}
          <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/70 via-indigo-50/30 to-white p-5 shadow-2xs">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant={statusVariant} size="sm" dot>
                  {project.status?.replace("_", " ")}
                </Badge>
                {project.priority && (
                  <Badge variant={priorityVariant} size="sm">
                    {project.priority} priority
                  </Badge>
                )}
                <span className="rounded-md bg-blue-100/80 text-[#2563EB] text-[10px] font-bold px-2 py-0.5">
                  {currentStage.label}
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#0F172A] font-display">
                {project.name}
              </h3>
              {project.clientName && (
                <p className="flex items-center gap-1.5 text-xs text-[#64748B]">
                  <BuildingOfficeIcon className="h-3.5 w-3.5 text-[#94A3B8]" />
                  Client: <span className="font-semibold text-[#0F172A]">{project.clientName}</span>
                </p>
              )}
            </div>
          </div>

          {/* Project Overview / Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
              Project Scope & Overview
            </h4>
            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <p className="text-xs sm:text-sm text-[#334155] leading-relaxed whitespace-pre-wrap">
                {project.description || "No project description provided."}
              </p>
            </div>
          </div>

          {/* Tech Stack */}
          {project.techStack?.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                Tech Stack
              </h4>
              <div className="flex flex-wrap items-center gap-1.5">
                {project.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-lg border border-[#E2E8F0] bg-white px-2.5 py-1 text-xs font-medium text-[#334155] shadow-3xs"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Quick Metrics Summary */}
          {stats && (
            <div className="space-y-3 pt-2 border-t border-[#F1F5F9]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                Discovery Snapshot
              </h4>

              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 space-y-1">
                  <p className="text-[11px] text-[#64748B]">Questions Confirmed</p>
                  <p className="text-base font-bold text-[#0F172A]">
                    {stats.answered} <span className="text-xs font-normal text-[#94A3B8]">/ {stats.total}</span>
                  </p>
                  <ProgressBar value={stats.progress} color="brand" size="sm" />
                </div>

                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 space-y-1">
                  <p className="text-[11px] text-[#64748B]">Alignment Calls</p>
                  <p className="text-base font-bold text-[#0F172A]">{meetingsCount}</p>
                  <p className="text-[10px] text-[#94A3B8]">Scheduled</p>
                </div>

                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 space-y-1">
                  <p className="text-[11px] text-[#64748B]">Stakeholders</p>
                  <p className="text-base font-bold text-[#0F172A]">{contactsCount}</p>
                  <p className="text-[10px] text-[#94A3B8]">Client Contacts</p>
                </div>

                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 space-y-1">
                  <p className="text-[11px] text-[#64748B]">Transcripts</p>
                  <p className="text-base font-bold text-[#0F172A]">{transcriptsCount}</p>
                  <p className="text-[10px] text-[#94A3B8]">Indexed Sessions</p>
                </div>
              </div>
            </div>
          )}
        </RightPanel.Body>

        {/* Sidebar Footer with Project Actions */}
        <RightPanel.Footer className="space-y-2">
          <div className="flex items-center gap-2">
            {onOpenScheduleModal && (
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                onClick={() => {
                  setIsSidebarOpen(false);
                  onOpenScheduleModal();
                }}
                leftIcon={<CalendarDaysIcon className="h-4 w-4" />}
              >
                Schedule Call
              </Button>
            )}

            {onOpenEditModal && (
              <Button
                variant="outline"
                size="sm"
                fullWidth
                onClick={() => {
                  setIsSidebarOpen(false);
                  onOpenEditModal();
                }}
                leftIcon={<PencilSquareIcon className="h-4 w-4" />}
              >
                Edit Details
              </Button>
            )}

            {onOpenDeleteModal && (
              <Button
                variant="outline-danger"
                size="icon-md"
                onClick={() => {
                  setIsSidebarOpen(false);
                  onOpenDeleteModal();
                }}
                title="Delete Project"
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            )}
          </div>
        </RightPanel.Footer>
      </RightPanel>
    </div>
  );
}
