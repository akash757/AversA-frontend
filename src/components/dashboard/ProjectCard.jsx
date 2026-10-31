"use client";

import Link from "next/link";
import { FolderIcon, ClockIcon, SparklesIcon } from "@heroicons/react/24/outline";
import Badge from "@/components/Ui/Badge";

export default function ProjectCard({ project }) {
  const statusBadgeVariant = {
    planning: "brand",
    in_progress: "warning",
    on_hold: "violet",
    completed: "success",
    cancelled: "error",
  }[project.status] || "brand";

  const priorityBadgeVariant = {
    low: "neutral",
    medium: "warning",
    high: "warning",
    critical: "error",
  }[project.priority] || "neutral";

  const stageLabels = {
    day_one: "Day 1 Discovery",
    discovery: "Deep Discovery",
    requirements_confirmed: "Requirements Confirmed",
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
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Recently";

  const stack = Array.isArray(project.techStack) ? project.techStack : [];
  const displayStack = stack.slice(0, 3);
  const remainingStack = stack.length > 3 ? stack.length - 3 : 0;
  const pId = project.id || project._id;

  const clientNames = project.clientName
    ? project.clientName
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  return (
    <Link
      href={`/projects/${pId}`}
      className="group relative flex flex-col justify-between rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs transition-all duration-200 hover:border-[#2563EB] hover:shadow-md hover:-translate-y-1"
    >
      <div>
        {/* Top Badges */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant={statusBadgeVariant} size="sm" dot>
              {project.status?.replace("_", " ")}
            </Badge>
            <Badge variant={priorityBadgeVariant} size="sm">
              {project.priority}
            </Badge>
          </div>

          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB] group-hover:bg-[#2563EB] group-hover:text-white transition duration-200 shadow-2xs">
            <FolderIcon className="h-4 w-4" />
          </div>
        </div>

        {/* Project Stage with Mini Bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#2563EB] mb-1">
            <span className="flex items-center gap-1.5">
              <SparklesIcon className="h-3.5 w-3.5" />
              <span>{stageLabel}</span>
            </span>
            <span className="text-[10px] font-mono text-[#94A3B8]">{progressPercent}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-[#F1F5F9] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-[#7C3AED] transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Project Title & Client Tag */}
        <h3 className="text-sm font-bold text-[#0F172A] font-display group-hover:text-[#2563EB] transition-colors leading-snug">
          {project.name}
        </h3>

        {clientNames.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {clientNames.slice(0, 2).map((client, idx) => (
              <span
                key={idx}
                className="inline-block rounded-md bg-[#F8FAFC] border border-[#E2E8F0] px-1.5 py-0.5 text-[10px] font-semibold text-[#475569]"
              >
                {client}
              </span>
            ))}
            {clientNames.length > 2 && (
              <span className="text-[10px] text-[#94A3B8] self-center">
                +{clientNames.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Description Snippet */}
        <p className="mt-2 text-xs text-[#64748B] line-clamp-2 leading-relaxed">
          {project.description || "No project description provided."}
        </p>
      </div>

      {/* Card Footer: Tech Stack and Date */}
      <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex items-center justify-between gap-2 text-[11px] text-[#94A3B8]">
        <div className="flex flex-wrap gap-1 min-w-0">
          {displayStack.length > 0 ? (
            <>
              {displayStack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-md bg-[#F1F5F9] px-1.5 py-0.5 text-[10px] font-medium text-[#475569]"
                >
                  {tech}
                </span>
              ))}
              {remainingStack > 0 && (
                <span className="text-[10px] text-[#94A3B8] self-center">
                  +{remainingStack}
                </span>
              )}
            </>
          ) : (
            <span className="italic text-gray-400">Discovery in progress</span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 text-[#94A3B8] font-medium text-[10px]">
          <ClockIcon className="h-3 w-3" />
          <span>{updatedDate}</span>
        </div>
      </div>
    </Link>
  );
}
