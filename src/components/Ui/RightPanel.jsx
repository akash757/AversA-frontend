"use client";

import { useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";

/**
 * RightPanel — AversA Design System
 *
 * Slide-in panel from the right side. Used for contextual info,
 * user profile, evidence drawer, item details, etc.
 *
 * @param {boolean}  isOpen
 * @param {function} onClose
 * @param {string}   title
 * @param {"sm"|"md"|"lg"} size  — controls width (sm:320px, md:400px, lg:480px)
 * @param {boolean}  closeOnBackdrop (default: true)
 */
export function RightPanel({
  isOpen,
  onClose,
  title,
  size = "md",
  closeOnBackdrop = true,
  className = "",
  children,
}) {
  const panelRef = useRef(null);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") onClose?.();
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    const timer = setTimeout(() => panelRef.current?.focus(), 50);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, handleKeyDown]);

  const widths = {
    sm: "w-80",
    md: "w-[400px]",
    lg: "w-[480px]",
  };

  const content = (
    <div className="fixed inset-0 z-[150] flex justify-end" aria-modal="true" role="dialog">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-[#0F172A]/30 backdrop-blur-xs transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeOnBackdrop ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className={[
          "relative z-10 flex flex-col bg-white h-full",
          "shadow-[-8px_0_40px_rgba(15,23,42,0.12)]",
          "outline-none",
          "transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-full",
          widths[size] ?? widths.md,
          "max-w-full",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </div>
    </div>
  );

  if (!isOpen && typeof window !== "undefined") {
    // Still render (for exit animation) but skip portal on SSR
    return null;
  }

  return typeof document !== "undefined"
    ? createPortal(content, document.body)
    : null;
}

/**
 * RightPanel.Header — sticky header with title + close button
 */
RightPanel.Header = function RightPanelHeader({ title, onClose, children, className = "" }) {
  return (
    <div
      className={[
        "flex items-center justify-between px-5 py-4 border-b border-[#F1F5F9] shrink-0",
        className,
      ].join(" ")}
    >
      {title && (
        <h2 className="text-sm font-bold text-[#0F172A] font-display">{title}</h2>
      )}
      {children}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="ml-auto flex h-8 w-8 items-center justify-center rounded-xl text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition-colors"
          aria-label="Close panel"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

/**
 * RightPanel.Body — scrollable content area
 */
RightPanel.Body = function RightPanelBody({ className = "", children }) {
  return (
    <div className={["flex-1 overflow-y-auto px-5 py-5", className].join(" ")}>
      {children}
    </div>
  );
};

/**
 * RightPanel.Footer — sticky footer
 */
RightPanel.Footer = function RightPanelFooter({ className = "", children }) {
  return (
    <div
      className={[
        "shrink-0 px-5 py-4 border-t border-[#F1F5F9] bg-[#F8FAFC]",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
};

export default RightPanel;

