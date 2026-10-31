"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { ChevronUpDownIcon, CheckIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

/**
 * Reusable Dropdown component with light theme styling.
 */
export default function Dropdown({
  value,
  onChange,
  options = [],
  placeholder = "Select...",
  className = "",
  menuClassName = "",
  position = "down",
  disabled = false,
  searchable = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search when opening
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      const timer = setTimeout(() => searchInputRef.current?.focus(), 10);
      return () => clearTimeout(timer);
    }
  }, [isOpen, searchable]);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = useMemo(() => {
    if (!searchable || !searchQuery) return options;
    const query = searchQuery.toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(query) ||
        opt.sublabel?.toLowerCase().includes(query)
    );
  }, [options, searchable, searchQuery]);

  const handleSelect = (option) => {
    if (disabled) return;
    onChange(option.value);
    setIsOpen(false);
  };

  const positionClasses =
    position === "up" ? "bottom-full mb-1.5" : "top-full mt-1.5";

  return (
    <div className="relative inline-block w-full text-left" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`
          flex items-center justify-between w-full px-3.5 py-2
          text-sm font-medium transition-all duration-150
          bg-white border border-gray-200 rounded-xl text-gray-900 shadow-sm
          hover:border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]
          disabled:opacity-50 disabled:bg-gray-50 disabled:cursor-not-allowed
          ${className}
        `}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedOption?.icon && (
            <span className="shrink-0">{selectedOption.icon}</span>
          )}
          <div className="flex flex-col items-start min-w-0">
            <span className="truncate">
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            {selectedOption?.sublabel && (
              <span className="text-[11px] text-gray-500 truncate w-full">
                {selectedOption.sublabel}
              </span>
            )}
          </div>
        </div>
        <ChevronUpDownIcon className="h-4 w-4 ml-2 text-gray-400 shrink-0" />
      </button>

      {isOpen && (
        <div
          className={`
            absolute left-0 z-50 w-full min-w-[200px] 
            bg-white border border-gray-200 rounded-xl shadow-xl 
            overflow-hidden animate-in fade-in zoom-in-95 duration-150
            ${positionClasses}
            ${menuClassName}
          `}
        >
          {searchable && (
            <div className="p-2 border-b border-gray-100 bg-gray-50">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-gray-400"
                />
              </div>
            </div>
          )}

          <div className="py-1 max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-xs text-gray-400 italic text-center">
                {searchQuery ? "No results found" : "No options available"}
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={`
                    flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-left transition-colors
                    ${
                      option.value === value
                        ? "bg-blue-50 text-[#2563EB]"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-950"
                    }
                  `}
                >
                  <div className="flex items-center gap-3 truncate">
                    {option.icon && <span className="shrink-0">{option.icon}</span>}
                    <div className="flex flex-col min-w-0">
                      <span className="truncate">{option.label}</span>
                      {option.sublabel && (
                        <span
                          className={`text-[11px] truncate ${
                            option.value === value ? "text-blue-500" : "text-gray-400"
                          }`}
                        >
                          {option.sublabel}
                        </span>
                      )}
                    </div>
                  </div>
                  {option.value === value && (
                    <CheckIcon className="h-4 w-4 text-[#2563EB] shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
