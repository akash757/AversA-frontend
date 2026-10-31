"use client";

import { useState, useRef } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

/**
 * Accordion — AversA Design System
 *
 * Animated expand/collapse. Critical for Questions Board.
 *
 * Can be used as:
 * 1. Single item: <Accordion.Item> inside a <div>
 * 2. Group: wrap multiple <Accordion.Item> in <Accordion>
 *
 * @param {boolean} allowMultiple - Allow multiple open items (default: false)
 */
export function Accordion({ allowMultiple = false, children, className = "" }) {
  return (
    <div className={["space-y-1.5", className].join(" ")} role="list">
      {children}
    </div>
  );
}

/**
 * Accordion.Item — individual collapsible item
 *
 * @param {boolean}        defaultOpen  - Start expanded
 * @param {boolean}        open         - Controlled open state
 * @param {function}       onOpenChange - Controlled toggle callback
 * @param {React.ReactNode} trigger     - Always-visible header content
 * @param {React.ReactNode} children    - Collapsible content
 * @param {"default"|"bordered"|"ghost"} variant
 */
function AccordionItem({
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  trigger,
  variant = "default",
  className = "",
  children,
  ...props
}) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const contentRef = useRef(null);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const toggle = () => {
    if (isControlled) {
      onOpenChange?.(!isOpen);
    } else {
      setInternalOpen((v) => !v);
    }
  };

  const variants = {
    default:
      "border border-[#E2E8F0] rounded-[14px] bg-white overflow-hidden shadow-[0_1px_3px_rgba(15,23,42,0.04)]",
    bordered:
      "border-2 border-[#E2E8F0] rounded-[14px] bg-white overflow-hidden",
    ghost:
      "rounded-[14px] overflow-hidden",
  };

  return (
    <div
      className={[variants[variant] ?? variants.default, className].join(" ")}
      role="listitem"
      {...props}
    >
      {/* Trigger */}
      <button
        type="button"
        onClick={toggle}
        className={[
          "flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left",
          "transition-colors duration-150",
          isOpen
            ? "bg-[#F8FAFC]"
            : "hover:bg-[#F8FAFC]",
        ].join(" ")}
        aria-expanded={isOpen}
      >
        <div className="flex-1 min-w-0">{trigger}</div>
        <ChevronDownIcon
          className={[
            "h-4 w-4 shrink-0 text-[#94A3B8] transition-transform duration-200",
            isOpen ? "rotate-180" : "",
          ].join(" ")}
          aria-hidden="true"
        />
      </button>

      {/* Collapsible body */}
      <div
        ref={contentRef}
        className="overflow-hidden"
        style={{
          maxHeight: isOpen ? "2000px" : "0",
          transition: isOpen
            ? "max-height 0.35s cubic-bezier(0.16,1,0.3,1)"
            : "max-height 0.25s cubic-bezier(0.4,0,0.6,1)",
          opacity: isOpen ? 1 : 0,
          transitionProperty: "max-height, opacity",
        }}
        aria-hidden={!isOpen}
      >
        <div className="px-4 pb-4 pt-1">{children}</div>
      </div>
    </div>
  );
}

Accordion.Item = AccordionItem;

export default Accordion;

