"use client";

/**
 * Skeleton — AversA Design System
 *
 * Loading placeholder shapes with responsive shimmer animations.
 *
 * @param {"line"|"block"|"avatar"|"card"|"badge"|"button"} variant
 * @param {string} width    - CSS width (default: "100%")
 * @param {string} height   - CSS height
 * @param {"sm"|"md"|"lg"|"xl"|"full"} rounded
 */
export default function Skeleton({
  variant = "line",
  width,
  height,
  rounded,
  className = "",
  ...props
}) {
  const base =
    "bg-gradient-to-r from-[#F1F5F9] via-[#E2E8F0] to-[#F1F5F9] bg-[length:200%_100%] animate-shimmer";

  const presets = {
    line:   { height: height || "0.875rem", rounded: rounded || "md" },
    block:  { height: height || "6rem",     rounded: rounded || "lg" },
    avatar: { height: height || "2.25rem",  rounded: rounded || "full" },
    card:   { height: height || "9rem",     rounded: rounded || "xl" },
    badge:  { height: height || "1.375rem", rounded: rounded || "full" },
    button: { height: height || "2.5rem",   rounded: rounded || "xl" },
  };

  const p = presets[variant] ?? presets.line;

  const roundedMap = {
    sm:   "rounded-[6px]",
    md:   "rounded-[10px]",
    lg:   "rounded-[14px]",
    xl:   "rounded-[18px]",
    full: "rounded-full",
  };

  const w = variant === "avatar" || variant === "badge"
    ? (width || p.height)
    : (width || "100%");

  return (
    <div
      className={[
        base,
        roundedMap[p.rounded] ?? roundedMap.md,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ width: w, height: p.height, flexShrink: 0 }}
      aria-hidden="true"
      {...props}
    />
  );
}

/**
 * Skeleton.Group — stacked line skeletons for text blocks
 */
Skeleton.Group = function SkeletonGroup({ lines = 3, className = "" }) {
  const widths = ["100%", "85%", "70%", "90%", "60%"];
  return (
    <div className={["space-y-2", className].join(" ")} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} variant="line" width={widths[i % widths.length]} />
      ))}
    </div>
  );
};

/**
 * Skeleton.StatCard — KPI stat card skeleton matching dashboard metrics
 */
