"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  VideoCameraIcon,
  CalendarDaysIcon,
  ClockIcon,
  UserGroupIcon,
  PencilSquareIcon,
  CheckIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import { useToast } from "@/components/Ui/Toast";
import Skeleton from "@/components/Ui/Skeleton";
import { getMeetingsByProject, updateMeeting } from "@/features/meeting/meeting";

export default function MeetingDetailPage() {
  const toast = useToast();
  const params = useParams();
  const router = useRouter();

  const projectId = Array.isArray(params?.projectId) ? params.projectId[0] : params?.projectId;
  const meetingId = Array.isArray(params?.meetingId) ? params.meetingId[0] : params?.meetingId;

  const [meeting, setMeeting] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notesText, setNotesText] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [status, setStatus] = useState("scheduled");

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getMeetingsByProject(projectId);
      if (res?.success) {
        const found = (res.data?.meetings || []).find((m) => (m.id || m._id) === meetingId);
        if (found) {
          setMeeting(found);
          setNotesText(found.notes || "");
          setStatus(found.status || "scheduled");
        } else {
          toast.error("Meeting not found.");
        }
      }
    } catch {
      toast.error("Failed to load meeting details.");
    } finally {
      setIsLoading(false);
    }
  }, [projectId, meetingId, toast]);

  useEffect(() => {
    if (!projectId || !meetingId) return;
    void loadData();
  }, [projectId, meetingId, loadData]);

  async function handleSaveNotes() {
    setIsSavingNotes(true);
    try {
      const res = await updateMeeting(projectId, meetingId, { notes: notesText, status });
      if (res?.success) {
        toast.success("Meeting notes saved successfully!");
      } else {
        toast.error(res?.message || "Failed to save meeting notes.");
      }
    } catch {
      toast.error("Failed to save meeting notes.");
    } finally {
      setIsSavingNotes(false);
    }
  }

  async function handleStatusChange(newStatus) {
    setStatus(newStatus);
    try {
      const res = await updateMeeting(projectId, meetingId, { status: newStatus });
      if (res?.success) {
        toast.success(`Meeting status marked as ${newStatus}`);
      } else {
        toast.error(res?.message || "Failed to update status.");
      }
    } catch {
      toast.error("Failed to update status.");
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6" aria-hidden="true">
        <Skeleton variant="line" width="12rem" height="1rem" />
        <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 space-y-4">
          <Skeleton variant="badge" width="5rem" height="1.25rem" />
          <Skeleton variant="line" width="60%" height="2rem" />
          <Skeleton variant="line" width="40%" height="1rem" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton variant="card" height="10rem" />
          <Skeleton variant="card" height="10rem" />
        </div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-700 shadow-xs">
        <p className="font-semibold text-gray-900">Meeting Not Found</p>
        <Link
          href={`/projects/${projectId}/meetings`}
          className="mt-4 inline-flex items-center rounded-xl bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1d4ed8]"
        >
          Back to Meetings
        </Link>
      </div>
    );
  }

  const startTime = new Date(meeting.startTime);
  const endTime = new Date(meeting.endTime);
  const participants = Array.isArray(meeting.participants) ? meeting.participants : [];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          href={`/projects/${projectId}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          <span>Back to Project Workspace</span>
        </Link>
      </div>

      {/* Main Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-gray-100">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#2563EB]">
                {status}
              </span>
              <span className="text-xs text-gray-500 font-medium">Google Meet Alignment Session</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              {meeting.title}
            </h1>

            <p className="mt-2 text-xs sm:text-sm text-gray-600 max-w-2xl leading-relaxed">
              {meeting.description || "No agenda description provided."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {meeting.meetingLink && (
              <a
                href={meeting.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition active:scale-95"
              >
                <VideoCameraIcon className="h-4 w-4" />
                <span>Join Google Meet</span>
                <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 opacity-80" />
              </a>
            )}

            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 focus:border-[#2563EB] focus:outline-none"
            >
              <option value="scheduled">Status: Scheduled</option>
              <option value="completed">Status: Completed</option>
              <option value="cancelled">Status: Cancelled</option>
            </select>
          </div>
        </div>

        {/* Schedule & Participants Meta */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 border-b border-gray-100 text-xs">
          <div className="flex items-center gap-2.5 text-gray-700">
            <CalendarDaysIcon className="h-4 w-4 text-[#2563EB] shrink-0" />
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400">Date</p>
              <p className="font-semibold text-gray-900">
                {startTime.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-gray-700">
            <ClockIcon className="h-4 w-4 text-cyan-600 shrink-0" />
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400">Time</p>
              <p className="font-semibold text-gray-900">
                {startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} – {endTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-gray-700">
            <UserGroupIcon className="h-4 w-4 text-emerald-600 shrink-0" />
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400">Attendees</p>
              <p className="font-semibold text-gray-900">{participants.length} Invited</p>
            </div>
          </div>
        </div>

        {/* Attendees List */}
        {participants.length > 0 && (
          <div className="py-4 border-b border-gray-100">
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">
              Invited Participants
            </p>
            <div className="flex flex-wrap gap-2">
              {participants.map((p, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-700"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB]" />
                  {p.email || p}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Notes Editor */}
        <div className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <PencilSquareIcon className="h-4 w-4 text-[#2563EB]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                Meeting Session Notes & Decisions
              </h3>
            </div>
            <button
              type="button"
              disabled={isSavingNotes}
              onClick={handleSaveNotes}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-50 transition shadow-xs"
            >
              <CheckIcon className="h-3.5 w-3.5" />
              <span>{isSavingNotes ? "Saving…" : "Save Notes"}</span>
            </button>
          </div>

          <textarea
            rows={10}
            value={notesText}
            onChange={(e) => setNotesText(e.target.value)}
            placeholder="Record client decisions, agreed milestones, follow-up points, and key questions answered in this session…"
            className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#2563EB] focus:ring-1 focus:ring-blue-500/20 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}
