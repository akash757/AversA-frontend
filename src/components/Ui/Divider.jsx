"use client";

/**
 * Divider — AversA Design System
 *
 * @param {"horizontal"|"vertical"} orientation
 * @param {string} label - Optional centered label
 */
export default function Divider({
  orientation = "horizontal",
  label,
  className = "",
}) {
  if (orientation === "vertical") {
    return (
      <div
        className={["w-px self-stretch bg-[#E2E8F0]", className].join(" ")}
        role="separator"
        aria-orientation="vertical"
      />
    );
  }

  if (label) {
    return (
      <div
        className={["flex items-center gap-3", className].join(" ")}
        role="separator"
      >
        <div className="h-px flex-1 bg-[#E2E8F0]" />
        <span className="shrink-0 text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
          {label}
        </span>
        <div className="h-px flex-1 bg-[#E2E8F0]" />
      </div>
    );
  }

  return (
    <hr
      className={["border-0 border-t border-[#E2E8F0]", className].join(" ")}
      role="separator"
    />
  );
}

