"use client";

import { forwardRef } from "react";

/**
 * Input — AversA Design System
 *
 * Styled text input with prefix/suffix icon slots, error state, size variants.
 *
 * @param {"sm"|"md"|"lg"} size
 * @param {React.ReactNode} prefix   - Icon/element before the text
 * @param {React.ReactNode} suffix   - Icon/element after the text
 * @param {string}          error    - Error message (also triggers error styling)
 * @param {string}          hint     - Helper text below the input
 */
const Input = forwardRef(function Input(
  {
    size = "md",
    prefix,
    suffix,
    error,
    hint,
    className = "",
    ...props
  },
  ref
) {
  const sizes = {
    sm: "h-8  text-xs  px-3",
    md: "h-10 text-sm  px-3.5",
    lg: "h-11 text-sm  px-4",
  };

  const paddingLeft  = prefix  ? (size === "sm" ? "pl-8"  : "pl-9")  : "";
  const paddingRight = suffix  ? (size === "sm" ? "pr-8"  : "pr-9")  : "";

  const errorClass = error
    ? "border-[#DC2626] focus:border-[#DC2626] focus:shadow-[0_0_0_3px_#FFF1F2]"
    : "border-[#E2E8F0] hover:border-[#CBD5E1] focus:border-[#2563EB] focus:shadow-[0_0_0_3px_#EFF6FF]";

  return (
    <div className="w-full">
      <div className="relative">
        {prefix && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#94A3B8]">
            {prefix}
          </div>
        )}

        <input
          ref={ref}
          className={[
            "input-base block w-full rounded-[10px] transition-all duration-150",
            "bg-white text-[#0F172A] placeholder:text-[#CBD5E1]",
            "disabled:bg-[#F8FAFC] disabled:text-[#94A3B8] disabled:cursor-not-allowed",
            sizes[size] ?? sizes.md,
            paddingLeft,
            paddingRight,
            errorClass,
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          aria-invalid={!!error}
          {...props}
        />

        {suffix && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#94A3B8]">
            {suffix}
          </div>
        )}
      </div>

      {hint && !error && (
        <p className="mt-1.5 text-xs text-[#94A3B8]">{hint}</p>
      )}
      {error && (
        <p className="mt-1.5 text-xs text-[#DC2626] flex items-center gap-1">
          <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1.333A6.667 6.667 0 1 0 8 14.667 6.667 6.667 0 0 0 8 1.333zm.667 10H7.333v-1.334h1.334v1.334zm0-2.666H7.333V5.333h1.334v3.334z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
});

export default Input;

