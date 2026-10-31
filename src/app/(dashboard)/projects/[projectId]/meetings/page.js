"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CalendarDaysIcon,
  PlusIcon,
  ArrowLeftIcon,
  VideoCameraIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Skeleton from "@/components/Ui/Skeleton";
import { useToast } from "@/components/Ui/Toast";
import MeetingCard from "@/components/meetings/MeetingCard";
import GoogleCalendarConnect from "@/components/meetings/GoogleCalendarConnect";
import {
  getMeetingsByProject,
  createMeeting,
  updateMeeting,
  deleteMeeting,
} from "@/features/meeting/meeting";

export default function ProjectMeetingsPage() {
  const toast = useToast();
  const params = useParams();
  const router = useRouter();
  const projectId = Array.isArray(params?.projectId) ? params.projectId[0] : params?.projectId;

  const [meetings, setMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [togglingMeetingId, setTogglingMeetingId] = useState(null);

  const [meetingForm, setMeetingForm] = useState({
    title: "",
    description: "",
    meetingDate: new Date().toISOString().split("T")[0],
    startTime: "10:00",
    durationMinutes: 45,
    participantsInput: "",
  });

  const loadMeetings = useCallback(async (id) => {
    setIsLoading(true);
    try {
      const res = await getMeetingsByProject(id);
      if (res?.success) {
        setMeetings(res.data?.meetings || []);
      } else {
        toast.warning(res?.message || "Could not load meetings.");
      }
    } catch {
      toast.error("Failed to load meetings.");
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!projectId) return;
    void loadMeetings(projectId);
  }, [projectId, loadMeetings]);

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!meetingForm.title.trim()) {
      toast.error("Meeting title is required.");
      return;
    }

    const startDateTime = new Date(`${meetingForm.meetingDate}T${meetingForm.startTime}:00`);
    const endDateTime = new Date(startDateTime.getTime() + meetingForm.durationMinutes * 60000);

    const emailList = meetingForm.participantsInput
      .split(/[\s,]+/)
      .map((email) => email.trim().toLowerCase())
      .filter((email) => email && email.includes("@"));

    const uniqueEmails = [...new Set(emailList)];

    setIsScheduling(true);
    try {
      const res = await createMeeting(projectId, {
        title: meetingForm.title.trim(),
        description: meetingForm.description.trim(),
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        participants: uniqueEmails,
      });

      if (res?.success) {
        toast.success("Meeting scheduled successfully with Google Meet!");
        setIsScheduleModalOpen(false);
        setMeetingForm({
          title: "",
          description: "",
          meetingDate: new Date().toISOString().split("T")[0],
          startTime: "10:00",
          durationMinutes: 45,
          participantsInput: "",
        });
        void loadMeetings(projectId);
      } else {
        toast.error(res?.message || "Failed to schedule meeting.");
      }
    } catch {
      toast.error("Failed to schedule meeting.");
    } finally {
      setIsScheduling(false);
    }
  };

  const handleDeleteMeeting = async (meetingId) => {
    if (!confirm("Are you sure you want to cancel and delete this meeting?")) return;
    try {
      const res = await deleteMeeting(projectId, meetingId);
      if (res?.success) {
        toast.success("Meeting deleted.");
        void loadMeetings(projectId);
      } else {
        toast.error(res?.message || "Failed to delete meeting.");
      }
    } catch {
      toast.error("Failed to delete meeting.");
    }
  };

  const handleToggleMeetingStatus = async (meetingId, newStatus) => {
    if (togglingMeetingId || !projectId) return;
    setTogglingMeetingId(meetingId);
    try {
      const res = await updateMeeting(projectId, meetingId, { status: newStatus });
      if (res?.success) {
        if (newStatus === "completed") {
          toast.success("Meeting marked completed! Stage advanced to Deep Discovery.");
        } else {
          toast.success("Meeting reopened as scheduled.");
        }
        void loadMeetings(projectId);
      } else {
        toast.error(res?.message || "Failed to update meeting status.");
      }
    } catch {
      toast.error("Failed to update meeting status.");
    } finally {
      setTogglingMeetingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top back */}
      <div className="flex items-center justify-between">
        <Link
          href={`/projects/${projectId}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          <span>Back to Project Workspace</span>
        </Link>

        <button
          type="button"
          onClick={() => setIsScheduleModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#1d4ed8] transition active:scale-95"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Schedule Meeting</span>
        </button>
      </div>

      <GoogleCalendarConnect onConnected={() => void loadMeetings(projectId)} />

      {/* Meeting Cards List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900">
            Scheduled Sessions ({meetings.length})
          </h2>
        </div>

        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton.MeetingCard key={i} />
          ))
        ) : meetings.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-xs">
            <CalendarDaysIcon className="mx-auto h-10 w-10 text-gray-300 stroke-1" />
            <p className="mt-3 text-sm font-bold text-gray-900">No meetings scheduled for this project</p>
            <p className="mt-1 text-xs text-gray-500 max-w-sm mx-auto">
              Schedule your first Google Meet discovery or status session.
            </p>
            <button
              type="button"
              onClick={() => setIsScheduleModalOpen(true)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1d4ed8]"
            >
              <PlusIcon className="h-4 w-4" />
              Schedule Now
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {meetings.map((meeting) => (
              <MeetingCard
                key={meeting.id || meeting._id}
                meeting={meeting}
                onClick={() =>
                  router.push(`/projects/${projectId}/meetings/${meeting.id || meeting._id}`)
                }
                onDelete={() => handleDeleteMeeting(meeting.id || meeting._id)}
                onToggleComplete={handleToggleMeetingStatus}
                isTogglingComplete={togglingMeetingId === (meeting.id || meeting._id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* MODAL: SCHEDULE MEETING */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 text-gray-900 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <VideoCameraIcon className="h-5 w-5 text-[#2563EB]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">
                  Schedule Alignment Meeting
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:text-gray-700"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Meeting Title *
                </label>
                <input
                  type="text"
                  required
                  value={meetingForm.title}
                  onChange={(e) => setMeetingForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Discovery Scope Alignment"
                  className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#2563EB] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={meetingForm.meetingDate}
                    onChange={(e) => setMeetingForm((prev) => ({ ...prev, meetingDate: e.target.value }))}
                    className="w-full rounded-xl border border-gray-200 bg-white p-2 text-xs text-gray-900 focus:border-[#2563EB] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={meetingForm.startTime}
                    onChange={(e) => setMeetingForm((prev) => ({ ...prev, startTime: e.target.value }))}
                    className="w-full rounded-xl border border-gray-200 bg-white p-2 text-xs text-gray-900 focus:border-[#2563EB] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Duration
                  </label>
                  <select
                    value={meetingForm.durationMinutes}
                    onChange={(e) =>
                      setMeetingForm((prev) => ({ ...prev, durationMinutes: Number(e.target.value) }))
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white p-2 text-xs text-gray-900 focus:border-[#2563EB] focus:outline-none"
                  >
                    <option value={15}>15 mins</option>
                    <option value={30}>30 mins</option>
                    <option value={45}>45 mins</option>
                    <option value={60}>60 mins</option>
                    <option value={90}>90 mins</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Participant Emails (comma separated)
                </label>
                <input
                  type="text"
                  value={meetingForm.participantsInput}
                  onChange={(e) =>
                    setMeetingForm((prev) => ({ ...prev, participantsInput: e.target.value }))
                  }
                  placeholder="client@company.com, team@aversa.ai"
                  className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#2563EB] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Agenda & Description
                </label>
                <textarea
                  rows={2}
                  value={meetingForm.description}
                  onChange={(e) =>
                    setMeetingForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Detail meeting topics and expectations…"
                  className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#2563EB] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isScheduling}
                  className="rounded-xl bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-50"
                >
                  {isScheduling ? "Scheduling…" : "Schedule Meeting"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
