"use client";

/**
 * FormField — AversA Design System
 *
 * Label + input + error/hint unified wrapper.
 * Wrap any <Input>, <Select>, <Textarea>, etc.
 *
 * @param {string}  label    - Field label
 * @param {string}  htmlFor  - id of the input (for label[for])
 * @param {boolean} required - Appends asterisk to label
 * @param {string}  error    - Error message shown below
 * @param {string}  hint     - Helper text (hidden when error shown)
 */
export default function FormField({
  label,
  htmlFor,
  required = false,
  error,
  hint,
  className = "",
  children,
}) {
  return (
    <div className={["space-y-1.5", className].join(" ")}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="block text-sm font-semibold text-[#0F172A]"
        >
          {label}
          {required && (
            <span className="ml-1 text-[#DC2626]" aria-hidden="true">*</span>
          )}
        </label>
      )}

      {children}

      {hint && !error && (
        <p className="text-xs text-[#94A3B8]">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-[#DC2626] flex items-center gap-1">
          <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1.333A6.667 6.667 0 1 0 8 14.667 6.667 6.667 0 0 0 8 1.333zm.667 10H7.333v-1.334h1.334v1.334zm0-2.666H7.333V5.333h1.334v3.334z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

