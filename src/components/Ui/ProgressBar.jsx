"use client";

/**
 * ProgressBar — AversA Design System
 *
 * @param {number} value   - 0 to 100
 * @param {"brand"|"success"|"warning"|"error"|"violet"} color
 * @param {"sm"|"md"|"lg"} size
 * @param {boolean} showLabel  - Show percentage label
 * @param {string}  label      - Override label text
 * @param {boolean} animated   - Animate fill on mount
 */
export default function ProgressBar({
  value = 0,
  color = "brand",
  size = "md",
  showLabel = false,
  label,
  animated = true,
  className = "",
}) {
  const clamped = Math.min(100, Math.max(0, value));

  const trackColors = {
    brand:   "bg-[#EFF6FF]",
    success: "bg-[#ECFDF5]",
    warning: "bg-[#FFFBEB]",
    error:   "bg-[#FFF1F2]",
    violet:  "bg-[#F5F3FF]",
    neutral: "bg-[#F1F5F9]",
  };

  const fillColors = {
    brand:   "bg-gradient-to-r from-[#2563EB] to-[#7C3AED]",
    success: "bg-[#059669]",
    warning: "bg-[#D97706]",
    error:   "bg-[#DC2626]",
    violet:  "bg-gradient-to-r from-[#7C3AED] to-[#0891B2]",
    neutral: "bg-[#94A3B8]",
  };

  const heights = {
    sm: "h-1",
    md: "h-2",
    lg: "h-2.5",
  };

  return (
    <div className={className}>
      {(showLabel || label) && (
        <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-[#475569]">
          {label && <span>{label}</span>}
          {showLabel && (
            <span className="text-[#94A3B8] tabular-nums">{clamped}%</span>
          )}
        </div>
      )}

      <div
        className={[
          "w-full overflow-hidden rounded-full",
          trackColors[color] ?? trackColors.brand,
          heights[size] ?? heights.md,
        ].join(" ")}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={[
            "h-full rounded-full",
            fillColors[color] ?? fillColors.brand,
            animated ? "transition-all duration-700 ease-out" : "",
          ].join(" ")}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

