"use client";

import {
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
  VideoCameraIcon,
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import Badge from "@/components/Ui/Badge";
import Button from "@/components/Ui/Button";

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

  const statusVariant = isCompleted ? "success" : isCancelled ? "error" : "brand";

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs transition-all duration-200 hover:border-[#2563EB] hover:shadow-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        {/* Date & Time block */}
        <div className="flex items-center gap-3 md:flex-col md:items-start shrink-0 md:pr-4 md:border-r border-[#F1F5F9]">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider">Date</span>
            <span className="text-sm font-extrabold text-[#0F172A] font-display">
              {startTime.toLocaleDateString("en-US", { day: "2-digit", month: "short" })}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider">Time</span>
            <span className="text-xs font-semibold text-[#475569]">
              {startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0" onClick={onClick} role="button" tabIndex={0}>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <h3 className="text-base font-bold text-[#0F172A] font-display truncate tracking-tight group-hover:text-[#2563EB] transition-colors">
              {meeting.title}
            </h3>

            {showProjectTag && projectName && (
              <span className="rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-2 py-0.5 text-[10px] font-semibold text-[#475569]">
                {projectName}
              </span>
            )}

            <Badge variant={statusVariant} size="sm" dot>
              {meeting.status || "scheduled"}
            </Badge>
          </div>

          <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">
            {meeting.description || "No agenda description specified."}
          </p>

          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#64748B]">
              <UserGroupIcon className="h-3.5 w-3.5 text-[#2563EB]" />
              <span>{participantCount} participants</span>
            </div>
            {meeting.notes && (
              <span className="text-[11px] text-[#2563EB] font-semibold">Has notes</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 md:pt-0">
          {onToggleComplete && !isCompleted && (
            <Button
              variant="outline"
              size="sm"
              loading={isTogglingComplete}
              onClick={() => onToggleComplete(meeting.id || meeting._id, "completed")}
              className="border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
              leftIcon={<CheckCircleIcon className="h-4 w-4 text-emerald-600" />}
            >
              Mark Completed
            </Button>
          )}

          {onToggleComplete && isCompleted && (
            <Button
              variant="outline"
              size="sm"
              loading={isTogglingComplete}
              onClick={() => onToggleComplete(meeting.id || meeting._id, "scheduled")}
            >
              Reopen
            </Button>
          )}

          {meeting.meetingLink && (
            <Button
              variant="secondary"
              size="sm"
              href={meeting.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              leftIcon={<VideoCameraIcon className="h-4 w-4" />}
              rightIcon={<ArrowTopRightOnSquareIcon className="h-3 w-3 opacity-70" />}
            >
              Join Meet
            </Button>
          )}

          {onEdit && (
            <Button
              variant="outline"
              size="icon-sm"
              onClick={onEdit}
              title="Edit Meeting"
            >
              <PencilIcon className="h-4 w-4" />
            </Button>
          )}

          {onDelete && (
            <Button
              variant="outline-danger"
              size="icon-sm"
              onClick={onDelete}
              title="Delete Meeting"
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
