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
        <label htmlFor={inputId} className="block text-xs font-semibold text-[#0F172A]">
          {label}
        </label>
      )}

      <div className="group relative flex items-center rounded-[12px] border border-[#E2E8F0] bg-white shadow-2xs transition-all focus-within:border-[#2563EB] focus-within:shadow-[0_0_0_3px_#EFF6FF] hover:border-[#CBD5E1]">
        <div className="pointer-events-none pl-3 text-[#94A3B8] group-focus-within:text-[#2563EB] transition-colors">
          <CalendarDaysIcon className="h-4 w-4" />
        </div>

        <input
          id={inputId}
          type="date"
          value={value}
          min={min}
          max={max}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent py-2 pl-2.5 pr-8 text-xs font-medium text-[#0F172A] focus:outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-50 hover:[&::-webkit-calendar-picker-indicator]:opacity-90"
        />

        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-2.5 rounded-md p-1 text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition"
            title="Clear date"
          >
            <XMarkIcon className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Selected date readout or helper text & Quick Presets */}
      <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-0.5 min-h-[20px]">
        {formattedDisplay ? (
          <span className="font-semibold text-[#2563EB] flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#2563EB]"></span>
            {formattedDisplay}
          </span>
        ) : (
          <span className="text-[#94A3B8]">{helperText || placeholder}</span>
        )}

        {showPresets && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => applyOffsetDays(0)}
              className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#F1F5F9] text-[#475569] hover:bg-[#EFF6FF] hover:text-[#2563EB] hover:border-[#BFDBFE] border border-transparent transition"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => applyOffsetDays(14)}
              className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#F1F5F9] text-[#475569] hover:bg-[#EFF6FF] hover:text-[#2563EB] hover:border-[#BFDBFE] border border-transparent transition"
            >
              +2w
            </button>
            <button
              type="button"
              onClick={() => applyOffsetDays(30)}
              className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#F1F5F9] text-[#475569] hover:bg-[#EFF6FF] hover:text-[#2563EB] hover:border-[#BFDBFE] border border-transparent transition"
            >
              +1m
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
