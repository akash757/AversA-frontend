import ScrollReveal from "@/components/ScrollReveal";
import {
  LightBulbIcon,
  ClipboardDocumentListIcon,
  CodeBracketIcon,
  BeakerIcon,
  CloudArrowUpIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

const agents = [
  {
    name: "Product Management Agent",
    role: "Requirements · PRDs · Estimates · Proposals",
    status: "live",
    icon: LightBulbIcon,
    description:
      "Analyzes transcripts, extracts requirements, drafts verified PRDs, estimates effort, and generates client proposals.",
  },
  {
    name: "Project Management Agent",
    role: "Sprints · SDLC Sequencing · Unblocking",
    status: "soon",
    icon: ClipboardDocumentListIcon,
    description:
      "Turns discovery into milestones, sprints, and sequenced execution across the software development lifecycle.",
  },
  {
    name: "Developer Agent",
    role: "Implementation · Docs · Refactors",
    status: "soon",
    icon: CodeBracketIcon,
    description:
      "Builds features, schemas, and APIs from structured requirements and tasks.",
  },
  {
    name: "QA Agent",
    role: "Tests · Validation · Defects",
    status: "soon",
    icon: BeakerIcon,
    description:
      "Writes tests, validates against acceptance criteria, and reports issues back.",
  },
  {
    name: "Deployment Agent",
    role: "CI/CD · Release · Monitoring",
    status: "soon",
    icon: CloudArrowUpIcon,
    description:
      "Ships releases with deployment configs, pipelines, and runtime health signals.",
  },
];

export default function AgentCrew() {
  return (
    <section id="agents" className="relative scroll-mt-20 border-b border-gray-200 bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              <SparklesIcon className="h-3.5 w-3.5" />
              AI agent crew
            </div>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
              One live agent today. A full software company tomorrow.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600 sm:text-base">
              AversA starts with a production-ready Product Management Agent.
              The rest of the crew is on the roadmap — same platform, expanding autonomy across the entire Software Development Lifecycle (SDLC).
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent, i) => {
            const Icon = agent.icon;
            const isLive = agent.status === "live";
            return (
              <ScrollReveal
                key={agent.name}
                delay={i * 50}
                className={i === 0 ? "sm:col-span-2 lg:col-span-1" : ""}
              >
                <div
                  className={`relative h-full overflow-hidden rounded-3xl border p-6 transition sm:p-7 ${
                    isLive
                      ? "border-blue-300 bg-gradient-to-br from-blue-50 via-white to-indigo-50 shadow-md"
                      : "border-gray-200 bg-gray-50/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${
                        isLive
                          ? "border-blue-200 bg-white text-blue-600 shadow-xs"
                          : "border-gray-200 bg-white text-gray-400"
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                        isLive
                          ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border border-gray-200 bg-white text-gray-500"
                      }`}
                    >
                      {isLive ? "Live" : "Coming soon"}
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-gray-950">{agent.name}</h3>
                  <p className="mt-1 font-mono text-[11px] font-semibold uppercase tracking-wide text-blue-600/80">
                    {agent.role}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600">
                    {agent.description}
                  </p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
