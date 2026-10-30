"use client";

import { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function PasswordInput({
  label = "Password",
  id,
  error,
  className = "",
  showStrength = false,
  value = "",
  ...props
}) {
  const [show, setShow] = useState(false);
  const inputId = id || props.name || "password";

  const strength = getStrength(value);

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-semibold text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          type={show ? "text" : "password"}
          value={value}
          className={`h-11 w-full rounded-xl border bg-white px-3.5 pr-11 text-sm text-gray-900 placeholder:text-gray-400 transition focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
            error
              ? "border-rose-300 focus:border-rose-400"
              : "border-gray-200 focus:border-blue-500"
          }`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-gray-700"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
        </button>
      </div>

      {showStrength && value.length > 0 && (
        <div className="mt-2">
          <div className="flex gap-1">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition ${
                  i < strength.score ? strength.color : "bg-gray-200"
                }`}
              />
            ))}
          </div>
          <p className={`mt-1.5 text-xs font-medium ${strength.textColor}`}>
            {strength.label}
          </p>
        </div>
      )}

      {error && <p className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
}

function getStrength(password) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) {
    return { score, label: "Weak", color: "bg-rose-500", textColor: "text-rose-600" };
  }
  if (score === 2) {
    return { score, label: "Fair", color: "bg-amber-500", textColor: "text-amber-600" };
  }
  if (score === 3) {
    return { score, label: "Good", color: "bg-blue-500", textColor: "text-blue-600" };
  }
  return { score, label: "Strong", color: "bg-emerald-500", textColor: "text-emerald-600" };
}
