"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProjectCard from "@/components/dashboard/ProjectCard";
import CreateProjectModal from "@/components/project/CreateProjectModal";
import { useToast } from "@/components/Ui/Toast";
import Loader from "@/components/Ui/Loader";
import { getProjects } from "@/features/project/project";
import {
  FolderIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";

function ProjectsContent() {
  const toast = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");

  // Check if opened with ?create=1 or ?new=1
  useEffect(() => {
    if (searchParams.get("create") === "true" || searchParams.get("new") === "true") {
      setShowCreateModal(true);
    }
  }, [searchParams]);

  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await getProjects();
      if (!res?.success) {
        setLoadError(res?.message || "Failed to load projects from server.");
        toast.error(res?.message || "Failed to load projects.");
        return;
      }
      setProjects(res.data?.projects || []);
      setLoadError(null);
    } catch (err) {
      const msg = err?.message || "Internal server error occurred while retrieving projects.";
      setLoadError(msg);
      toast.error("Failed to load projects.");
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  // Filter projects by search query, status, priority
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.clientName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatus === "all" || project.status === selectedStatus;
    const matchesPriority =
      selectedPriority === "all" || project.priority === selectedPriority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50/70 px-2.5 py-0.5 text-[11px] font-bold text-[#2563EB] mb-1.5">
            <SparklesIcon className="h-3 w-3" />
            <span>Discovery & Scope Suite</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900">
            Projects Portfolio
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage your client engagements, stage discovery questionnaires, and alignment meetings.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-gray-950 px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-[#2563EB] transition active:scale-95 self-start sm:self-auto cursor-pointer"
        >
          <PlusIcon className="h-4 w-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-3.5 shadow-2xs">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by name, client, or tech keyword…"
            className="w-full rounded-xl border border-gray-200 bg-gray-50/70 py-2 pl-9 pr-4 text-xs text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-gray-500">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-800 focus:outline-none focus:border-[#2563EB]"
            >
              <option value="all">All Statuses</option>
              <option value="planning">Planning</option>
              <option value="in_progress">In Progress</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-gray-500">Priority:</span>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-800 focus:outline-none focus:border-[#2563EB]"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Server Error Alert Banner */}
      {loadError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-900 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-rose-900">Server Notice: Unable to load projects</h4>
            <p className="mt-1 text-xs text-rose-700">{loadError}</p>
          </div>
          <button
            type="button"
            onClick={() => void loadProjects()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 transition"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Projects Grid */}
      {isLoading && projects.length === 0 ? (
        <Loader />
      ) : filteredProjects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center shadow-2xs">
          <FolderIcon className="mx-auto h-12 w-12 text-gray-300 stroke-1" />
          <h3 className="mt-3 text-sm font-bold text-gray-900">No projects found</h3>
          <p className="mt-1 text-xs text-gray-500 max-w-sm mx-auto">
            {searchQuery || selectedStatus !== "all" || selectedPriority !== "all"
              ? "No projects match your active search filters."
              : "Kick off your first client engagement with AversA Discovery."}
          </p>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#1d4ed8] transition"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Create New Project</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id || project._id} project={project} />
          ))}
        </div>
      )}

      {/* Redesigned 2-Step Create Project Modal */}
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => void loadProjects()}
      />
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={<Loader />}>
      <ProjectsContent />
    </Suspense>
  );
}
