const chips = [
  "Google Meet",
  "Google Calendar",
  "Gemini AI",
  "Multi-tenant RBAC",
  "Discovery Matrix",
  "REQ-linked Tasks",
  "Proposal Generation",
  "Org Approvals",
];

const stats = [
  { value: "8", label: "Discovery dimensions" },
  { value: "3", label: "Delivery domains" },
  { value: "1", label: "AI product manager" },
  { value: "0", label: "Dropped requirements" },
];

export default function TrustStrip() {
  const loop = [...chips, ...chips];

  return (
    <section className="relative border-b border-gray-200 bg-white py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-gray-200 bg-gray-50/80 px-4 py-5 text-center"
            >
              <p className="text-2xl font-black tracking-tight text-gray-950 sm:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 text-xs font-medium text-gray-500 sm:text-sm">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative mt-10 overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent" />
        <div className="flex w-max animate-marquee gap-3">
          {loop.map((chip, i) => (
            <span
              key={`${chip}-${i}`}
              className="inline-flex shrink-0 items-center rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 shadow-xs"
            >
              {chip}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
