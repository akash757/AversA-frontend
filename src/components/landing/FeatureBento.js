import ScrollReveal from "@/components/ScrollReveal";
import {
  CpuChipIcon,
  ListBulletIcon,
  DocumentTextIcon,
  Squares2X2Icon,
  VideoCameraIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

const features = [
  {
    title: "AI transcript analysis",
    description:
      "Gemini-powered analysis turns raw meeting text into actionable requirements, risks, and follow-ups — with memory of prior sessions.",
    icon: CpuChipIcon,
    span: "md:col-span-2",
    visual: (
      <div className="mt-5 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <SparklesIcon className="h-4 w-4 text-blue-600" />
          <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-blue-700">
            Analysis complete
          </span>
        </div>
        <div className="space-y-2">
          {["Requirements extracted", "Risks flagged", "Gaps identified"].map((label) => (
            <div
              key={label}
              className="flex items-center justify-between rounded-xl bg-white/80 px-3 py-2 text-xs font-medium text-gray-700 border border-blue-100/60"
            >
              <span>{label}</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    title: "Requirement extraction",
    description:
      "Every decision becomes a REQ with clear acceptance context — no more tribal knowledge.",
    icon: ListBulletIcon,
    span: "",
    visual: (
      <div className="mt-5 space-y-2">
        {["REQ-001", "REQ-002", "REQ-003"].map((id) => (
          <div
            key={id}
            className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-[11px] text-gray-600"
          >
            {id} · linked to meeting
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "Estimates & proposals",
    description:
      "Generate effort breakdowns and client-ready proposals from the same structured scope.",
    icon: DocumentTextIcon,
    span: "",
    visual: (
      <div className="mt-5 rounded-xl border border-gray-200 bg-white p-3">
        <div className="h-2 w-2/3 rounded bg-gray-100 mb-2" />
        <div className="h-2 w-full rounded bg-gray-100 mb-2" />
        <div className="h-2 w-5/6 rounded bg-blue-100" />
        <div className="mt-3 inline-flex rounded-lg bg-blue-50 px-2 py-1 font-mono text-[10px] font-semibold text-blue-700">
          Proposal PDF ready
        </div>
      </div>
    ),
  },
  {
    title: "Task generation",
    description:
      "One click turns requirements into frontend, backend, and design tasks — linked by requirement ID.",
    icon: Squares2X2Icon,
    span: "",
    visual: (
      <div className="mt-5 flex flex-wrap gap-2">
        {["frontend", "backend", "design"].map((d) => (
          <span
            key={d}
            className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wide text-gray-600"
          >
            {d}
          </span>
        ))}
      </div>
    ),
  },
  {
    title: "Meet orchestration",
    description:
      "Google Meet rooms, conflict checks, and calendar sync — without leaving AversA.",
    icon: VideoCameraIcon,
    span: "",
    visual: (
      <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
          <VideoCameraIcon className="h-4 w-4" />
          Architecture review
        </div>
        <p className="mt-1 text-[11px] text-emerald-700">Today · 4 attendees · Meet ready</p>
      </div>
    ),
  },
  {
    title: "Governance & RBAC",
    description:
      "Multi-tenant orgs, role-based access, invites, and admin approvals — built in.",
    icon: ShieldCheckIcon,
    span: "md:col-span-2",
    visual: (
      <div className="mt-5 flex flex-wrap gap-2">
        {["Superadmin", "PM", "Engineer", "Designer", "Client"].map((role) => (
          <span
            key={role}
            className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[11px] font-semibold text-indigo-700"
          >
            {role}
          </span>
        ))}
      </div>
    ),
  },
];

export default function FeatureBento() {
  return (
    <section id="product" className="relative scroll-mt-20 border-b border-gray-200 bg-[#fafafa] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
              Platform
            </span>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
              Everything between the idea and the ship
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600 sm:text-base">
              Purpose-built for AI-assisted product discovery, planning, and delivery —
              not another generic task board.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-3">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <ScrollReveal key={feat.title} delay={i * 40} className={feat.span}>
                <div className="group h-full rounded-3xl border border-gray-200 bg-white p-6 shadow-xs transition hover:border-blue-300 hover:shadow-md sm:p-7">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-gray-950">{feat.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">
                    {feat.description}
                  </p>
                  {feat.visual}
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
