"use client";

/**
 * Skeleton — AversA Design System
 *
 * Loading placeholder shapes.
 *
 * @param {"line"|"block"|"avatar"|"card"|"badge"} variant
 * @param {string} width    - CSS width (default: "100%")
 * @param {string} height   - CSS height
 * @param {"sm"|"md"|"lg"|"full"} rounded
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

