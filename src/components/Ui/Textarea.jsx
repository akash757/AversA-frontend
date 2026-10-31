"use client";

import { forwardRef, useEffect, useRef } from "react";

/**
 * Textarea — AversA Design System
 *
 * Auto-resize textarea with optional character count.
 *
 * @param {"sm"|"md"|"lg"} size
 * @param {string}         error
 * @param {number}         maxLength   - enables character counter
 * @param {boolean}        autoResize  - grow with content (default: true)
 */
const Textarea = forwardRef(function Textarea(
  {
    size = "md",
    error,
    maxLength,
    autoResize = true,
    className = "",
    onChange,
    value,
    ...props
  },
  ref
) {
  const innerRef = useRef(null);
  const resolvedRef = ref || innerRef;

  // Auto-resize
  useEffect(() => {
    if (!autoResize) return;
    const el = resolvedRef?.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value, autoResize, resolvedRef]);

  const sizes = {
    sm: "text-xs  px-3   py-2",
    md: "text-sm  px-3.5 py-2.5",
    lg: "text-sm  px-4   py-3",
  };

  const errorClass = error
    ? "border-[#DC2626] focus:border-[#DC2626] focus:shadow-[0_0_0_3px_#FFF1F2]"
    : "border-[#E2E8F0] hover:border-[#CBD5E1] focus:border-[#2563EB] focus:shadow-[0_0_0_3px_#EFF6FF]";

  const currentLen = typeof value === "string" ? value.length : 0;

  return (
    <div className="w-full">
      <textarea
        ref={resolvedRef}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        className={[
          "input-base block w-full rounded-[10px] resize-none transition-all duration-150",
          "bg-white text-[#0F172A] placeholder:text-[#CBD5E1]",
          "disabled:bg-[#F8FAFC] disabled:text-[#94A3B8] disabled:cursor-not-allowed",
          sizes[size] ?? sizes.md,
          errorClass,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        aria-invalid={!!error}
        {...props}
      />

      {maxLength && (
        <p className={`mt-1 text-right text-[11px] ${
          currentLen >= maxLength ? "text-[#DC2626]" : "text-[#94A3B8]"
        }`}>
          {currentLen}/{maxLength}
        </p>
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

export default Textarea;

