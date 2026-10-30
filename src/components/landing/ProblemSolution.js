import ScrollReveal from "@/components/ScrollReveal";
import {
  XMarkIcon,
  CheckIcon,
  DocumentDuplicateIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  CpuChipIcon,
  ClipboardDocumentCheckIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

const problems = [
  {
    icon: DocumentDuplicateIcon,
    title: "Scattered notes",
    text: "Decisions live in Docs, Slack, and calendars — never in one place.",
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: "Lost scope",
    text: "What was agreed on the call evaporates before engineering starts.",
  },
  {
    icon: ExclamationTriangleIcon,
    title: "Missed estimates",
    text: "Proposals are guesswork. Tasks don’t map back to requirements.",
  },
];

const solutions = [
  {
    icon: CpuChipIcon,
    title: "AI-structured truth",
    text: "Transcripts become requirements, risks, and gaps — automatically.",
  },
  {
    icon: ClipboardDocumentCheckIcon,
    title: "Traceable decisions",
    text: "Every REQ links to a meeting, estimate, and domain-tagged task.",
  },
  {
    icon: ChartBarIcon,
    title: "Estimates that stick",
    text: "Effort, proposals, and sprint-ready work generated from the same source.",
  },
];

export default function ProblemSolution() {
  return (
    <section className="relative border-b border-gray-200 bg-[#fafafa] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
              The shift
            </span>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
              From ambiguity to a single source of truth
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600 sm:text-base">
              Most teams lose the plot between the client call and the first commit.
              AversA closes that gap with AI that remembers every decision.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ScrollReveal delay={80}>
            <div className="h-full rounded-3xl border border-rose-200/70 bg-white p-7 shadow-xs sm:p-8">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700">
                <XMarkIcon className="h-3.5 w-3.5" />
                Without AversA
              </div>
              <div className="space-y-5">
                {problems.map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 text-rose-500">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-950">{item.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-gray-600">
                        {item.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={160}>
            <div className="h-full rounded-3xl border border-emerald-200/70 bg-white p-7 shadow-xs sm:p-8">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                <CheckIcon className="h-3.5 w-3.5" />
                With AversA
              </div>
              <div className="space-y-5">
                {solutions.map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-950">{item.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-gray-600">
                        {item.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
