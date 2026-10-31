"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FolderIcon,
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
} from "@heroicons/react/24/outline";
import Badge from "@/components/Ui/Badge";
import Button from "@/components/Ui/Button";
import RightPanel from "@/components/Ui/RightPanel";
import ProgressBar from "@/components/Ui/ProgressBar";

const STAGES = [
  { key: "day_one", label: "Day 1 Discovery", desc: "Core template baseline & initial alignment" },
  { key: "discovery", label: "Deep Discovery", desc: "Transcripts, audio analysis & requirements extraction" },
  { key: "requirements_confirmed", label: "Requirements Confirmed", desc: "Verified scope baseline approved for delivery" },
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

  const statusVariant = {
    planning: "brand",
    in_progress: "warning",
    on_hold: "violet",
    completed: "success",
    cancelled: "error",
  }[project.status] || "brand";

  const priorityVariant = {
    low: "neutral",
    medium: "warning",
    high: "warning",
    critical: "error",
  }[project.priority] || "neutral";

  const currentStageIndex = STAGES.findIndex((s) => s.key === project.stage);
  const currentStage = STAGES[currentStageIndex] || STAGES[0];
  const nextStage = STAGES[currentStageIndex + 1] || null;

  return (
    <>
      {/* ── Executive Page Header ────────────────────────────────────────── */}
      <div className="space-y-3 pb-3 border-b border-[#E2E8F0]">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs text-[#94A3B8]" aria-label="Breadcrumb">
          <Link
            href="/projects"
            className="hover:text-[#0F172A] transition-colors font-medium"
          >
            Projects
          </Link>
          <ChevronRightIcon className="h-3 w-3 shrink-0 text-[#CBD5E1]" />
          <span className="text-[#475569] font-semibold truncate max-w-xs">
            {project.name}
          </span>
        </nav>

        {/* Main Header Row: Perfectly Aligned */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Project Identity */}
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Interactive Project Avatar Icon */}
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-sm hover:scale-105 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              title="Click to view Project Profile & Details"
              aria-label="Open Project Profile Sidebar"
            >
              <FolderIcon className="h-6 w-6" />
            </button>

            {/* Title & Metadata Badges */}
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1
                  onClick={() => setIsSidebarOpen(true)}
                  className="text-xl sm:text-2xl font-extrabold text-[#0F172A] font-display tracking-tight truncate cursor-pointer hover:text-[#2563EB] transition"
                  title="Click to view project details sidebar"
                >
                  {project.name}
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <Badge variant={statusVariant} size="sm" dot>
                  {project.status?.replace("_", " ")}
                </Badge>
                <Badge variant={priorityVariant} size="sm">
                  {project.priority} priority
                </Badge>
                {project.clientName && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#64748B] bg-[#F8FAFC] px-2 py-0.5 rounded-md border border-[#E2E8F0]">
                    <BuildingOfficeIcon className="h-3.5 w-3.5 text-[#94A3B8]" />
                    <span>Client:</span>
                    <strong className="text-[#0F172A]">{project.clientName}</strong>
                  </span>
                )}
                <div
                  onClick={() => setIsSidebarOpen(true)}
                  className="inline-flex items-center gap-1 rounded-md bg-blue-50 border border-blue-200/80 px-2 py-0.5 text-[11px] font-semibold text-[#2563EB] hover:bg-blue-100 transition cursor-pointer"
                  title="Click to view or advance discovery stage"
                >
                  <SparklesIcon className="h-3 w-3" />
                  <span>{currentStage.label}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Direct Actions & Next Step Button */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto shrink-0">
            {/* Move to Next Step Button */}
            {nextStage && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onUpdateStage?.(nextStage.key)}
                disabled={isUpdatingStage}
                leftIcon={
                  isUpdatingStage ? (
                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRightIcon className="h-4 w-4" />
                  )
                }
                title={`Advance project lifecycle to ${nextStage.label}`}
              >
                {isUpdatingStage ? "Moving..." : `Next Step: ${nextStage.label}`}
              </Button>
            )}

            {/* Schedule Call */}
            {onOpenScheduleModal && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onOpenScheduleModal}
                leftIcon={<CalendarDaysIcon className="h-4 w-4" />}
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
                leftIcon={<ChatBubbleLeftRightIcon className="h-4 w-4" />}
                className="hidden sm:inline-flex"
                title="Client discovery discussion questionnaire"
              >
                Discussion Sheet
              </Button>
            )}

            {/* More Options Dropdown */}
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
                      <SparklesIcon className="h-4 w-4 text-[#2563EB]" />
                      <span>Project Details Sidebar</span>
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
      </div>

      {/* ── Slide-in Project Info Sidebar (RightPanel: Polished & High-Utility) ── */}
      <RightPanel
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        size="lg"
      >
        <RightPanel.Header
          title="Project Profile & Settings"
          onClose={() => setIsSidebarOpen(false)}
        />

        <RightPanel.Body className="space-y-6">
          {/* Identity Card */}
          <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/70 via-indigo-50/30 to-white p-5 shadow-2xs">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#2563EB] text-white shadow-md shadow-blue-500/20">
                <FolderIcon className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                  <Badge variant={statusVariant} size="sm" dot>
                    {project.status?.replace("_", " ")}
                  </Badge>
                  <Badge variant={priorityVariant} size="sm">
                    {project.priority} priority
                  </Badge>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[#0F172A] font-display leading-snug">
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

          {/* Discovery Stage Progression Stepper */}
          <div className="space-y-3 pt-2 border-t border-[#F1F5F9]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                <SparklesIcon className="h-4 w-4 text-[#2563EB]" />
                <span>Discovery Lifecycle Stage</span>
              </div>
              {isUpdatingStage && (
                <span className="text-[11px] text-[#2563EB] font-medium animate-pulse">
                  Updating stage…
                </span>
              )}
            </div>

            <div className="space-y-2">
              {STAGES.map((s, idx) => {
                const isCompleted = currentStageIndex > idx;
                const isCurrent = currentStageIndex === idx;

                return (
                  <button
                    key={s.key}
                    type="button"
                    disabled={isUpdatingStage || isCurrent}
                    onClick={() => onUpdateStage?.(s.key)}
                    className={[
                      "w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all",
                      isCurrent
                        ? "border-[#2563EB] bg-[#EFF6FF] shadow-xs cursor-default ring-1 ring-blue-500/10"
                        : isCompleted
                        ? "border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 cursor-pointer"
                        : "border-[#E2E8F0] bg-white hover:border-[#CBD5E1] hover:bg-[#F8FAFC] cursor-pointer",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={[
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                          isCurrent
                            ? "bg-[#2563EB] text-white"
                            : isCompleted
                            ? "bg-[#059669] text-white"
                            : "bg-[#F1F5F9] text-[#94A3B8]",
                        ].join(" ")}
                      >
                        {isCompleted ? <CheckIcon className="h-4 w-4 stroke-[3]" /> : idx + 1}
                      </div>
                      <div className="min-w-0 text-left">
                        <p
                          className={[
                            "text-xs font-bold truncate",
                            isCurrent
                              ? "text-[#2563EB]"
                              : isCompleted
                              ? "text-emerald-900"
                              : "text-[#475569]",
                          ].join(" ")}
                        >
                          {s.label}
                        </p>
                        <p className="text-[10px] text-[#94A3B8] truncate">{s.desc}</p>
                      </div>
                    </div>

                    {isCurrent ? (
                      <Badge variant="brand" size="sm">Current</Badge>
                    ) : isCompleted ? (
                      <Badge variant="success" size="sm">Done</Badge>
                    ) : (
                      <ChevronRightIcon className="h-4 w-4 text-[#94A3B8]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

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
    </>
  );
}
