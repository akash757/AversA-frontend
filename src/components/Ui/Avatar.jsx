"use client";

/**
 * Avatar — AversA Design System
 *
 * Initials fallback, multiple sizes, optional ring, online indicator.
 *
 * @param {string} src       - Image URL
 * @param {string} name      - Full name (used for initials & alt)
 * @param {string} initials  - Override initials
 * @param {"xs"|"sm"|"md"|"lg"|"xl"} size
 * @param {boolean} ring     - Show ring border
 * @param {boolean} online   - Show green online indicator dot
 * @param {string}  color    - Override gradient (CSS classes)
 */
export default function Avatar({
  src,
  name = "",
  initials: initialsOverride,
  size = "md",
  ring = false,
  online = false,
  color,
  className = "",
  ...props
}) {
  const getInitials = (n) => {
    const parts = n.trim().split(/\s+/);
    if (parts.length === 1) return parts[0]?.[0]?.toUpperCase() ?? "?";
    return (
      (parts[0]?.[0] ?? "").toUpperCase() +
      (parts[parts.length - 1]?.[0] ?? "").toUpperCase()
    );
  };

  const initials = initialsOverride || getInitials(name);

  const sizes = {
    xs: { container: "h-6 w-6",   text: "text-[9px]",  dot: "h-1.5 w-1.5 -bottom-0 -right-0" },
    sm: { container: "h-8 w-8",   text: "text-[11px]", dot: "h-2 w-2 -bottom-0 -right-0" },
    md: { container: "h-9 w-9",   text: "text-xs",     dot: "h-2.5 w-2.5 bottom-0 right-0" },
    lg: { container: "h-11 w-11", text: "text-sm",     dot: "h-3 w-3 bottom-0 right-0" },
    xl: { container: "h-14 w-14", text: "text-base",   dot: "h-3.5 w-3.5 bottom-0.5 right-0.5" },
  };

  const s = sizes[size] ?? sizes.md;

  const ringClass = ring
    ? "ring-2 ring-white ring-offset-1"
    : "";

  const gradientClass = color || "bg-gradient-to-tr from-[#2563EB] to-[#7C3AED]";

  return (
    <div className={["relative inline-flex shrink-0", s.container, className].join(" ")} {...props}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name || "Avatar"}
          referrerPolicy="no-referrer"
          className={[
            "h-full w-full rounded-full object-cover",
            ringClass,
          ].join(" ")}
        />
      ) : (
        <div
          className={[
            "flex h-full w-full items-center justify-center rounded-full font-bold text-white select-none",
            gradientClass,
            ringClass,
          ].join(" ")}
          aria-label={name || initials}
        >
          <span className={s.text}>{initials}</span>
        </div>
      )}

      {online && (
        <span
          className={[
            "absolute block rounded-full bg-[#059669] ring-2 ring-white",
            s.dot,
          ].join(" ")}
          aria-label="Online"
        />
      )}
    </div>
  );
}

