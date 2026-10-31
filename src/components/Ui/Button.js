"use client";

import Link from "next/link";

/**
 * Universal Button — AversA Design System
 *
 * @param {"primary"|"secondary"|"soft"|"outline"|"ghost"|"danger"|"outline-danger"} variant
 * @param {"sm"|"md"|"lg"|"xl"|"icon-sm"|"icon-md"|"icon-lg"} size
 * @param {string}  href        - Renders as <a> or <Link>
 * @param {boolean} loading     - Shows spinner, disables interaction
 * @param {boolean} fullWidth   - Full width on mobile (sm:w-auto on larger)
 * @param {React.ReactNode} leftIcon  - Icon before children
 * @param {React.ReactNode} rightIcon - Icon after children
 */
export default function Button({
  variant = "primary",
  size = "md",
  href,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = "",
  children,
  disabled,
  ...props
}) {
  const isDisabled = disabled || loading;

  const base =
    "btn-base select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand";

  const variants = {
    primary:
      "bg-[#0F172A] text-white hover:bg-[#2563EB] shadow-sm hover:shadow-brand active:scale-[0.97]",
    secondary:
      "bg-[#2563EB] text-white hover:bg-[#1D4ED8] shadow-sm shadow-blue-500/20 hover:shadow-brand active:scale-[0.97]",
    soft:
      "bg-[#EFF6FF] text-[#2563EB] hover:bg-[#DBEAFE] active:scale-[0.97]",
    violet:
      "bg-[#7C3AED] text-white hover:bg-[#6D28D9] shadow-sm shadow-violet-500/20 hover:shadow-violet active:scale-[0.97]",
    outline:
      "border border-[#E2E8F0] bg-white text-[#0F172A] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] active:scale-[0.97]",
    ghost:
      "text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9] active:scale-[0.97]",
    danger:
      "bg-[#DC2626] text-white hover:bg-[#B91C1C] shadow-sm shadow-red-500/20 active:scale-[0.97]",
    "outline-danger":
      "border border-[#FCA5A5] bg-white text-[#DC2626] hover:bg-[#FFF1F2] hover:border-[#F87171] active:scale-[0.97]",
  };

  const sizes = {
    sm:       "h-8  px-3   text-xs  gap-1.5  rounded-[10px]",
    md:       "h-10 px-4   text-sm  gap-2    rounded-[12px]",
    lg:       "h-11 px-5   text-sm  gap-2    rounded-[14px]",
    xl:       "h-13 px-7   text-base gap-2.5 rounded-[16px]",
    "icon-sm": "h-8  w-8  text-xs  rounded-[10px] p-0",
    "icon-md": "h-10 w-10 text-sm  rounded-[12px] p-0",
    "icon-lg": "h-11 w-11 text-sm  rounded-[14px] p-0",
  };

  const widthClass = fullWidth ? "w-full sm:w-auto" : "";
  const disabledClass = isDisabled ? "opacity-50 cursor-not-allowed pointer-events-none" : "";

  const cls = [
    base,
    variants[variant] ?? variants.primary,
    sizes[size] ?? sizes.md,
    widthClass,
    disabledClass,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {loading ? (
        <svg
          className="h-4 w-4 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12" cy="12" r="10"
            stroke="currentColor" strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : leftIcon ? (
        <span className="shrink-0" aria-hidden="true">{leftIcon}</span>
      ) : null}

      {children && <span>{children}</span>}

      {!loading && rightIcon ? (
        <span className="shrink-0" aria-hidden="true">{rightIcon}</span>
      ) : null}
    </>
  );

  if (href) {
    if (href.startsWith("#") || href.startsWith("http") || href.startsWith("mailto")) {
      return (
        <a href={href} className={cls} {...props}>
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className={cls} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button className={cls} disabled={isDisabled} {...props}>
      {content}
    </button>
  );
}
