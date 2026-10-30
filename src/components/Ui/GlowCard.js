"use client";

/**
 * Premium light card with animated glowing border effect on hover.
 *
 * @param {React.ReactNode} children
 * @param {string} className - Additional classes
 * @param {string} glowColor - CSS color for the glow
 * @param {boolean} active - Force the glow state on
 */
export default function GlowCard({
  children,
  className = "",
  glowColor = "rgba(37, 99, 235, 0.4)",
  active = false,
  ...props
}) {
  return (
    <div
      className={`glow-card-wrapper group relative ${active ? "is-active" : ""} ${className}`}
      {...props}
    >
      {/* Animated gradient border glow */}
      <div
        className="glow-border pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ "--glow-color": glowColor }}
      />

      {/* Inner card content */}
      <div className="glow-card-inner relative h-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 group-hover:border-transparent group-hover:shadow-xl sm:p-8">
        {children}
      </div>
    </div>
  );
}
