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
}) {
  const [inputValue, setInputValue] = useState("");

  const colorStyles = {
    blue: "bg-blue-50 text-blue-700 border-blue-200 hover:border-blue-300",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:border-emerald-300",
    purple: "bg-purple-50 text-purple-700 border-purple-200 hover:border-purple-300",
    gray: "bg-gray-100 text-gray-800 border-gray-200 hover:border-gray-300",
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
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1.5 min-h-[42px] rounded-xl border border-gray-200 bg-white p-2 text-xs transition focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-blue-500/10">
        {tags.map((tag, idx) => (
          <span
            key={`${tag}-${idx}`}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition ${activeColor}`}
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
            className="w-full bg-transparent px-1 py-0.5 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none"
          />
          {inputValue.trim() && (
            <button
              type="button"
              onClick={() => addTag(inputValue)}
              className="shrink-0 rounded-md bg-[#2563EB] px-2 py-0.5 text-[11px] font-semibold text-white hover:bg-blue-700 transition"
            >
              Add
            </button>
          )}
        </div>
      </div>

      {/* Suggested chips if provided */}
      {availableSuggestions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="text-[11px] text-gray-400">Suggestions:</span>
          {availableSuggestions.slice(0, 6).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => addTag(item)}
              className="inline-flex items-center gap-1 rounded-md border border-dashed border-gray-200 bg-gray-50/70 px-2 py-0.5 text-[11px] text-gray-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition"
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
