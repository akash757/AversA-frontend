"use client";

/**
 * Tabs — AversA Design System
 *
 * @param {"underline"|"pill"|"soft"} variant
 * @param {string}   activeTab       - Controlled active tab value
 * @param {function} onTabChange     - (value) => void
 * @param {Array}    tabs            - [{ value, label, count?, icon?, disabled? }]
 */
export default function Tabs({
  variant = "underline",
  activeTab,
  onTabChange,
  tabs = [],
  className = "",
}) {
  const wrappers = {
    underline:
      "flex items-end gap-0.5 border-b border-[#E2E8F0] overflow-x-auto scrollbar-hide",
    pill:
      "flex items-center gap-1.5 bg-[#F1F5F9] rounded-[12px] p-1 overflow-x-auto scrollbar-hide",
    soft:
      "flex items-center gap-1 overflow-x-auto scrollbar-hide",
  };

  const getItemClass = (tab) => {
    const isActive = tab.value === activeTab;
    const base =
      "flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold transition-all duration-150 cursor-pointer select-none focus-visible:outline-none disabled:opacity-40 disabled:cursor-not-allowed";

    if (variant === "underline") {
      return [
        base,
        "px-1 pb-3 pt-1 border-b-2 -mb-px",
        isActive
          ? "border-[#2563EB] text-[#2563EB]"
          : "border-transparent text-[#94A3B8] hover:text-[#475569] hover:border-[#E2E8F0]",
      ].join(" ");
    }

    if (variant === "pill") {
      return [
        base,
        "px-3 py-1.5 rounded-[9px] text-xs",
        isActive
          ? "bg-white text-[#0F172A] shadow-[0_1px_3px_rgba(15,23,42,0.08)]"
          : "text-[#64748B] hover:text-[#0F172A]",
      ].join(" ");
    }

    if (variant === "soft") {
      return [
        base,
        "px-3 py-1.5 rounded-[10px] text-xs",
        isActive
          ? "bg-[#EFF6FF] text-[#2563EB]"
          : "text-[#94A3B8] hover:bg-[#F8FAFC] hover:text-[#475569]",
      ].join(" ");
    }

    return base;
  };

  return (
    <div
      className={[wrappers[variant] ?? wrappers.underline, className].join(" ")}
      role="tablist"
    >
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          role="tab"
          aria-selected={tab.value === activeTab}
          disabled={tab.disabled}
          onClick={() => onTabChange?.(tab.value)}
          className={getItemClass(tab)}
        >
          {tab.icon && (
            <span className="shrink-0" aria-hidden="true">
              {tab.icon}
            </span>
          )}
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={[
                "inline-flex items-center justify-center rounded-full text-[10px] font-bold px-1.5 min-w-[18px] h-[18px]",
                tab.value === activeTab
                  ? "bg-[#2563EB]/10 text-[#2563EB]"
                  : "bg-[#F1F5F9] text-[#94A3B8]",
              ].join(" ")}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

