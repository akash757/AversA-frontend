"use client";

import { useId } from "react";
import { CalendarDaysIcon, XMarkIcon } from "@heroicons/react/24/outline";

/**
 * Modern Date Input component with formatted display, clean icon, quick presets, and reset button.
 */
export default function ModernDateInput({
  label,
  value = "",
  onChange,
  min,
  max,
  placeholder = "Select date",
  showPresets = true,
  helperText,
}) {
  const inputId = useId();

  // Helper to format date for human readability
  const formattedDisplay = value
    ? new Date(value + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const applyOffsetDays = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const isoDate = d.toISOString().split("T")[0];
    onChange(isoDate);
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-gray-700">
          {label}
        </label>
      )}

      <div className="group relative flex items-center rounded-xl border border-gray-200 bg-white shadow-2xs transition-all focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-blue-500/10 hover:border-gray-300">
        <div className="pointer-events-none pl-3 text-gray-400 group-focus-within:text-[#2563EB] transition-colors">
          <CalendarDaysIcon className="h-4 w-4" />
        </div>

        <input
          id={inputId}
          type="date"
          value={value}
          min={min}
          max={max}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent py-2 pl-2.5 pr-8 text-xs font-medium text-gray-900 focus:outline-none cursor-pointer"
        />

        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-2.5 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
            title="Clear date"
          >
            <XMarkIcon className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Selected date readout or helper text */}
      <div className="flex items-center justify-between text-[11px] text-gray-500">
        {formattedDisplay ? (
          <span className="font-medium text-blue-600">{formattedDisplay}</span>
        ) : (
          <span>{helperText || placeholder}</span>
        )}

        {showPresets && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => applyOffsetDays(0)}
              className="text-[10px] font-medium text-gray-400 hover:text-blue-600 transition"
            >
              Today
            </button>
            <span className="text-gray-300">•</span>
            <button
              type="button"
              onClick={() => applyOffsetDays(14)}
              className="text-[10px] font-medium text-gray-400 hover:text-blue-600 transition"
            >
              +2w
            </button>
            <span className="text-gray-300">•</span>
            <button
              type="button"
              onClick={() => applyOffsetDays(30)}
              className="text-[10px] font-medium text-gray-400 hover:text-blue-600 transition"
            >
              +1m
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
