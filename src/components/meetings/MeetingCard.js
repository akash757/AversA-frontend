import {
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
  VideoCameraIcon,
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

export default function MeetingCard({
  meeting,
  onClick,
  onEdit,
  onDelete,
  onToggleComplete,
  isTogglingComplete,
  showProjectTag,
}) {
  const participantCount = Array.isArray(meeting?.participants) ? meeting.participants.length : 0;
  const startTime = new Date(meeting.startTime);
  const projectName = meeting.project?.name || meeting.projectId?.name || null;

  const isCompleted = meeting.status === "completed";
  const isCancelled = meeting.status === "cancelled";

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-xs transition-all duration-200 hover:border-blue-400 hover:shadow-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        {/* Date & Time pill */}
        <div className="flex items-center gap-3 md:flex-col md:items-start shrink-0 md:pr-4 md:border-r border-gray-100">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Date</span>
            <span className="text-sm font-black text-gray-900">
              {startTime.toLocaleDateString("en-US", { day: "2-digit", month: "short" })}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Time</span>
            <span className="text-xs font-semibold text-gray-700">
              {startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0" onClick={onClick} role="button" tabIndex={0}>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <h3 className="text-base font-bold text-gray-900 truncate tracking-tight group-hover:text-[#2563EB] transition-colors">
              {meeting.title}
            </h3>

            {showProjectTag && projectName && (
              <span className="rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-semibold text-gray-700">
                {projectName}
              </span>
            )}

            <span
              className={`rounded-full border px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider ${
                isCompleted
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : isCancelled
                  ? "bg-red-50 text-red-700 border-red-200"
                  : "bg-blue-50 text-[#2563EB] border-blue-200"
              }`}
            >
              {meeting.status || "scheduled"}
            </span>
          </div>

          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
            {meeting.description || "No agenda description specified."}
          </p>

          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500">
              <UserGroupIcon className="h-3.5 w-3.5 text-[#2563EB]" />
              <span>{participantCount} participants</span>
            </div>
            {meeting.notes && (
              <span className="text-[11px] text-[#2563EB] font-medium">Has notes</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 md:pt-0">
          {onToggleComplete && !isCompleted && (
            <button
              type="button"
              disabled={isTogglingComplete}
              onClick={() => onToggleComplete(meeting.id || meeting._id, "completed")}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 shadow-2xs hover:bg-emerald-100 hover:border-emerald-400 transition active:scale-95 disabled:opacity-50"
              title="Mark call as completed and advance to Deep Discovery"
            >
              <CheckCircleIcon className="h-4 w-4 text-emerald-600" />
              <span>Mark Completed</span>
            </button>
          )}

          {onToggleComplete && isCompleted && (
            <button
              type="button"
              disabled={isTogglingComplete}
              onClick={() => onToggleComplete(meeting.id || meeting._id, "scheduled")}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 shadow-2xs hover:bg-gray-50 transition active:scale-95 disabled:opacity-50"
              title="Reopen meeting as scheduled"
            >
              <span>Reopen</span>
            </button>
          )}

          {meeting.meetingLink && (
            <a
              href={meeting.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition active:scale-95"
            >
              <VideoCameraIcon className="h-4 w-4" />
              <span>Join Meet</span>
              <ArrowTopRightOnSquareIcon className="h-3 w-3 opacity-70" />
            </a>
          )}

          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="rounded-xl border border-gray-200 bg-white p-2 text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900 transition"
              title="Edit Meeting"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="rounded-xl border border-red-200 bg-red-50 p-2 text-red-600 hover:bg-red-100 transition"
              title="Delete Meeting"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
