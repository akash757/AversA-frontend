"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Card from "@/components/Ui/Card";
import Badge from "@/components/Ui/Badge";
import Button from "@/components/Ui/Button";
import EmptyState from "@/components/Ui/EmptyState";
import {
  CalendarDaysIcon,
  VideoCameraIcon,
  ArrowTopRightOnSquareIcon,
  UserGroupIcon,
  ArrowRightIcon,
  PlusIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

function formatMeetingDateBadge(dateStr) {
  if (!dateStr) return { label: "TBD", isToday: false, isTomorrow: false };
  const d = new Date(dateStr);
  const now = new Date();
  
  const isSameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow =
    d.getFullYear() === tomorrow.getFullYear() &&
    d.getMonth() === tomorrow.getMonth() &&
    d.getDate() === tomorrow.getDate();

  if (isSameDay) {
    return {
      label: "TODAY",
      sublabel: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isToday: true,
      isTomorrow: false,
    };
  }

  if (isTomorrow) {
    return {
      label: "TOMORROW",
      sublabel: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isToday: false,
      isTomorrow: true,
    };
  }

  return {
    label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase(),
    sublabel: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    isToday: false,
    isTomorrow: false,
  };
}

export default function DashboardUpcomingMeetings({ meetings = [] }) {
  const [filterTab, setFilterTab] = useState("upcoming");

  const { upcomingList, todayList, completedList } = useMemo(() => {
    const now = new Date();
    const sorted = [...meetings].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    const upcoming = sorted.filter(
      (m) => (new Date(m.startTime) >= now || m.status === "scheduled") && m.status !== "completed" && m.status !== "cancelled"
    );

    const today = sorted.filter((m) => {
      const d = new Date(m.startTime);
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
      );
    });

    const completed = sorted
      .filter((m) => m.status === "completed" || new Date(m.startTime) < now)
      .slice(-5)
      .reverse();

    return {
      upcomingList: upcoming,
      todayList: today,
      completedList: completed,
    };
  }, [meetings]);

  const displayMeetings = useMemo(() => {
    if (filterTab === "today") return todayList;
    if (filterTab === "completed") return completedList;
    return upcomingList;
  }, [filterTab, todayList, completedList, upcomingList]);

  return (
    <Card variant="default" className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <Card.Header className="flex items-center justify-between gap-2 bg-[#F8FAFC]/50">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
            <CalendarDaysIcon className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#0F172A] font-display">
              Alignment Sessions
            </h2>
            <p className="text-[11px] text-[#64748B]">Google Meet syncs & agendas</p>
          </div>
        </div>

        <Link
          href="/meetings"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:text-blue-700 transition"
        >
          <span>All calls</span>
          <ArrowRightIcon className="h-3 w-3" />
        </Link>
      </Card.Header>

      <Card.Body className="space-y-4 p-4 flex-1 flex flex-col justify-between">
        {/* Sub-tabs */}
        <div className="flex items-center gap-1.5 border-b border-[#F1F5F9] pb-3 text-xs">
          <button
            type="button"
            onClick={() => setFilterTab("upcoming")}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
              filterTab === "upcoming"
                ? "bg-[#EFF6FF] text-[#2563EB]"
                : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
            }`}
          >
            Upcoming ({upcomingList.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("today")}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
              filterTab === "today"
                ? "bg-[#EFF6FF] text-[#2563EB]"
                : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
            }`}
          >
            Today ({todayList.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("completed")}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
              filterTab === "completed"
                ? "bg-[#EFF6FF] text-[#2563EB]"
                : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
            }`}
          >
            Past ({completedList.length})
          </button>
        </div>

        {/* Meeting List */}
        {displayMeetings.length === 0 ? (
          <div className="py-8 my-auto">
            <EmptyState
              icon={<CalendarDaysIcon className="h-6 w-6 text-[#94A3B8]" />}
              title={`No ${filterTab} calls`}
              description={
                filterTab === "today"
                  ? "You have no alignment meetings scheduled for today."
                  : filterTab === "completed"
                  ? "No previous alignment meetings recorded yet."
                  : "No upcoming meetings scheduled on your calendar."
              }
              action={
                <Button
                  variant="outline"
                  size="sm"
                  href="/meetings"
                  leftIcon={<PlusIcon className="h-3.5 w-3.5" />}
                >
                  Schedule Call
                </Button>
              }
            />
          </div>
        ) : (
          <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[380px] pr-1 scrollbar-thin">
            {displayMeetings.slice(0, 5).map((m) => {
              const mId = m.id || m._id;
              const dateInfo = formatMeetingDateBadge(m.startTime);
              const projectName = m.project?.name || m.projectId?.name;
              const participantCount = Array.isArray(m.participants) ? m.participants.length : 0;
              const isDone = m.status === "completed";

              return (
                <div
                  key={mId}
                  className="group rounded-xl border border-[#E2E8F0] bg-white p-3.5 transition-all hover:border-[#2563EB] hover:shadow-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Date Badge */}
                    <div
                      className={`flex flex-col items-center justify-center shrink-0 rounded-lg px-2 py-1.5 text-center min-w-[58px] ${
                        dateInfo.isToday
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : dateInfo.isTomorrow
                          ? "bg-blue-50 text-[#2563EB] border border-blue-200"
                          : "bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0]"
                      }`}
                    >
                      <span className="text-[10px] font-extrabold tracking-wider leading-none">
                        {dateInfo.label}
                      </span>
                      <span className="text-[10px] font-semibold mt-1 text-[#64748B] leading-none">
                        {dateInfo.sublabel}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Link
                          href="/meetings"
                          className="text-xs font-bold text-[#0F172A] hover:text-[#2563EB] transition-colors truncate max-w-[190px]"
                        >
                          {m.title}
                        </Link>
                        {projectName && (
                          <span className="rounded bg-[#F1F5F9] px-1.5 py-0.5 text-[9px] font-semibold text-[#475569] truncate max-w-[110px]">
                            {projectName}
                          </span>
                        )}
                      </div>

                      {m.description && (
                        <p className="mt-1 text-[11px] text-[#64748B] line-clamp-1 leading-normal">
                          {m.description}
                        </p>
                      )}

                      <div className="mt-2 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-[10px] text-[#94A3B8]">
                          <span className="inline-flex items-center gap-1">
                            <UserGroupIcon className="h-3 w-3 text-[#64748B]" />
                            {participantCount}
                          </span>
                          {m.notes && (
                            <span className="inline-flex items-center gap-1 text-[#2563EB] font-medium">
                              <DocumentTextIcon className="h-3 w-3" />
                              Notes
                            </span>
                          )}
                          {isDone && (
                            <Badge variant="success" size="sm">
                              Done
                            </Badge>
                          )}
                        </div>

                        {m.meetingLink && (
                          <Button
                            variant="secondary"
                            size="sm"
                            href={m.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-6 text-[11px] px-2"
                            leftIcon={<VideoCameraIcon className="h-3 w-3" />}
                            rightIcon={<ArrowTopRightOnSquareIcon className="h-2.5 w-2.5 opacity-60" />}
                          >
                            Join
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Action */}
        <div className="pt-2 border-t border-[#F1F5F9]">
          <Button
            variant="outline"
            size="sm"
            href="/meetings"
            fullWidth
            leftIcon={<PlusIcon className="h-3.5 w-3.5" />}
          >
            Schedule New Alignment Call
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}
