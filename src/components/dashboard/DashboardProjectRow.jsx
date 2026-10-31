"use client";

import Link from "next/link";
import Badge from "@/components/Ui/Badge";
import ProgressBar from "@/components/Ui/ProgressBar";
import {
  FolderIcon,
  ChevronRightIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

export default function DashboardProjectRow({ project }) {
  const pId = project.id || project._id;

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

  const stageLabels = {
    day_one: "Day 1 Discovery",
    discovery: "Deep Discovery",
    requirements_confirmed: "Confirmed",
  };

  const stageProgress = {
    day_one: 33,
    discovery: 66,
    requirements_confirmed: 100,
  };

  const stageLabel = stageLabels[project.stage] || "Discovery";
  const progressPercent = stageProgress[project.stage] || 33;

  const updatedDate = project.updatedAt
    ? new Date(project.updatedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "Recent";

  const clientNames = project.clientName
    ? project.clientName
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const stack = Array.isArray(project.techStack) ? project.techStack : [];

  return (
    <Link
      href={`/projects/${pId}`}
      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[#E2E8F0] bg-white p-3.5 transition-all hover:border-[#2563EB] hover:bg-[#F8FAFC]/50 hover:shadow-xs"
    >
      {/* Left: Icon & Project Info */}
      <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#2563EB] group-hover:bg-[#2563EB] group-hover:text-white transition">
          <FolderIcon className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-xs font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors truncate">
              {project.name}
            </h3>
            {clientNames.length > 0 && (
              <span className="rounded bg-[#F1F5F9] border border-[#E2E8F0] px-1.5 py-0.5 text-[10px] font-semibold text-[#475569] truncate max-w-[120px]">
                {clientNames[0]}
              </span>
            )}
            <Badge variant={statusVariant} size="sm" dot>
              {project.status?.replace("_", " ")}
            </Badge>
          </div>

          <div className="mt-1 flex items-center gap-3 text-[11px] text-[#64748B]">
            {project.description ? (
              <p className="truncate max-w-sm text-[11px] text-[#64748B]">
                {project.description}
              </p>
            ) : (
              <span className="text-[11px] text-[#94A3B8] italic">No description</span>
            )}

            {stack.length > 0 && (
              <div className="hidden md:flex items-center gap-1 shrink-0">
                {stack.slice(0, 2).map((t) => (
                  <span
                    key={t}
                    className="rounded bg-[#F8FAFC] border border-[#E2E8F0] px-1.5 py-0.2 text-[9px] text-[#64748B]"
                  >
                    {t}
                  </span>
                ))}
                {stack.length > 2 && (
                  <span className="text-[9px] text-[#94A3B8]">+{stack.length - 2}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right: Stage, Priority, Last updated */}
      <div className="flex items-center gap-4 shrink-0 sm:pl-4 sm:border-l border-[#F1F5F9]">
        {/* Stage Progress */}
        <div className="w-28 flex flex-col">
          <div className="flex items-center justify-between text-[10px] font-semibold text-[#475569] mb-1">
            <span className="truncate">{stageLabel}</span>
            <span className="text-[#94A3B8] font-mono">{progressPercent}%</span>
          </div>
          <ProgressBar
            value={progressPercent}
            color={progressPercent === 100 ? "success" : "brand"}
            size="sm"
          />
        </div>

        {/* Priority Badge */}
        <Badge variant={priorityVariant} size="sm" className="hidden lg:inline-flex">
          {project.priority}
        </Badge>

        {/* Updated Date */}
        <div className="hidden sm:flex items-center gap-1 text-[10px] text-[#94A3B8] font-medium min-w-[60px]">
          <ClockIcon className="h-3 w-3" />
          <span>{updatedDate}</span>
        </div>

        {/* Arrow */}
        <div className="flex h-6 w-6 items-center justify-center rounded-md text-[#94A3B8] group-hover:text-[#2563EB] group-hover:translate-x-0.5 transition">
          <ChevronRightIcon className="h-4 w-4" />
        </div>
      </div>
    </Link>
  );
}