Skeleton.StatCard = function SkeletonStatCard({ className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs ${className}`}
      aria-hidden="true"
    >
      <div className="flex items-center justify-between">
        <Skeleton variant="block" width="2.75rem" height="2.75rem" rounded="lg" />
        <Skeleton variant="badge" width="4.5rem" height="1.25rem" />
      </div>
      <div className="mt-4 space-y-1.5">
        <Skeleton variant="line" width="45%" height="0.75rem" />
        <Skeleton variant="block" width="30%" height="2rem" rounded="md" />
      </div>
    </div>
  );
};

/**
 * Skeleton.ProjectCard — Project card skeleton matching ProjectCard.jsx
 */
Skeleton.ProjectCard = function SkeletonProjectCard({ className = "" }) {
  return (
    <div
      className={`flex flex-col justify-between rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs ${className}`}
      aria-hidden="true"
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-1.5">
            <Skeleton variant="badge" width="5rem" height="1.25rem" />
            <Skeleton variant="badge" width="3.5rem" height="1.25rem" />
          </div>
          <Skeleton variant="block" width="2rem" height="2rem" rounded="lg" />
        </div>
        <div className="mb-3 space-y-1.5">
          <div className="flex justify-between items-center">
            <Skeleton variant="line" width="35%" height="0.75rem" />
            <Skeleton variant="line" width="15%" height="0.75rem" />
          </div>
          <Skeleton variant="line" width="100%" height="0.375rem" rounded="full" />
        </div>
        <Skeleton variant="line" width="65%" height="1.125rem" className="mb-2" />
        <Skeleton variant="line" width="25%" height="0.875rem" className="mb-3" />
        <div className="space-y-1.5">
          <Skeleton variant="line" width="100%" height="0.75rem" />
          <Skeleton variant="line" width="80%" height="0.75rem" />
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex items-center justify-between">
        <div className="flex gap-1.5">
          <Skeleton variant="badge" width="3rem" height="1rem" rounded="sm" />
          <Skeleton variant="badge" width="3rem" height="1rem" rounded="sm" />
        </div>
        <Skeleton variant="line" width="4rem" height="0.75rem" />
      </div>
    </div>
  );
};

/**
 * Skeleton.MeetingCard — Meeting card skeleton matching MeetingCard.js
 */
Skeleton.MeetingCard = function SkeletonMeetingCard({ className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs ${className}`}
      aria-hidden="true"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-3 md:flex-col md:items-start shrink-0 md:pr-4 md:border-r border-[#F1F5F9]">
          <Skeleton variant="line" width="2.5rem" height="0.625rem" />
          <Skeleton variant="line" width="3.5rem" height="1.125rem" />
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton variant="line" width="50%" height="1.25rem" />
            <Skeleton variant="badge" width="4.5rem" height="1.25rem" />
          </div>
          <Skeleton variant="line" width="70%" height="0.75rem" />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Skeleton variant="block" width="5.5rem" height="2rem" rounded="md" />
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton.Table — Generic table skeleton with headers and rows
 */
Skeleton.Table = function SkeletonTable({ rows = 5, columns = 4, className = "" }) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-xs ${className}`}
      aria-hidden="true"
    >
      <div className="flex items-center justify-between border-b border-[#E2E8F0] bg-[#F8FAFC] px-6 py-3.5">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} variant="line" width={i === 0 ? "25%" : "15%"} height="0.75rem" />
        ))}
      </div>
      <div className="divide-y divide-[#F1F5F9]">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3 w-1/4">
              <Skeleton variant="avatar" width="2rem" height="2rem" />
              <div className="space-y-1 w-3/4">
                <Skeleton variant="line" width="70%" height="0.75rem" />
                <Skeleton variant="line" width="50%" height="0.625rem" />
              </div>
            </div>
            {Array.from({ length: columns - 1 }).map((_, c) => (
              <Skeleton key={c} variant="line" width="15%" height="0.75rem" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Skeleton.ProjectDetail — Complete project workspace skeleton
 */
Skeleton.ProjectDetail = function SkeletonProjectDetail({ className = "" }) {
  return (
    <div className={`space-y-6 ${className}`} aria-hidden="true">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton variant="line" width="4rem" height="0.75rem" />
        <span className="text-gray-300">/</span>
        <Skeleton variant="line" width="8rem" height="0.75rem" />
      </div>

      {/* Project Header skeleton */}
      <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <Skeleton variant="badge" width="6rem" height="1.375rem" />
              <Skeleton variant="badge" width="4.5rem" height="1.375rem" />
              <Skeleton variant="badge" width="5rem" height="1.375rem" />
            </div>
            <Skeleton variant="line" width="45%" height="2rem" />
            <Skeleton variant="line" width="70%" height="0.875rem" />
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <Skeleton variant="block" width="7rem" height="2.5rem" rounded="xl" />
            <Skeleton variant="block" width="2.5rem" height="2.5rem" rounded="xl" />
          </div>
        </div>

        {/* Stage Stepper skeleton */}
        <div className="pt-4 border-t border-[#F1F5F9]">
          <div className="flex items-center justify-between mb-2">
            <Skeleton variant="line" width="7rem" height="0.75rem" />
            <Skeleton variant="line" width="2.5rem" height="0.75rem" />
          </div>
          <Skeleton variant="line" width="100%" height="0.5rem" rounded="full" />
        </div>
      </div>

      {/* Tab bar skeleton */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2 overflow-x-auto">
        <Skeleton variant="block" width="9rem" height="2.25rem" rounded="xl" />
        <Skeleton variant="block" width="9rem" height="2.25rem" rounded="xl" />
        <Skeleton variant="block" width="7rem" height="2.25rem" rounded="xl" />
        <Skeleton variant="block" width="7rem" height="2.25rem" rounded="xl" />
      </div>

      {/* Content skeleton: Accordion / Cards */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton variant="block" width="1.75rem" height="1.75rem" rounded="md" />
                <Skeleton variant="line" width="12rem" height="1rem" />
              </div>
              <Skeleton variant="badge" width="4rem" height="1.25rem" />
            </div>
            <Skeleton variant="line" width="80%" height="0.75rem" />
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Skeleton.Dashboard — Dashboard page skeleton
 */
Skeleton.Dashboard = function SkeletonDashboard({ className = "" }) {
  return (
    <div className={`space-y-7 animate-fade-in ${className}`} aria-hidden="true">
      {/* Welcome banner */}
      <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl space-y-3">
            <Skeleton variant="badge" width="9rem" height="1.25rem" />
            <Skeleton variant="line" width="16rem" height="2rem" />
            <Skeleton variant="line" width="24rem" height="0.875rem" />
          </div>
          <div className="flex gap-2.5">
            <Skeleton variant="block" width="7.5rem" height="2.5rem" rounded="xl" />
            <Skeleton variant="block" width="7.5rem" height="2.5rem" rounded="xl" />
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Skeleton.StatCard />
        <Skeleton.StatCard />
        <Skeleton.StatCard />
        <Skeleton.StatCard />
      </div>

      {/* Discovery Funnel */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs space-y-3">
        <div className="flex justify-between items-center">
          <Skeleton variant="line" width="10rem" height="0.875rem" />
          <Skeleton variant="line" width="14rem" height="0.75rem" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <Skeleton variant="block" height="4rem" rounded="xl" />
          <Skeleton variant="block" height="4rem" rounded="xl" />
          <Skeleton variant="block" height="4rem" rounded="xl" />
        </div>
      </div>

      {/* 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton variant="line" width="8rem" height="1.25rem" />
            <Skeleton variant="line" width="4rem" height="0.875rem" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton.ProjectCard />
            <Skeleton.ProjectCard />
            <Skeleton.ProjectCard />
            <Skeleton.ProjectCard />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton variant="line" width="8rem" height="1.25rem" />
            <Skeleton variant="line" width="4rem" height="0.875rem" />
          </div>
          <div className="space-y-3">
            <Skeleton.MeetingCard />
            <Skeleton.MeetingCard />
            <Skeleton.MeetingCard />
          </div>
        </div>
      </div>
    </div>
  );
};
