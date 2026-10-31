"use client";

import {
  FolderIcon,
  SparklesIcon,
  CalendarDaysIcon,
  BuildingOfficeIcon,
  PencilSquareIcon,
  TrashIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import Badge from "@/components/Ui/Badge";
import Button from "@/components/Ui/Button";
import Card from "@/components/Ui/Card";

const STAGES = [
  { key: "day_one", label: "Day 1 Discovery", desc: "Core template baseline" },
  { key: "discovery", label: "Deep Discovery", desc: "Detailed requirements" },
  { key: "requirements_confirmed", label: "Requirements Confirmed", desc: "Ready for delivery" },
];

export default function ProjectHeader({
  project,
  onOpenScheduleModal,
  onOpenEditModal,
  onOpenDeleteModal,
  onUpdateStage,
  isUpdatingStage,
}) {
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

  return (
    <Card variant="default" className="p-5 sm:p-6 space-y-6">
      {/* Top Section */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        {/* Left Info */}
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#2563EB] border border-blue-100 shadow-2xs">
            <FolderIcon className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
              <Badge variant={statusVariant} size="sm" dot>
                {project.status?.replace("_", " ")}
              </Badge>
              <Badge variant={priorityVariant} size="sm">
                Priority: {project.priority}
              </Badge>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] font-display tracking-tight">
              {project.name}
            </h1>

            {project.clientName && (
              <p className="mt-1 flex items-center gap-1.5 text-xs text-[#64748B]">
                <BuildingOfficeIcon className="h-3.5 w-3.5 text-[#94A3B8]" />
                Client: <span className="font-semibold text-[#0F172A]">{project.clientName}</span>
              </p>
            )}

            <p className="mt-2 text-xs sm:text-sm text-[#475569] max-w-3xl leading-relaxed">
              {project.description}
            </p>
          </div>
        </div>

        {/* Right Actions using Universal Button */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto shrink-0">
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

          {onOpenEditModal && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenEditModal}
              leftIcon={<PencilSquareIcon className="h-4 w-4" />}
            >
              Edit Details
            </Button>
          )}

          {onOpenDeleteModal && (
            <Button
              variant="outline-danger"
              size="icon-sm"
              onClick={onOpenDeleteModal}
              title="Delete Project"
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Tech Stack Chips */}
      {project.techStack?.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#F1F5F9]">
          <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
            Tech Stack:
          </span>
          {project.techStack.map((tech) => (
            <span
              key={tech}
              className="rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-0.5 text-[11px] font-medium text-[#475569]"
            >
              {tech}
            </span>
          ))}
        </div>
      )}

      {/* Stage Progression Stepper */}
      <div className="pt-2 border-t border-[#F1F5F9]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#475569]">
            <SparklesIcon className="h-4 w-4 text-[#2563EB]" />
            <span>Project Discovery Phase</span>
          </div>
          {isUpdatingStage && (
            <span className="text-[11px] text-[#2563EB] font-medium animate-pulse">
              Updating stage…
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                  "flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                  isCurrent
                    ? "border-[#2563EB] bg-[#EFF6FF] shadow-xs"
                    : isCompleted
                    ? "border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50"
                    : "border-[#E2E8F0] bg-white hover:border-[#CBD5E1] hover:bg-[#F8FAFC]",
                ].join(" ")}
              >
                <div
                  className={[
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                    isCurrent
                      ? "bg-[#2563EB] text-white"
                      : isCompleted
                      ? "bg-[#059669] text-white"
                      : "bg-[#F1F5F9] text-[#94A3B8]",
                  ].join(" ")}
                >
                  {isCompleted ? <CheckIcon className="h-3.5 w-3.5 stroke-[3]" /> : idx + 1}
                </div>
                <div className="min-w-0">
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
              </button>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
