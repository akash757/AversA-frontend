"use client";

/**
 * EmptyState — AversA Design System
 *
 * @param {React.ReactNode} icon     - Icon component
 * @param {string}          title
 * @param {string}          description
 * @param {React.ReactNode} action   - CTA button/link
 */
export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}) {
  return (
    <div
      className={[
        "flex flex-col items-center justify-center text-center py-16 px-6",
        className,
      ].join(" ")}
    >
      {icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F1F5F9] text-[#94A3B8]">
          {icon}
        </div>
      )}
      {title && (
        <h3 className="text-sm font-bold text-[#0F172A] font-display">{title}</h3>
      )}
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-[#94A3B8] leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

