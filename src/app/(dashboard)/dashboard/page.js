"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { getProjects } from "@/features/project/project";
import { getMeetingsByOrganization } from "@/features/meeting/meeting";
import { getAllUsers } from "@/features/admin/admin";

// Reusable Design System UI
import Button from "@/components/Ui/Button";
import Card from "@/components/Ui/Card";
import Badge from "@/components/Ui/Badge";
import Tabs from "@/components/Ui/Tabs";
import Input from "@/components/Ui/Input";
import Select from "@/components/Ui/Select";
import EmptyState from "@/components/Ui/EmptyState";
import Skeleton, { SkeletonDashboard } from "@/components/Ui/Skeleton";

// Dashboard Components
import ProjectCard from "@/components/dashboard/ProjectCard";
import DashboardProjectRow from "@/components/dashboard/DashboardProjectRow";
import DashboardUpcomingMeetings from "@/components/dashboard/DashboardUpcomingMeetings";
import CreateProjectModal from "@/components/project/CreateProjectModal";
import ProjectSearchPanel from "@/components/dashboard/ProjectSearchPanel";

// Icons
import {
  FolderIcon,
  CalendarDaysIcon,
  SparklesIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  Squares2X2Icon,
  Bars3BottomLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowRightIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";

// Priority and Stage weights for sorting
const PRIORITY_WEIGHTS = { critical: 4, high: 3, medium: 2, low: 1 };
const STAGE_WEIGHTS = { requirements_confirmed: 3, discovery: 2, day_one: 1 };

export default function DashboardPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [userCount, setUserCount] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchDrawerOpen, setSearchDrawerOpen] = useState(false);

  // Enterprise Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusTab, setStatusTab] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("updated_desc");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = viewMode === "grid" ? 6 : 8;

  const loadDashboardData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
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
      // Graceful fallback
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboardData();
  }, [loadDashboardData]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusTab, stageFilter, priorityFilter, sortBy, viewMode]);

  const greetingTime = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  // Compute Core Metrics
  const activeProjects = useMemo(
    () => projects.filter((p) => p.status !== "completed" && p.status !== "cancelled"),
    [projects]
  );
  const completedProjects = useMemo(
    () => projects.filter((p) => p.status === "completed"),
    [projects]
  );
  const dayOneCount = useMemo(
    () => projects.filter((p) => p.stage === "day_one").length,
    [projects]
  );
  const deepDiscoveryCount = useMemo(
    () => projects.filter((p) => p.stage === "discovery").length,
    [projects]
  );
  const confirmedCount = useMemo(
    () => projects.filter((p) => p.stage === "requirements_confirmed").length,
    [projects]
  );

  const upcomingMeetings = useMemo(() => {
    const now = new Date();
    return meetings.filter(
      (m) =>
        (new Date(m.startTime) >= now || m.status === "scheduled") &&
        m.status !== "completed" &&
        m.status !== "cancelled"
    );
  }, [meetings]);

  const todayMeetings = useMemo(() => {
    const now = new Date();
    return upcomingMeetings.filter((m) => {
      const d = new Date(m.startTime);
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
      );
    });
  }, [upcomingMeetings]);

  // Filter & Sort Projects
  const filteredProjects = useMemo(() => {
    let result = [...projects];

    // Status Tab Filter
    if (statusTab !== "all") {
      result = result.filter((p) => p.status === statusTab);
    }

    // Stage Funnel Filter
    if (stageFilter !== "all") {
      result = result.filter((p) => p.stage === stageFilter);
    }

    // Priority Dropdown Filter
    if (priorityFilter !== "all") {
      result = result.filter((p) => p.priority === priorityFilter);
    }

    // Keyword Search (Name, Client, TechStack, Description)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((p) => {
        const nameMatch = p.name?.toLowerCase().includes(q);
        const descMatch = p.description?.toLowerCase().includes(q);
        const clientMatch = p.clientName?.toLowerCase().includes(q);
        const stackMatch = Array.isArray(p.techStack) && p.techStack.some((t) => t.toLowerCase().includes(q));
        return nameMatch || descMatch || clientMatch || stackMatch;
      });
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "name_asc") {
        return (a.name || "").localeCompare(b.name || "");
      }
      if (sortBy === "priority_desc") {
        return (PRIORITY_WEIGHTS[b.priority] || 0) - (PRIORITY_WEIGHTS[a.priority] || 0);
      }
      if (sortBy === "progress_desc") {
        return (STAGE_WEIGHTS[b.stage] || 0) - (STAGE_WEIGHTS[a.stage] || 0);
      }
      // default: updated_desc
      return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
    });

    return result;
  }, [projects, statusTab, stageFilter, priorityFilter, searchQuery, sortBy]);

  // Pagination Slice
  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / pageSize));
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProjects.slice(start, start + pageSize);
  }, [filteredProjects, currentPage, pageSize]);

  // Clear all filters handler
  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusTab("all");
    setStageFilter("all");
    setPriorityFilter("all");
    setSortBy("updated_desc");
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    statusTab !== "all" ||
    stageFilter !== "all" ||
    priorityFilter !== "all";

  // Tabs config with live counts
  const statusTabs = useMemo(() => {
    return [
      { value: "all", label: "All", count: projects.length },
      {
        value: "in_progress",
        label: "In Progress",
        count: projects.filter((p) => p.status === "in_progress").length,
      },
      {
        value: "planning",
        label: "Planning",
        count: projects.filter((p) => p.status === "planning").length,
      },
      {
        value: "completed",
        label: "Completed",
        count: projects.filter((p) => p.status === "completed").length,
      },
      {
        value: "on_hold",
        label: "On Hold",
        count: projects.filter((p) => p.status === "on_hold").length,
      },
    ];
  }, [projects]);

  if (isLoading) return <SkeletonDashboard />;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* ── Executive Header Bar ──────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Workspace Overview
            </span>
            <Badge variant="brand" size="sm" dot>
              Enterprise
            </Badge>
            {todayMeetings.length > 0 && (
              <Badge variant="success" size="sm" dot>
                {todayMeetings.length} Call{todayMeetings.length > 1 ? "s" : ""} Today
              </Badge>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A] font-display">
            {greetingTime}, {user?.firstName || "Operator"}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#64748B]">
            Client discovery pipeline, alignment meetings & delivery roadmaps.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="md"
            onClick={() => loadDashboardData(true)}
            title="Refresh dashboard data"
            className="hover:border-[#2563EB]"
          >
            <ArrowPathIcon
              className={`h-4 w-4 text-[#64748B] ${isRefreshing ? "animate-spin text-[#2563EB]" : ""}`}
            />
          </Button>

          <Button
            variant="outline"
            size="md"
            href="/meetings"
            leftIcon={<CalendarDaysIcon className="h-4 w-4 text-[#059669]" />}
          >
            Schedule Call
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => setShowCreateModal(true)}
            leftIcon={<PlusIcon className="h-4 w-4" />}
          >
            New Project
          </Button>
        </div>
      </div>

      {/* ── High-Impact KPI Stat Cards ────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Projects */}
        <Card
          interactive
          onClick={() => {
            setStatusTab("in_progress");
            setStageFilter("all");
          }}
          className="p-5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]">
              <FolderIcon className="h-5 w-5" />
            </div>
            <Badge variant="brand" size="sm">
              {activeProjects.length} Active
            </Badge>
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
              Total Projects
            </p>
            <div className="flex items-baseline justify-between mt-0.5">
              <span className="text-3xl font-extrabold text-[#0F172A] font-display">
                {projects.length}
              </span>
              <span className="text-xs font-medium text-[#64748B]">
                {completedProjects.length} completed
              </span>
            </div>
          </div>
        </Card>

        {/* Discovery Pipeline */}
        <Card
          interactive
          onClick={() => {
            setStageFilter(stageFilter === "all" ? "discovery" : "all");
          }}
          className={`p-5 flex flex-col justify-between ${
            stageFilter === "discovery" || stageFilter === "day_one"
              ? "border-[#7C3AED] ring-2 ring-[#7C3AED]/15"
              : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-[#7C3AED]">
              <SparklesIcon className="h-5 w-5" />
            </div>
            <Badge variant="violet" size="sm">
              Day 1 & Deep
            </Badge>
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
              In Discovery
            </p>
            <div className="flex items-baseline justify-between mt-0.5">
              <span className="text-3xl font-extrabold text-[#0F172A] font-display">
                {dayOneCount + deepDiscoveryCount}
              </span>
              <span className="text-xs font-medium text-[#7C3AED]">
                {dayOneCount} Day 1 • {deepDiscoveryCount} Deep
              </span>
            </div>
          </div>
        </Card>

        {/* Requirements Confirmed */}
        <Card
          interactive
          onClick={() => {
            setStageFilter(stageFilter === "requirements_confirmed" ? "all" : "requirements_confirmed");
          }}
          className={`p-5 flex flex-col justify-between ${
            stageFilter === "requirements_confirmed"
              ? "border-emerald-500 ring-2 ring-emerald-500/15"
              : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-[#059669]">
              <CheckCircleIcon className="h-5 w-5" />
            </div>
            <Badge variant="success" size="sm">
              Delivery Ready
            </Badge>
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
              Confirmed Scope
            </p>
            <div className="flex items-baseline justify-between mt-0.5">
              <span className="text-3xl font-extrabold text-[#0F172A] font-display">
                {confirmedCount}
              </span>
              <span className="text-xs font-medium text-emerald-700">
                {projects.length > 0
                  ? `${Math.round((confirmedCount / projects.length) * 100)}% of portfolio`
                  : "0%"}
              </span>
            </div>
          </div>
        </Card>

        {/* Alignment Sessions */}
        <Link
          href="/meetings"
          className="group rounded-[18px] border border-[#E2E8F0] bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-[#2563EB] flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white transition">
              <CalendarDaysIcon className="h-5 w-5" />
            </div>
            <Badge variant="info" size="sm">
              {upcomingMeetings.length} Scheduled
            </Badge>
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
              Alignment Calls
            </p>
            <div className="flex items-baseline justify-between mt-0.5">
              <span className="text-3xl font-extrabold text-[#0F172A] font-display">
                {meetings.length}
              </span>
              <span className="text-xs font-medium text-cyan-700">
                {todayMeetings.length > 0 ? `${todayMeetings.length} today` : `${userCount} team members`}
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* ── Interactive Discovery Stage Funnel ────────────────── */}
      {projects.length > 0 && (
        <Card variant="default" className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <SparklesIcon className="h-4 w-4 text-[#2563EB]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                  Discovery Pipeline Stage Funnel
                </h2>
              </div>
              <p className="mt-0.5 text-xs text-[#64748B]">
                Click any stage card to filter your active projects list.
              </p>
            </div>

            {stageFilter !== "all" ? (
              <button
                type="button"
                onClick={() => setStageFilter("all")}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 border border-blue-200 px-2.5 py-1 text-xs font-semibold text-[#2563EB] hover:bg-blue-100 transition"
              >
                <span>Filter: {stageFilter.replace("_", " ")}</span>
                <XMarkIcon className="h-3.5 w-3.5" />
              </button>
            ) : (
              <span className="text-xs font-medium text-[#64748B]">
                {confirmedCount} of {projects.length} engagements verified for execution
              </span>
            )}
          </div>

          {/* Interactive Stages Flow */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Stage 1 */}
            <button
              type="button"
              onClick={() => setStageFilter(stageFilter === "day_one" ? "all" : "day_one")}
              className={`rounded-xl border p-3.5 text-left transition-all ${
                stageFilter === "day_one"
                  ? "border-[#2563EB] bg-blue-50/70 ring-2 ring-blue-500/20 shadow-xs"
                  : "border-blue-100 bg-blue-50/30 hover:border-blue-300 hover:bg-blue-50/60"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                  <span>1. Day 1 Discovery</span>
                </span>
                <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-extrabold text-blue-700">
                  {dayOneCount}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-blue-700">Initial client baseline intake</p>
              <div className="mt-2.5 flex items-center justify-between text-[10px] text-blue-600 font-medium">
                <span>
                  {projects.length > 0 ? `${Math.round((dayOneCount / projects.length) * 100)}%` : "0%"} share
                </span>
                <span className="underline decoration-blue-300">
                  {stageFilter === "day_one" ? "Active filter" : "Click to view"}
                </span>
              </div>
            </button>

            {/* Stage 2 */}
            <button
              type="button"
              onClick={() => setStageFilter(stageFilter === "discovery" ? "all" : "discovery")}
              className={`rounded-xl border p-3.5 text-left transition-all ${
                stageFilter === "discovery"
                  ? "border-[#7C3AED] bg-purple-50/70 ring-2 ring-purple-500/20 shadow-xs"
                  : "border-purple-100 bg-purple-50/30 hover:border-purple-300 hover:bg-purple-50/60"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                  <span>2. Deep Discovery</span>
                </span>
                <span className="rounded-md bg-purple-100 px-2 py-0.5 text-xs font-extrabold text-purple-700">
                  {deepDiscoveryCount}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-purple-700">In-depth scoping & alignment</p>
              <div className="mt-2.5 flex items-center justify-between text-[10px] text-purple-600 font-medium">
                <span>
                  {projects.length > 0 ? `${Math.round((deepDiscoveryCount / projects.length) * 100)}%` : "0%"} share
                </span>
                <span className="underline decoration-purple-300">
                  {stageFilter === "discovery" ? "Active filter" : "Click to view"}
                </span>
              </div>
            </button>

            {/* Stage 3 */}
            <button
              type="button"
              onClick={() =>
                setStageFilter(stageFilter === "requirements_confirmed" ? "all" : "requirements_confirmed")
              }
              className={`rounded-xl border p-3.5 text-left transition-all ${
                stageFilter === "requirements_confirmed"
                  ? "border-[#059669] bg-emerald-50/70 ring-2 ring-emerald-500/20 shadow-xs"
                  : "border-emerald-100 bg-emerald-50/30 hover:border-emerald-300 hover:bg-emerald-50/60"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <span>3. Requirements Confirmed</span>
                </span>
                <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-extrabold text-emerald-700">
                  {confirmedCount}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-emerald-700">Ready for sprint execution</p>
              <div className="mt-2.5 flex items-center justify-between text-[10px] text-emerald-600 font-medium">
                <span>
                  {projects.length > 0 ? `${Math.round((confirmedCount / projects.length) * 100)}%` : "0%"} share
                </span>
                <span className="underline decoration-emerald-300">
                  {stageFilter === "requirements_confirmed" ? "Active filter" : "Click to view"}
                </span>
              </div>
            </button>
          </div>
        </Card>
      )}

      {/* ── Main Two-Column Layout ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (2/3): Enterprise Projects Hub */}
        <div className="lg:col-span-2 space-y-4">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#0F172A] font-display">
                  Project Engagements
                </h2>
                <span className="rounded-full bg-[#F1F5F9] px-2 py-0.5 text-xs font-bold text-[#475569]">
                  {filteredProjects.length}
                </span>
              </div>
              <p className="text-xs text-[#64748B]">
                Stage Discovery questionnaires, scopes & delivery tracking
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* View Switcher: Grid vs List */}
              <div className="inline-flex rounded-xl border border-[#E2E8F0] bg-white p-0.5 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  title="Grid View"
                  className={`rounded-lg p-1.5 transition ${
                    viewMode === "grid"
                      ? "bg-[#EFF6FF] text-[#2563EB]"
                      : "text-[#64748B] hover:text-[#0F172A]"
                  }`}
                >
                  <Squares2X2Icon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  title="List View"
                  className={`rounded-lg p-1.5 transition ${
                    viewMode === "list"
                      ? "bg-[#EFF6FF] text-[#2563EB]"
                      : "text-[#64748B] hover:text-[#0F172A]"
                  }`}
                >
                  <Bars3BottomLeftIcon className="h-4 w-4" />
                </button>
              </div>

              <Link
                href="/projects"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:text-blue-700 transition ml-2"
              >
                <span>View portfolio</span>
                <ArrowRightIcon className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* ── Enterprise Filter & Search Control Bar ──────── */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-xs space-y-3">
            {/* Top row: Status Tabs */}
            <div className="flex items-center justify-between overflow-x-auto pb-1 scrollbar-hide">
              <Tabs
                variant="pill"
                activeTab={statusTab}
                onTabChange={setStatusTab}
                tabs={statusTabs}
              />
            </div>

            {/* Bottom row: Search, Stage, Priority, Sort */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-2 border-t border-[#F1F5F9]">
              {/* Search Bar */}
              <div className="sm:col-span-5 relative">
                <Input
                  size="sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search projects, client, stack..."
                  prefix={<MagnifyingGlassIcon className="h-3.5 w-3.5" />}
                  suffix={
                    searchQuery ? (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="text-[#94A3B8] hover:text-[#0F172A]"
                      >
                        <XMarkIcon className="h-3.5 w-3.5" />
                      </button>
                    ) : null
                  }
                />
              </div>

              {/* Stage Filter */}
              <div className="sm:col-span-3">
                <Select
                  size="sm"
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value)}
                >
                  <option value="all">All Stages</option>
                  <option value="day_one">Day 1 Discovery</option>
                  <option value="discovery">Deep Discovery</option>
                  <option value="requirements_confirmed">Requirements Confirmed</option>
                </Select>
              </div>

              {/* Priority Filter */}
              <div className="sm:col-span-2">
                <Select
                  size="sm"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  <option value="all">All Priorities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </Select>
              </div>

              {/* Sort By */}
              <div className="sm:col-span-2">
                <Select
                  size="sm"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="updated_desc">Recently Updated</option>
                  <option value="name_asc">Name (A-Z)</option>
                  <option value="priority_desc">Highest Priority</option>
                  <option value="progress_desc">Stage Progress</option>
                </Select>
              </div>
            </div>

            {/* Active Filter Chips */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#F1F5F9] text-xs">
                <span className="text-[#94A3B8] font-medium mr-1">Active filters:</span>

                {statusTab !== "all" && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-[#EFF6FF] border border-[#BFDBFE] px-2 py-0.5 text-[11px] font-semibold text-[#2563EB]">
                    Status: {statusTab.replace("_", " ")}
                    <button type="button" onClick={() => setStatusTab("all")}>
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                )}

                {stageFilter !== "all" && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-[#F5F3FF] border border-[#DDD6FE] px-2 py-0.5 text-[11px] font-semibold text-[#7C3AED]">
                    Stage: {stageFilter.replace("_", " ")}
                    <button type="button" onClick={() => setStageFilter("all")}>
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                )}

                {priorityFilter !== "all" && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-[#FFFBEB] border border-[#FDE68A] px-2 py-0.5 text-[11px] font-semibold text-[#D97706]">
                    Priority: {priorityFilter}
                    <button type="button" onClick={() => setPriorityFilter("all")}>
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                )}

                {searchQuery.trim() && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] px-2 py-0.5 text-[11px] font-semibold text-[#475569]">
                    Search: &ldquo;{searchQuery}&rdquo;
                    <button type="button" onClick={() => setSearchQuery("")}>
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-[11px] font-semibold text-[#DC2626] hover:underline ml-1"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* ── Project Results Container ─────────────────────── */}
          {projects.length === 0 ? (
            <Card variant="default" className="p-8 text-center">
              <EmptyState
                icon={<FolderIcon className="h-10 w-10 text-[#CBD5E1]" />}
                title="No projects created yet"
                description="Start orchestrating client discovery questionnaires and delivery roadmaps."
                action={
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setShowCreateModal(true)}
                    leftIcon={<PlusIcon className="h-4 w-4" />}
                  >
                    Create First Project
                  </Button>
                }
              />
            </Card>
          ) : filteredProjects.length === 0 ? (
            <Card variant="default" className="p-8 text-center">
              <EmptyState
                icon={<FunnelIcon className="h-8 w-8 text-[#94A3B8]" />}
                title="No matching projects found"
                description="No projects match your current search criteria or active filters."
                action={
                  <Button variant="secondary" size="sm" onClick={handleClearFilters}>
                    Reset All Filters
                  </Button>
                }
              />
            </Card>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paginatedProjects.map((p) => (
                <ProjectCard key={p.id || p._id} project={p} />
              ))}
            </div>
          ) : (
            <div className="space-y-2.5">
              {paginatedProjects.map((p) => (
                <DashboardProjectRow key={p.id || p._id} project={p} />
              ))}
            </div>
          )}

          {/* Pagination Bar */}
          {filteredProjects.length > pageSize && (
            <div className="flex items-center justify-between border-t border-[#E2E8F0] pt-3 text-xs text-[#64748B]">
              <span>
                Showing{" "}
                <span className="font-bold text-[#0F172A]">
                  {(currentPage - 1) * pageSize + 1}
                </span>{" "}
                to{" "}
                <span className="font-bold text-[#0F172A]">
                  {Math.min(currentPage * pageSize, filteredProjects.length)}
                </span>{" "}
                of{" "}
                <span className="font-bold text-[#0F172A]">
                  {filteredProjects.length}
                </span>{" "}
                engagements
              </span>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  leftIcon={<ChevronLeftIcon className="h-3.5 w-3.5" />}
                >
                  Previous
                </Button>

                <span className="px-2 font-medium">
                  Page {currentPage} of {totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  rightIcon={<ChevronRightIcon className="h-3.5 w-3.5" />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (1/3): Alignment Sessions & Quick Intel */}
        <div className="space-y-4">
          <DashboardUpcomingMeetings meetings={meetings} />

          {/* Quick Intelligence Drawer Trigger */}
          <Card variant="flat" className="p-4 border border-[#E2E8F0]">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]">
                <MagnifyingGlassIcon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-bold text-[#0F172A]">
                  Workspace Intelligence
                </h3>
                <p className="mt-0.5 text-[11px] text-[#64748B] leading-relaxed">
                  Search across meeting transcripts, questionnaires, and client scope notes.
                </p>
                <div className="mt-3">
                  <Button
                    variant="soft"
                    size="sm"
                    fullWidth
                    onClick={() => setSearchDrawerOpen(true)}
                    leftIcon={<MagnifyingGlassIcon className="h-3.5 w-3.5" />}
                  >
                    Open Intelligence Search
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Modals & Drawers */}
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => void loadDashboardData()}
      />

      <ProjectSearchPanel
        isOpen={searchDrawerOpen}
        onClose={() => setSearchDrawerOpen(false)}
        projectId={projects[0]?.id || projects[0]?._id}
      />
    </div>
  );
}
