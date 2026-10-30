import {
  FolderIcon,
  SparklesIcon,
  CalendarDaysIcon,
  BuildingOfficeIcon,
  PencilSquareIcon,
  TrashIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

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

  const statusColors = {
    planning: "bg-blue-50 text-[#2563EB] border-blue-200",
    in_progress: "bg-amber-50 text-amber-700 border-amber-200",
    on_hold: "bg-purple-50 text-purple-700 border-purple-200",
    completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    cancelled: "bg-red-50 text-red-700 border-red-200",
  };

  const priorityColors = {
    low: "text-gray-600 bg-gray-100 border-gray-200",
    medium: "text-amber-700 bg-amber-50 border-amber-200",
    high: "text-orange-700 bg-orange-50 border-orange-200",
    critical: "text-red-700 bg-red-50 border-red-200",
  };

  const statusColor = statusColors[project.status] || statusColors.planning;
  const pColor = priorityColors[project.priority] || priorityColors.medium;

  const currentStageIndex = STAGES.findIndex((s) => s.key === project.stage);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-xs space-y-6">
      {/* Top Section */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        {/* Left Info */}
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#2563EB] border border-blue-100">
            <FolderIcon className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${statusColor}`}>
                {project.status?.replace("_", " ")}
              </span>
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${pColor}`}>
                Priority: {project.priority}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              {project.name}
            </h1>

            {project.clientName && (
              <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                <BuildingOfficeIcon className="h-3.5 w-3.5 text-gray-400" />
                Client: <span className="font-semibold text-gray-800">{project.clientName}</span>
              </p>
            )}

            <p className="mt-2 text-xs sm:text-sm text-gray-600 max-w-3xl leading-relaxed">
              {project.description}
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto shrink-0">
          {onOpenScheduleModal && (
            <button
              type="button"
              onClick={onOpenScheduleModal}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#1d4ed8] transition"
            >
              <CalendarDaysIcon className="h-4 w-4" />
              <span>Schedule Call</span>
            </button>
          )}

          {onOpenEditModal && (
            <button
              type="button"
              onClick={onOpenEditModal}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition shadow-xs"
            >
              <PencilSquareIcon className="h-4 w-4 text-gray-500" />
              <span>Edit Details</span>
            </button>
          )}

          {onOpenDeleteModal && (
            <button
              type="button"
              onClick={onOpenDeleteModal}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition shadow-xs"
              title="Delete Project"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Tech Stack Chips */}
      {project.techStack?.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Tech Stack:</span>
          {project.techStack.map((tech) => (
            <span
              key={tech}
              className="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-[11px] font-medium text-gray-700"
            >
              {tech}
            </span>
          ))}
        </div>
      )}

      {/* Stage Progression Stepper */}
      <div className="pt-2 border-t border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-700">
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
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  isCurrent
                    ? "border-[#2563EB] bg-blue-50/70 ring-1 ring-blue-500/20 shadow-xs"
                    : isCompleted
                    ? "border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    isCurrent
                      ? "bg-[#2563EB] text-white"
                      : isCompleted
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-100 text-gray-500 border border-gray-200"
                  }`}
                >
                  {isCompleted ? <CheckIcon className="h-3.5 w-3.5 stroke-[3]" /> : idx + 1}
                </div>
                <div className="min-w-0">
                  <p
                    className={`text-xs font-bold truncate ${
                      isCurrent ? "text-[#2563EB]" : isCompleted ? "text-emerald-900" : "text-gray-700"
                    }`}
                  >
                    {s.label}
                  </p>
                  <p className="text-[10px] text-gray-500 truncate">{s.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
