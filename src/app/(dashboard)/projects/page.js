"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProjectCard from "@/components/dashboard/ProjectCard";
import CreateProjectModal from "@/components/project/CreateProjectModal";
import { useToast } from "@/components/Ui/Toast";
import Skeleton from "@/components/Ui/Skeleton";
import PageHeader from "@/components/Ui/PageHeader";
import Button from "@/components/Ui/Button";
import EmptyState from "@/components/Ui/EmptyState";
import { getProjects } from "@/features/project/project";
import {
  FolderIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";

function ProjectsContent() {
  const toast = useToast();
  const searchParams = useSearchParams();

  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");

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
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <PageHeader
        title="Projects Portfolio"
        description="Manage your client engagements, stage discovery questionnaires, and alignment meetings."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Projects" },
        ]}
        actions={
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
            leftIcon={<PlusIcon className="h-4 w-4" />}
          >
            Create Project
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by name, client, or scope..."
            className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] pl-9 pr-8 py-2 text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:bg-white focus:border-[#2563EB] focus:outline-none transition shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <FunnelIcon className="h-4 w-4 text-[#94A3B8] hidden sm:block" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-xs font-semibold text-[#0F172A] focus:border-[#2563EB] focus:outline-none shadow-2xs"
          >
            <option value="all">All Statuses</option>
            <option value="planning">Planning</option>
            <option value="in_progress">In Progress</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-xs font-semibold text-[#0F172A] focus:border-[#2563EB] focus:outline-none shadow-2xs"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Grid of Projects */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton.ProjectCard key={i} />
          ))}
        </div>
      ) : loadError ? (
        <EmptyState
          icon={<FolderIcon className="h-8 w-8 text-rose-500" />}
          title="Failed to load projects"
          description={loadError}
          action={
            <Button variant="secondary" onClick={loadProjects}>
              Try Again
            </Button>
          }
        />
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          icon={<FolderIcon className="h-8 w-8 text-[#94A3B8]" />}
          title="No projects found"
          description={
            searchQuery || selectedStatus !== "all" || selectedPriority !== "all"
              ? "No projects match your active search filters."
              : "Get started by creating your first client discovery workspace."
          }
          action={
            <Button
              variant="primary"
              onClick={() => {
                if (searchQuery || selectedStatus !== "all" || selectedPriority !== "all") {
                  setSearchQuery("");
                  setSelectedStatus("all");
                  setSelectedPriority("all");
                } else {
                  setShowCreateModal(true);
                }
              }}
            >
              {searchQuery || selectedStatus !== "all" || selectedPriority !== "all"
                ? "Reset Filters"
                : "Create Project"}
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id || project._id} project={project} />
          ))}
        </div>
      )}

      {/* Create Project Modal */}
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
    <Suspense
      fallback={
        <div className="space-y-6 animate-fade-in" aria-hidden="true">
          <Skeleton variant="block" height="5rem" rounded="xl" />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton.ProjectCard key={i} />
            ))}
          </div>
        </div>
      }
    >
      <ProjectsContent />
    </Suspense>
  );
}
