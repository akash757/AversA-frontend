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
import Skeleton from "@/components/Ui/Skeleton";
import Button from "@/components/Ui/Button";
import Card from "@/components/Ui/Card";
import Badge from "@/components/Ui/Badge";
import {
  FolderIcon,
  CalendarDaysIcon,
  UsersIcon,
  PlusIcon,
  SparklesIcon,
  ArrowRightIcon,
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

  if (isLoading) return <Skeleton.Dashboard />;

  const now = new Date();
  const upcomingMeetings = meetings
    .filter((m) => new Date(m.startTime) >= now || m.status === "scheduled")
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 3);

  const activeProjects = projects.filter(
    (p) => p.status !== "completed" && p.status !== "cancelled"
  );

  const dayOneCount = projects.filter((p) => p.stage === "day_one").length;
  const deepDiscoveryCount = projects.filter((p) => p.stage === "discovery").length;
  const confirmedCount = projects.filter((p) => p.stage === "requirements_confirmed").length;

  const filteredProjects = projects.filter((p) => {
    if (projectTab === "all") return true;
    if (projectTab === "in_progress") return p.status === "in_progress";
    if (projectTab === "planning") return p.status === "planning";
    return true;
  }).slice(0, 4);

  return (
    <div className="space-y-7 animate-fade-in">
      {/* ── Welcome Hero Banner ──────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white p-6 sm:p-8 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="mb-2.5">
              <Badge variant="brand" size="sm" dot>
                AversA Product Intelligence
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A] font-display">
              {greetingTime}, {user?.firstName || "Operator"}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-[#475569] leading-relaxed">
              Orchestrate client discovery questionnaires, coordinate alignment meetings, and turn client vision into verified delivery roadmaps.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="primary"
              size="md"
              onClick={() => setShowCreateModal(true)}
              leftIcon={<PlusIcon className="h-4 w-4" />}
            >
              New Project
            </Button>

            <Button
              variant="outline"
              size="md"
              href="/meetings"
              leftIcon={<CalendarDaysIcon className="h-4 w-4 text-[#059669]" />}
            >
              Schedule Call
            </Button>
          </div>
        </div>
      </div>

      {/* ── KPI Stats Grid ───────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Projects */}
        <Link
          href="/projects"
          className="group rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs transition hover:border-[#2563EB] hover:shadow-md hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB] group-hover:bg-[#2563EB] group-hover:text-white transition">
              <FolderIcon className="h-5 w-5" />
            </div>
            <Badge variant="success" size="sm">
              {activeProjects.length} Active
            </Badge>
          </div>
          <p className="mt-4 text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
            Total Projects
          </p>
          <p className="text-3xl font-extrabold text-[#0F172A] mt-0.5 font-display">{projects.length}</p>
        </Link>

        {/* Discovery Pipeline */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <SparklesIcon className="h-5 w-5" />
            </div>
            <Badge variant="violet" size="sm">
              Day 1 & Deep
            </Badge>
          </div>
          <p className="mt-4 text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
            In Discovery
          </p>
          <p className="text-3xl font-extrabold text-[#0F172A] mt-0.5 font-display">
            {dayOneCount + deepDiscoveryCount}
          </p>
        </div>

        {/* Alignment Sessions */}
        <Link
          href="/meetings"
          className="group rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs transition hover:border-[#2563EB] hover:shadow-md hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white transition">
              <CalendarDaysIcon className="h-5 w-5" />
            </div>
            <Badge variant="brand" size="sm">
              {upcomingMeetings.length} Upcoming
            </Badge>
          </div>
          <p className="mt-4 text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
            Alignment Sessions
          </p>
          <p className="text-3xl font-extrabold text-[#0F172A] mt-0.5 font-display">{meetings.length}</p>
        </Link>

        {/* Team Members */}
        <Link
          href="/users"
          className="group rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs transition hover:border-[#2563EB] hover:shadow-md hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition">
              <UsersIcon className="h-5 w-5" />
            </div>
            <Badge variant="neutral" size="sm">
              Organization
            </Badge>
          </div>
          <p className="mt-4 text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
            Team Members
          </p>
          <p className="text-3xl font-extrabold text-[#0F172A] mt-0.5 font-display">{userCount}</p>
        </Link>
      </div>

      {/* ── Discovery Stage Funnel Card ──────────────────── */}
      {projects.length > 0 && (
        <Card variant="default" className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <ChartBarIcon className="h-4 w-4 text-[#2563EB]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                Discovery Stage Funnel
              </h3>
            </div>
            <span className="text-xs text-[#64748B]">
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
        </Card>
      )}

      {/* ── Main Two-Column Layout ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
        {/* Left Column: Recent Projects */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-[#0F172A] font-display">Active Projects</h2>
              <p className="text-xs text-[#64748B]">Stage Discovery & Scope Orchestration</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="inline-flex rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setProjectTab("all")}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                    projectTab === "all" ? "bg-white text-[#0F172A] shadow-xs" : "text-[#64748B] hover:text-[#0F172A]"
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setProjectTab("in_progress")}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                    projectTab === "in_progress" ? "bg-white text-[#0F172A] shadow-xs" : "text-[#64748B] hover:text-[#0F172A]"
                  }`}
                >
                  In Progress
                </button>
                <button
                  type="button"
                  onClick={() => setProjectTab("planning")}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                    projectTab === "planning" ? "bg-white text-[#0F172A] shadow-xs" : "text-[#64748B] hover:text-[#0F172A]"
                  }`}
                >
                  Planning
                </button>
              </div>

              <Link
                href="/projects"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:text-blue-700 transition"
              >
                <span>View all</span>
                <ArrowRightIcon className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {projects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#E2E8F0] bg-white p-10 text-center text-[#64748B] shadow-xs">
              <FolderIcon className="mx-auto h-10 w-10 text-[#CBD5E1] mb-2" />
              <p className="text-sm font-semibold text-[#0F172A]">No projects created yet</p>
              <p className="mt-1 text-xs">Start by creating your first client project.</p>
              <div className="mt-4 flex justify-center">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowCreateModal(true)}
                  leftIcon={<PlusIcon className="h-4 w-4" />}
                >
                  Create New Project
                </Button>
              </div>
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
              <h2 className="text-base font-bold text-[#0F172A] font-display">Upcoming Calls</h2>
              <p className="text-xs text-[#64748B]">Google Meet Alignments</p>
            </div>
            <Link
              href="/meetings"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:text-blue-700 transition"
            >
              <span>All calls</span>
              <ArrowRightIcon className="h-3 w-3" />
            </Link>
          </div>

          {upcomingMeetings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#E2E8F0] bg-white p-8 text-center text-[#64748B] shadow-xs">
              <CalendarDaysIcon className="mx-auto h-8 w-8 text-[#CBD5E1] mb-2" />
              <p className="text-sm font-semibold text-[#0F172A]">No upcoming calls</p>
              <p className="mt-1 text-xs">You have no meetings scheduled for today.</p>
              <div className="mt-3 flex justify-center">
                <Button
                  variant="primary"
                  size="sm"
                  href="/meetings"
                  leftIcon={<PlusIcon className="h-4 w-4" />}
                >
                  Schedule a Call
                </Button>
              </div>
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

      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => void loadDashboardData()}
      />
    </div>
  );
}
