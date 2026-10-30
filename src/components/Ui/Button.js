"use client";

import Link from "next/link";

/**
 * Reusable Button component with light theme variants.
 *
 * @param {"primary" | "secondary" | "outline" | "ghost" | "danger"} variant
 * @param {"sm" | "md" | "lg"} size
 * @param {string} href - If provided, renders as an anchor tag
 * @param {boolean} fullWidth - Full width on mobile/desktop
 * @param {React.ReactNode} children
 */
export default function Button({
  variant = "primary",
  size = "md",
  href,
  fullWidth = false,
  className = "",
  children,
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none";

  const variants = {
    primary:
      "bg-gray-950 text-white hover:bg-[#2563EB] hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98]",
    secondary:
      "bg-[#2563EB] text-white hover:bg-[#1d4ed8] hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98]",
    outline:
      "border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98]",
    ghost:
      "text-gray-600 hover:text-gray-950 hover:bg-gray-100 active:scale-[0.98]",
    danger:
      "bg-red-600 text-white hover:bg-red-700 hover:shadow-lg hover:shadow-red-500/25 active:scale-[0.98]",
    "outline-danger":
      "border border-red-200 bg-white text-red-600 hover:bg-red-50 hover:border-red-300 active:scale-[0.98]",
  };

  const sizes = {
    sm: "h-9 px-3.5 text-xs gap-1.5",
    md: "h-10 px-5 text-sm gap-2",
    lg: "h-12 px-7 text-sm gap-2.5",
  };

  const widthClass = fullWidth ? "w-full sm:w-auto" : "";

  const combinedClassName =
    `${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${widthClass} ${className}`.trim();

  if (href) {
    if (href.startsWith("#") || href.startsWith("http")) {
      return (
        <a href={href} className={combinedClassName} {...props}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={combinedClassName} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button className={combinedClassName} {...props}>
      {children}
    </button>
  );
}
