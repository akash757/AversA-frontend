"use client";

import Link from "next/link";
import { FolderIcon, ClockIcon, SparklesIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

export default function ProjectCard({ project }) {
  const statusColors = {
    planning: "bg-blue-50 text-[#2563EB] border-blue-200/80",
    in_progress: "bg-amber-50 text-amber-700 border-amber-200/80",
    on_hold: "bg-purple-50 text-purple-700 border-purple-200/80",
    completed: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    cancelled: "bg-rose-50 text-rose-700 border-rose-200/80",
  };

  const priorityColors = {
    low: "text-gray-600 bg-gray-100 border-gray-200",
    medium: "text-amber-700 bg-amber-50 border-amber-200",
    high: "text-orange-700 bg-orange-50 border-orange-200",
    critical: "text-rose-700 bg-rose-50 border-rose-200 font-bold",
  };

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

  const statusColor = statusColors[project.status] || statusColors.planning;
  const pColor = priorityColors[project.priority] || priorityColors.medium;
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

  // Format client names (could be single or multiple comma-separated)
  const clientNames = project.clientName
    ? project.clientName
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  return (
    <Link
      href={`/projects/${pId}`}
      className="group relative flex flex-col justify-between rounded-2xl border border-gray-200/80 bg-white p-5 shadow-2xs transition-all duration-200 hover:border-[#2563EB] hover:shadow-md hover:-translate-y-0.5"
    >
      <div>
        {/* Top Badges */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${statusColor}`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {project.status?.replace("_", " ")}
            </span>
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${pColor}`}
            >
              {project.priority}
            </span>
          </div>

          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB] group-hover:bg-[#2563EB] group-hover:text-white transition">
            <FolderIcon className="h-4 w-4" />
          </div>
        </div>

        {/* Project Stage with Mini Bar */}
        <div className="mb-2.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-[#2563EB] mb-1">
            <span className="flex items-center gap-1.5">
              <SparklesIcon className="h-3.5 w-3.5" />
              <span>{stageLabel}</span>
            </span>
            <span className="text-[10px] font-medium text-gray-400">{progressPercent}%</span>
          </div>
          <div className="h-1 w-full rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-linear-to-r from-blue-500 to-[#2563EB] transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Project Title */}
        <h3 className="text-base font-bold text-gray-900 group-hover:text-[#2563EB] transition-colors line-clamp-1">
          {project.name}
        </h3>

        {/* Client Tag(s) */}
        {clientNames.length > 0 && (
          <div className="mt-1 flex flex-wrap items-center gap-1">
            <span className="text-[11px] text-gray-400 font-medium">Client:</span>
            {clientNames.slice(0, 2).map((client, idx) => (
              <span
                key={idx}
                className="inline-flex items-center rounded-md bg-gray-100 px-1.5 py-0.2 text-[11px] font-medium text-gray-700"
              >
                {client}
              </span>
            ))}
            {clientNames.length > 2 && (
              <span className="text-[10px] text-gray-400 font-medium">
                +{clientNames.length - 2} more
              </span>
            )}
          </div>
        )}

        {/* Description */}
        <p className="mt-2 line-clamp-2 text-xs text-gray-500 leading-relaxed min-h-[32px]">
          {project.description || "No project description provided."}
        </p>

        {/* Tech Stack Chips */}
        {stack.length > 0 && (
          <div className="mt-3.5 flex flex-wrap gap-1.5">
            {displayStack.map((tech, i) => (
              <span
                key={i}
                className="rounded-md border border-gray-200/80 bg-gray-50/80 px-2 py-0.5 text-[10px] font-medium text-gray-600"
              >
                {tech}
              </span>
            ))}
            {remainingStack > 0 && (
              <span className="rounded-md border border-gray-200/80 bg-gray-50/80 px-1.5 py-0.5 text-[10px] text-gray-400">
                +{remainingStack}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-[11px] text-gray-500">
        <div className="flex items-center gap-1.5 text-gray-400">
          <ClockIcon className="h-3.5 w-3.5" />
          <span>{updatedDate}</span>
        </div>
        <span className="text-[11px] font-semibold text-[#2563EB] group-hover:translate-x-0.5 transition-transform">
          Open Workspace →
        </span>
      </div>
    </Link>
  );
}
