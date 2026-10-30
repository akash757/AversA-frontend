"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { getProjects } from "@/features/project/project";
import { getMeetingsByOrganization } from "@/features/meeting/meeting";
import { getAllUsers } from "@/features/admin/admin";
import ProjectCard from "@/components/dashboard/ProjectCard";
import MeetingCard from "@/components/meetings/MeetingCard";
import CreateProjectModal from "@/components/project/CreateProjectModal";
import Loader from "@/components/Ui/Loader";
import {
  FolderIcon,
  CalendarDaysIcon,
  UsersIcon,
  PlusIcon,
  SparklesIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

export default function DashboardPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [userCount, setUserCount] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [projectTab, setProjectTab] = useState("all");

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [projRes, meetRes, usersRes] = await Promise.all([
        getProjects(),
        getMeetingsByOrganization(),
        getAllUsers(),
      ]);

      if (projRes?.success) {
        setProjects(projRes.data?.projects || []);
      }
      if (meetRes?.success) {
        setMeetings(meetRes.data?.meetings || []);
      }
      if (usersRes?.success) {
        const list = usersRes.data?.users || usersRes.data || [];
        setUserCount(Array.isArray(list) ? list.length : 1);
      }
    } catch {
      // Fallback gracefully
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboardData();
  }, [loadDashboardData]);

  const greetingTime = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  if (isLoading) return <Loader />;

  const now = new Date();
  const upcomingMeetings = meetings
    .filter((m) => new Date(m.startTime) >= now || m.status === "scheduled")
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 3);

  const activeProjects = projects.filter(
    (p) => p.status !== "completed" && p.status !== "cancelled"
  );

  // Discovery stages breakdown
  const dayOneCount = projects.filter((p) => p.stage === "day_one").length;
  const deepDiscoveryCount = projects.filter((p) => p.stage === "discovery").length;
  const confirmedCount = projects.filter((p) => p.stage === "requirements_confirmed").length;

  // Filtered projects for the recent grid
  const filteredProjects = projects.filter((p) => {
    if (projectTab === "all") return true;
    if (projectTab === "in_progress") return p.status === "in_progress";
    if (projectTab === "planning") return p.status === "planning";
    return true;
  }).slice(0, 4);

  return (
    <div className="space-y-7">
      {/* Premium Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-gray-200/80 bg-linear-to-br from-white via-blue-50/20 to-indigo-50/20 p-6 sm:p-8 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/80 px-3 py-1 text-xs font-semibold text-[#2563EB] mb-3 shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2563EB]" />
              </span>
              <span>AversA Product Operations Suite</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900">
              {greetingTime}, {user?.firstName || "Operator"}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
              Orchestrate client discovery questionnaires, coordinate alignment meetings, and turn client vision into verified delivery roadmaps.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gray-950 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-gray-900/10 hover:bg-[#2563EB] hover:shadow-blue-500/20 transition active:scale-95 cursor-pointer"
            >
              <PlusIcon className="h-4 w-4 stroke-2" />
              <span>New Project</span>
            </button>

            <Link
              href="/meetings"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition shadow-2xs"
            >
              <CalendarDaysIcon className="h-4 w-4 text-emerald-600" />
              <span>Schedule Call</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Projects */}
        <Link
          href="/projects"
          className="group rounded-2xl border border-gray-200/80 bg-white p-5 shadow-2xs transition hover:border-[#2563EB] hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB] group-hover:bg-[#2563EB] group-hover:text-white transition">
              <FolderIcon className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              {activeProjects.length} Active
            </span>
          </div>
          <p className="mt-4 text-xs font-bold uppercase tracking-wider text-gray-400">
            Total Projects
          </p>
          <p className="text-3xl font-black text-gray-900 mt-0.5">{projects.length}</p>
        </Link>

        {/* Discovery Pipeline */}
        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <SparklesIcon className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
              Day 1 & Deep
            </span>
          </div>
          <p className="mt-4 text-xs font-bold uppercase tracking-wider text-gray-400">
            In Discovery
          </p>
          <p className="text-3xl font-black text-gray-900 mt-0.5">
            {dayOneCount + deepDiscoveryCount}
          </p>
        </div>

        {/* Alignment Sessions */}
        <Link
          href="/meetings"
          className="group rounded-2xl border border-gray-200/80 bg-white p-5 shadow-2xs transition hover:border-[#2563EB] hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white transition">
              <CalendarDaysIcon className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-700 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded-full">
              {upcomingMeetings.length} Upcoming
            </span>
          </div>
          <p className="mt-4 text-xs font-bold uppercase tracking-wider text-gray-400">
            Alignment Sessions
          </p>
          <p className="text-3xl font-black text-gray-900 mt-0.5">{meetings.length}</p>
        </Link>

        {/* Team Members */}
        <Link
          href="/users"
          className="group rounded-2xl border border-gray-200/80 bg-white p-5 shadow-2xs transition hover:border-[#2563EB] hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition">
              <UsersIcon className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
              Organization
            </span>
          </div>
          <p className="mt-4 text-xs font-bold uppercase tracking-wider text-gray-400">
            Team Members
          </p>
          <p className="text-3xl font-black text-gray-900 mt-0.5">{userCount}</p>
        </Link>
      </div>

      {/* Discovery Stage Funnel Bar */}
      {projects.length > 0 && (
        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <ChartBarIcon className="h-4 w-4 text-[#2563EB]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                Discovery Stage Funnel
              </h3>
            </div>
            <span className="text-xs text-gray-500">
              {confirmedCount} of {projects.length} engagements confirmed for execution
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-900">Day 1 Discovery</span>
                <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">
                  {dayOneCount}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-blue-600">Baseline client questions</p>
            </div>

            <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-900">Deep Discovery</span>
                <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-700">
                  {deepDiscoveryCount}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-indigo-600">In-depth scoping & alignment</p>
            </div>

            <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-900">Requirements Confirmed</span>
                <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">
                  {confirmedCount}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-emerald-600">Ready for sprint delivery</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
        {/* Left Column: Recent Projects */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-gray-900 tracking-tight">Active Projects</h2>
              <p className="text-xs text-gray-500">Stage Discovery & Scope Orchestration</p>
            </div>

            <div className="flex items-center gap-3">
              {/* Quick Tab Filter */}
              <div className="inline-flex rounded-xl border border-gray-200 bg-gray-50 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setProjectTab("all")}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                    projectTab === "all" ? "bg-white text-gray-900 shadow-2xs font-semibold" : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setProjectTab("in_progress")}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                    projectTab === "in_progress" ? "bg-white text-gray-900 shadow-2xs font-semibold" : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  In Progress
                </button>
                <button
                  type="button"
                  onClick={() => setProjectTab("planning")}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                    projectTab === "planning" ? "bg-white text-gray-900 shadow-2xs font-semibold" : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  Planning
                </button>
              </div>

              <Link
                href="/projects"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:text-[#1d4ed8] transition"
              >
                <span>View all</span>
                <ArrowRightIcon className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {projects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-gray-500 shadow-2xs">
              <FolderIcon className="mx-auto h-10 w-10 text-gray-300 mb-2" />
              <p className="text-sm font-semibold text-gray-900">No projects created yet</p>
              <p className="mt-1 text-xs">Start by creating your first client project.</p>
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#1d4ed8] transition cursor-pointer"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Create New Project</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProjects.map((p) => (
                <ProjectCard key={p.id || p._id} project={p} />
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Upcoming Alignment Meetings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900 tracking-tight">Upcoming Calls</h2>
              <p className="text-xs text-gray-500">Google Meet Alignments</p>
            </div>
            <Link
              href="/meetings"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:text-[#1d4ed8] transition"
            >
              <span>All calls</span>
              <ArrowRightIcon className="h-3 w-3" />
            </Link>
          </div>

          {upcomingMeetings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-gray-500 shadow-2xs">
              <CalendarDaysIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm font-semibold text-gray-900">No upcoming calls</p>
              <p className="mt-1 text-xs">You have no meetings scheduled for today.</p>
              <Link
                href="/meetings"
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-gray-950 px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#2563EB] transition"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Schedule a Call</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingMeetings.map((m) => (
                <MeetingCard key={m.id || m._id} meeting={m} showProjectTag={true} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Redesigned 2-Step Create Project Modal triggered directly from Dashboard */}
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => void loadDashboardData()}
      />
    </div>
  );
}
