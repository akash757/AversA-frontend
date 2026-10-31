"use client";

import { forwardRef } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

/**
 * Select — AversA Design System
 *
 * Styled native <select> with chevron icon.
 *
 * @param {"sm"|"md"|"lg"} size
 * @param {string}         error
 */
const Select = forwardRef(function Select(
  { size = "md", error, className = "", children, ...props },
  ref
) {
  const sizes = {
    sm: "h-8  text-xs  pl-3   pr-8",
    md: "h-10 text-sm  pl-3.5 pr-9",
    lg: "h-11 text-sm  pl-4   pr-10",
  };

  const errorClass = error
    ? "border-[#DC2626] focus:border-[#DC2626] focus:shadow-[0_0_0_3px_#FFF1F2]"
    : "border-[#E2E8F0] hover:border-[#CBD5E1] focus:border-[#2563EB] focus:shadow-[0_0_0_3px_#EFF6FF]";

  return (
    <div className="relative w-full">
      <select
        ref={ref}
        className={[
          "input-base block w-full rounded-[10px] appearance-none",
          "bg-white text-[#0F172A] cursor-pointer",
          "disabled:bg-[#F8FAFC] disabled:text-[#94A3B8] disabled:cursor-not-allowed",
          sizes[size] ?? sizes.md,
          errorClass,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        aria-invalid={!!error}
        {...props}
      >
        {children}
      </select>

      <ChevronDownIcon
        className={[
          "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8]",
          size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4",
        ].join(" ")}
      />
    </div>
  );
});

export default Select;

