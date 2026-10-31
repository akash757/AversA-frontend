"use client";

/**
 * Badge — AversA Design System
 *
 * @param {"brand"|"violet"|"success"|"warning"|"error"|"info"|"neutral"|"outline"} variant
 * @param {"sm"|"md"} size
 * @param {boolean}   dot   - Show a status dot before content
 * @param {React.ReactNode} icon - Icon before label
 */
export default function Badge({
  variant = "neutral",
  size = "sm",
  dot = false,
  icon,
  className = "",
  children,
  ...props
}) {
  const variants = {
    brand:
      "bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]",
    violet:
      "bg-[#F5F3FF] text-[#7C3AED] border border-[#DDD6FE]",
    success:
      "bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]",
    warning:
      "bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]",
    error:
      "bg-[#FFF1F2] text-[#DC2626] border border-[#FECACA]",
    info:
      "bg-[#F0F9FF] text-[#0284C7] border border-[#BAE6FD]",
    neutral:
      "bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0]",
    dark:
      "bg-[#1E293B] text-white border border-[#334155]",
    outline:
      "bg-transparent text-[#475569] border border-[#E2E8F0]",
  };

  const dotColors = {
    brand:   "bg-[#2563EB]",
    violet:  "bg-[#7C3AED]",
    success: "bg-[#059669]",
    warning: "bg-[#D97706]",
    error:   "bg-[#DC2626]",
    info:    "bg-[#0284C7]",
    neutral: "bg-[#94A3B8]",
    dark:    "bg-white",
    outline: "bg-[#94A3B8]",
  };

  const sizes = {
    sm: "badge-base text-[10px] px-2 py-0.5 gap-1 rounded-full",
    md: "badge-base text-xs    px-2.5 py-1 gap-1.5 rounded-full",
  };

  return (
    <span
      className={[
        sizes[size] ?? sizes.sm,
        variants[variant] ?? variants.neutral,
        "font-semibold",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotColors[variant] ?? dotColors.neutral}`}
          aria-hidden="true"
        />
      )}
      {icon && <span className="shrink-0" aria-hidden="true">{icon}</span>}
      {children}
    </span>
  );
}

