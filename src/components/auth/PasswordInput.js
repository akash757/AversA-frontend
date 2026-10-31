"use client";

import { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import FormField from "@/components/Ui/FormField";

export default function PasswordInput({
  label = "Password",
  id,
  error,
  className = "",
  showStrength = false,
  value = "",
  required,
  ...props
}) {
  const [show, setShow] = useState(false);
  const inputId = id || props.name || "password";

  const strength = getStrength(value);

  const errorClass = error
    ? "border-[#DC2626] focus:border-[#DC2626] focus:shadow-[0_0_0_3px_#FFF1F2]"
    : "border-[#E2E8F0] hover:border-[#CBD5E1] focus:border-[#2563EB] focus:shadow-[0_0_0_3px_#EFF6FF]";

  return (
    <FormField
      label={label}
      htmlFor={inputId}
      required={required}
      error={error}
      className={className}
    >
      <div className="relative">
        <input
          id={inputId}
          type={show ? "text" : "password"}
          value={value}
          className={[
            "input-base block h-11 w-full rounded-[10px] px-3.5 pr-11 text-sm text-[#0F172A]",
            "placeholder:text-[#CBD5E1] bg-white transition-all duration-150",
            "disabled:bg-[#F8FAFC] disabled:text-[#94A3B8] disabled:cursor-not-allowed",
            errorClass,
          ].join(" ")}
          aria-invalid={!!error}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#94A3B8] hover:text-[#475569] transition-colors"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show
            ? <EyeSlashIcon className="h-4.5 w-4.5" />
            : <EyeIcon className="h-4.5 w-4.5" />
          }
        </button>
      </div>

      {showStrength && value.length > 0 && (
        <div className="mt-2">
          <div className="flex gap-1">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={[
                  "h-1 flex-1 rounded-full transition-all duration-300",
                  i < strength.score ? strength.color : "bg-[#F1F5F9]",
                ].join(" ")}
              />
            ))}
          </div>
          <p className={`mt-1.5 text-xs font-semibold ${strength.textColor}`}>
            {strength.label}
          </p>
        </div>
      )}
    </FormField>
  );
}

function getStrength(password) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) return { score, label: "Weak",   color: "bg-[#DC2626]", textColor: "text-[#DC2626]" };
  if (score === 2) return { score, label: "Fair",   color: "bg-[#D97706]", textColor: "text-[#D97706]" };
  if (score === 3) return { score, label: "Good",   color: "bg-[#2563EB]", textColor: "text-[#2563EB]" };
  return              { score, label: "Strong", color: "bg-[#059669]", textColor: "text-[#059669]" };
}
