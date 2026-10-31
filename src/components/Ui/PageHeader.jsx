"use client";

import Link from "next/link";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

/**
 * PageHeader — AversA Design System
 *
 * Consistent page title + breadcrumb + action slot.
 *
 * @param {string}          title
 * @param {string}          description
 * @param {Array}           breadcrumbs  - [{ label, href? }]
 * @param {React.ReactNode} actions      - Button(s) on the right
 */
export default function PageHeader({
  title,
  description,
  breadcrumbs = [],
  actions,
  className = "",
}) {
  return (
    <div
      className={[
        "flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between",
        className,
      ].join(" ")}
    >
      <div>
        {breadcrumbs.length > 0 && (
          <nav className="mb-1.5 flex items-center gap-1 text-xs text-[#94A3B8]" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRightIcon className="h-3 w-3 shrink-0" />}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="hover:text-[#475569] transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-[#475569] font-medium">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}

        <h1 className="text-xl font-bold text-[#0F172A] font-display tracking-tight sm:text-2xl">
          {title}
        </h1>

        {description && (
          <p className="mt-1 text-sm text-[#94A3B8] leading-relaxed">{description}</p>
        )}
      </div>

      {actions && (
        <div className="flex shrink-0 items-center gap-2 mt-2 sm:mt-0">
          {actions}
        </div>
      )}
    </div>
  );
}

