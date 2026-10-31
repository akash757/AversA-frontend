"use client";

import { useState } from "react";
import { XMarkIcon, PlusIcon } from "@heroicons/react/24/outline";

/**
 * Modern chip / tag input component.
 * Allows entering multiple items (clients, tech stack, skills).
 * User types and presses Enter or comma to add a tag.
 */
export default function TagInput({
  tags = [],
  onChange,
  placeholder = "Type and press Enter...",
  suggestions = [],
  maxTags = 20,
  tagColor = "blue",
  icon: Icon,
  className = "",
}) {
  const [inputValue, setInputValue] = useState("");

  const colorStyles = {
    blue: "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE] hover:border-[#93C5FD]",
    emerald: "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0] hover:border-[#6EE7B7]",
    purple: "bg-[#F5F3FF] text-[#7C3AED] border-[#DDD6FE] hover:border-[#C4B5FD]",
    gray: "bg-[#F8FAFC] text-[#475569] border-[#E2E8F0] hover:border-[#CBD5E1]",
  };

  const activeColor = colorStyles[tagColor] || colorStyles.blue;

  const addTag = (text) => {
    const trimmed = text.trim().replace(/^,+|,+$/g, "");
    if (!trimmed) return;

    // Avoid duplicate (case-insensitive check)
    if (tags.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      setInputValue("");
      return;
    }

    if (tags.length >= maxTags) return;

    onChange([...tags, trimmed]);
    setInputValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      // Remove last tag on backspace if input is empty
      onChange(tags.slice(0, -1));
    }
  };

  const removeTag = (indexToRemove) => {
    onChange(tags.filter((_, idx) => idx !== indexToRemove));
  };

  // Filter suggestions to only those not already selected
  const availableSuggestions = suggestions.filter(
    (s) => !tags.some((t) => t.toLowerCase() === s.toLowerCase())
  );

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex flex-wrap items-center gap-1.5 min-h-[42px] rounded-[12px] border border-[#E2E8F0] bg-white p-2 text-xs transition-all focus-within:border-[#2563EB] focus-within:shadow-[0_0_0_3px_#EFF6FF] hover:border-[#CBD5E1]">
        {Icon && (
          <div className="pl-1 pr-1.5 text-[#94A3B8]">
            <Icon className="h-4 w-4" />
          </div>
        )}

        {tags.map((tag, idx) => (
          <span
            key={`${tag}-${idx}`}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold shadow-2xs transition ${activeColor}`}
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(idx)}
              className="rounded p-0.5 hover:bg-black/10 text-current transition"
              aria-label={`Remove ${tag}`}
            >
              <XMarkIcon className="h-3 w-3" />
            </button>
          </span>
        ))}

        <div className="flex-1 flex items-center min-w-[140px]">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (inputValue.trim()) {
                addTag(inputValue);
              }
            }}
            placeholder={tags.length === 0 ? placeholder : "Add another..."}
            className="w-full bg-transparent px-1.5 py-1 text-xs font-medium text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none"
          />
          {inputValue.trim() && (
            <button
              type="button"
              onClick={() => addTag(inputValue)}
              className="shrink-0 rounded-lg bg-[#2563EB] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-[#1D4ED8] shadow-xs active:scale-95 transition-all"
            >
              Add
            </button>
          )}
        </div>
      </div>

      {/* Suggested chips if provided */}
      {availableSuggestions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="text-[11px] font-medium text-[#94A3B8]">Suggestions:</span>
          {availableSuggestions.slice(0, 6).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => addTag(item)}
              className="inline-flex items-center gap-1 rounded-lg border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-2 py-0.5 text-[11px] font-medium text-[#475569] hover:border-[#2563EB] hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-all"
            >
              <PlusIcon className="h-2.5 w-2.5" />
              <span>{item}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
