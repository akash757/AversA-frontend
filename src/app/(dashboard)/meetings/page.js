"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Skeleton from "@/components/Ui/Skeleton";
import { useToast } from "@/components/Ui/Toast";
import MeetingCard from "@/components/meetings/MeetingCard";
import GoogleCalendarConnect from "@/components/meetings/GoogleCalendarConnect";
import {
  createMeeting,
  getMeetingsByOrganization,
  updateMeeting,
  deleteMeeting,
} from "@/features/meeting/meeting";
import { getProjects } from "@/features/project/project";
import {
  CalendarDaysIcon,
  PlusIcon,
  VideoCameraIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function MeetingsPage() {
  const toast = useToast();
  const router = useRouter();

  const [meetings, setMeetings] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [togglingMeetingId, setTogglingMeetingId] = useState(null);

  const [meetingForm, setMeetingForm] = useState({
    title: "",
    description: "",
    projectId: "",
    meetingDate: new Date().toISOString().split("T")[0],
    startTime: "10:00",
    durationMinutes: 45,
    participantsInput: "",
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [meetingsRes, projectsRes] = await Promise.all([
        getMeetingsByOrganization(),
        getProjects(),
      ]);

      if (meetingsRes?.success) {
        setMeetings(meetingsRes.data?.meetings || []);
      } else {
        toast.warning(meetingsRes?.message || "Could not load organization meetings.");
      }

      if (projectsRes?.success) {
        setProjects(projectsRes.data?.projects || []);
      }
    } catch {
      toast.error("Failed to load meetings data.");
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

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
      const targetProjId = meetingForm.projectId || (projects[0]?.id || projects[0]?._id);
      const res = await createMeeting(targetProjId, {
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
          projectId: "",
          meetingDate: new Date().toISOString().split("T")[0],
          startTime: "10:00",
          durationMinutes: 45,
          participantsInput: "",
        });
        void loadData();
      } else {
        toast.error(res?.message || "Failed to schedule meeting.");
      }
    } catch {
      toast.error("Failed to schedule meeting.");
    } finally {
      setIsScheduling(false);
    }
  };

  const handleDeleteMeeting = async (m) => {
    if (!confirm("Are you sure you want to cancel and delete this meeting?")) return;
    const pId = m.project?.id || m.projectId?.id || m.projectId || "";
    const mId = m.id || m._id;
    try {
      const res = await deleteMeeting(pId, mId);
      if (res?.success) {
        toast.success("Meeting deleted.");
        void loadData();
      } else {
        toast.error(res?.message || "Failed to delete meeting.");
      }
    } catch {
      toast.error("Failed to delete meeting.");
    }
  };

  const handleToggleMeetingStatus = async (meetingId, newStatus) => {
    if (togglingMeetingId) return;
    setTogglingMeetingId(meetingId);
    try {
      const meetingObj = meetings.find((m) => (m.id || m._id) === meetingId);
      const pId = meetingObj?.project?.id || meetingObj?.projectId?.id || meetingObj?.projectId || "";
      const res = await updateMeeting(pId, meetingId, { status: newStatus });
      if (res?.success) {
        if (newStatus === "completed") {
          toast.success("Meeting marked completed! Project advanced to Deep Discovery.");
        } else {
          toast.success("Meeting reopened as scheduled.");
        }
        void loadData();
      } else {
        toast.error(res?.message || "Failed to update meeting status.");
      }
    } catch {
      toast.error("Failed to update meeting status.");
    } finally {
      setTogglingMeetingId(null);
    }
  };

  const filteredMeetings = meetings.filter((m) => {
    if (selectedProjectId === "all") return true;
    const pId = m.project?.id || m.projectId?.id || m.projectId || "";
    return pId === selectedProjectId;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900">
            Organization Meetings
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            View all scheduled alignment sessions, client reviews, and discovery calls across projects.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsScheduleModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-gray-950 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#2563EB] transition active:scale-95 self-start sm:self-auto"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Schedule Meeting</span>
        </button>
      </div>

      <GoogleCalendarConnect onConnected={() => void loadData()} />

      {/* Filter by Project */}
      {projects.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 mr-1">Filter Project:</span>
          <button
            type="button"
            onClick={() => setSelectedProjectId("all")}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              selectedProjectId === "all"
                ? "bg-[#2563EB] text-white shadow-xs"
                : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            All Projects ({meetings.length})
          </button>
          {projects.map((p) => {
            const pId = p.id || p._id;
            const count = meetings.filter(
              (m) => (m.project?.id || m.projectId?.id || m.projectId) === pId
            ).length;

            return (
              <button
                key={pId}
                type="button"
                onClick={() => setSelectedProjectId(pId)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                  selectedProjectId === pId
                    ? "bg-[#2563EB] text-white shadow-xs"
                    : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {p.name} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Meetings List */}
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton.MeetingCard key={i} />
          ))
        ) : filteredMeetings.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-xs">
            <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-300 stroke-1" />
            <h3 className="mt-3 text-sm font-bold text-gray-900">No meetings found</h3>
            <p className="mt-1 text-xs text-gray-500 max-w-sm mx-auto">
              Schedule your first Google Meet alignment session with a client or team member.
            </p>
            <button
              type="button"
              onClick={() => setIsScheduleModalOpen(true)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1d4ed8]"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Schedule Call</span>
            </button>
          </div>
        ) : (
          filteredMeetings.map((m) => (
            <MeetingCard
              key={m.id || m._id}
              meeting={m}
              showProjectTag={true}
              onClick={() => {
                const pId = m.project?.id || m.projectId?.id || m.projectId;
                if (pId) {
                  router.push(`/projects/${pId}/meetings/${m.id || m._id}`);
                }
              }}
              onDelete={() => handleDeleteMeeting(m)}
              onToggleComplete={handleToggleMeetingStatus}
              isTogglingComplete={togglingMeetingId === (m.id || m._id)}
            />
          ))
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
                  Project *
                </label>
                <select
                  required
                  value={meetingForm.projectId}
                  onChange={(e) =>
                    setMeetingForm((prev) => ({ ...prev, projectId: e.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 focus:border-[#2563EB] focus:outline-none"
                >
                  <option value="">-- Select Project --</option>
                  {projects.map((p) => (
                    <option key={p.id || p._id} value={p.id || p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Meeting Title *
                </label>
                <input
                  type="text"
                  required
                  value={meetingForm.title}
                  onChange={(e) => setMeetingForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Discovery Scope & Requirements Alignment"
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
                    onChange={(e) =>
                      setMeetingForm((prev) => ({ ...prev, meetingDate: e.target.value }))
                    }
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
                    onChange={(e) =>
                      setMeetingForm((prev) => ({ ...prev, startTime: e.target.value }))
                    }
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
                      setMeetingForm((prev) => ({
                        ...prev,
                        durationMinutes: Number(e.target.value),
                      }))
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
                  Participant Emails (comma or space separated)
                </label>
                <input
                  type="text"
                  value={meetingForm.participantsInput}
                  onChange={(e) =>
                    setMeetingForm((prev) => ({ ...prev, participantsInput: e.target.value }))
                  }
                  placeholder="client@clientcorp.com, dev@aversa.ai"
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
                  placeholder="Summarize the core topics and agenda for this call…"
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
                  {isScheduling ? "Generating Meet Link…" : "Confirm Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
