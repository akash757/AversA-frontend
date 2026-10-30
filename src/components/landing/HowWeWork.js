import ScrollReveal from "@/components/ScrollReveal";
import {
  FolderPlusIcon,
  VideoCameraIcon,
  CpuChipIcon,
  DocumentChartBarIcon,
  RocketLaunchIcon,
} from "@heroicons/react/24/outline";

const steps = [
  {
    step: "01",
    title: "Capture",
    icon: FolderPlusIcon,
    description:
      "Create a project in seconds. AversA seeds a Day 1 discovery questionnaire across eight strategic dimensions — problem, users, goals, features, architecture, constraints, stakeholders, and next steps.",
  },
  {
    step: "02",
    title: "Align",
    icon: VideoCameraIcon,
    description:
      "Connect Google Calendar, check attendee availability, and schedule alignment sessions. AversA generates Google Meet rooms automatically so nothing falls through the cracks.",
  },
  {
    step: "03",
    title: "Analyze",
    icon: CpuChipIcon,
    description:
      "Upload or capture the meeting transcript. AversA’s AI product manager extracts requirements, risks, gaps, and decisions — with full context from prior sessions.",
  },
  {
    step: "04",
    title: "Plan",
    icon: DocumentChartBarIcon,
    description:
      "Get effort estimates, a client-ready proposal, and domain-tagged tasks (frontend, backend, design) linked to requirement IDs — ready for your delivery team.",
  },
  {
    step: "05",
    title: "Deliver",
    icon: RocketLaunchIcon,
    description:
      "Assign a project manager, developers, and designers. Track work through todo, in progress, review, and done — always tied back to what the client agreed.",
  },
];

export default function HowWeWork() {
  return (
    <section id="how-we-work" className="relative scroll-mt-20 border-b border-gray-200 bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
              How we work
            </span>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
              From first call to shipped work in five steps
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600 sm:text-base">
              A structured methodology that keeps discovery, AI analysis, and delivery
              in one continuous loop.
            </p>
          </div>
        </ScrollReveal>

        <div className="relative mx-auto mt-16 max-w-3xl">
          <div className="pointer-events-none absolute left-[27px] top-4 bottom-4 w-px bg-gradient-to-b from-blue-200 via-indigo-200 to-cyan-200 sm:left-[31px]" />

          <div className="space-y-6">
            {steps.map((item, idx) => (
              <ScrollReveal key={item.step} delay={idx * 60}>
                <div className="relative flex gap-5 sm:gap-6">
                  <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-white text-blue-600 shadow-xs">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 rounded-3xl border border-gray-200 bg-gray-50/60 p-5 shadow-xs transition hover:border-blue-300 hover:shadow-md sm:p-6">
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-xs font-bold text-blue-600">
                        {item.step}
                      </span>
                      <h3 className="text-lg font-bold text-gray-950">{item.title}</h3>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">
                      {item.description}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
