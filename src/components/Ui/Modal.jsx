"use client";

import { useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";

/**
 * Universal Modal — AversA Design System
 *
 * Portal-based, focus-trap, ESC to close, backdrop click to close.
 *
 * @param {boolean}  isOpen
 * @param {function} onClose
 * @param {"sm"|"md"|"lg"|"xl"|"full"} size
 * @param {string}   title
 * @param {string}   subtitle
 * @param {React.ReactNode} icon
 * @param {React.ReactNode} header
 * @param {boolean}  hideCloseButton
 * @param {boolean}  closeOnBackdrop  (default: true)
 * @param {string}   className
 * @param {string}   bodyClassName
 */
export default function Modal({
  isOpen,
  onClose,
  size = "md",
  title,
  subtitle,
  icon,
  header,
  hideCloseButton = false,
  closeOnBackdrop = true,
  className = "",
  bodyClassName = "px-6 py-5",
  children,
}) {
  const dialogRef = useRef(null);
  const lastFocusRef = useRef(null);

  // ESC key handler
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") onClose?.();
    },
    [onClose]
  );

  // Lock scroll + attach ESC listener when open
  useEffect(() => {
    if (!isOpen) return;
    lastFocusRef.current = document.activeElement;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    // Move focus to dialog
    const timer = setTimeout(() => dialogRef.current?.focus(), 50);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timer);
      lastFocusRef.current?.focus();
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const sizes = {
    sm:   "max-w-sm",
    md:   "max-w-md",
    lg:   "max-w-lg",
    xl:   "max-w-xl",
    "2xl": "max-w-2xl",
    full: "max-w-[95vw] max-h-[95vh]",
  };

  const content = (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-label={title}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#0F172A]/50 backdrop-blur-sm animate-fade-in"
        onClick={closeOnBackdrop ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={[
          "relative z-10 w-full bg-white rounded-[24px]",
          "shadow-[0_25px_60px_-12px_rgba(15,23,42,0.3)]",
          "animate-scale-in-spring",
          "outline-none",
          sizes[size] ?? sizes.md,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {/* Header */}
        {header ? (
          header
        ) : (title || !hideCloseButton) ? (
          <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-[#F1F5F9]">
            <div className="flex items-start gap-3">
              {icon && (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB] border border-blue-100/80 shadow-xs">
                  {icon}
                </div>
              )}
              <div>
                {title && (
                  <h2 className="text-base font-bold text-[#0F172A] leading-tight font-display">
                    {title}
                  </h2>
                )}
                {subtitle && (
                  <p className="mt-1 text-xs text-[#64748B]">{subtitle}</p>
                )}
              </div>
            </div>
            {!hideCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="ml-auto flex h-8 w-8 items-center justify-center rounded-xl text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition-colors"
                aria-label="Close modal"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        ) : null}

        {/* Body */}
        <div className={bodyClassName}>{children}</div>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(content, document.body)
    : null;
}

/**
 * Modal.Footer — standardized action row
 */
Modal.Footer = function ModalFooter({ className = "", children }) {
  return (
    <div
      className={[
        "flex items-center justify-end gap-2.5 pt-4 mt-2 border-t border-[#F1F5F9]",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
};

