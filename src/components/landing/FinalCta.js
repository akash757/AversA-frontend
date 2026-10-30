import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { AversALogoMark } from "@/components/Ui/AversALogo";
import ScrollReveal from "@/components/ScrollReveal";

export default function FinalCta() {
  return (
    <section className="relative overflow-hidden aurora-bg bg-dot-grid-dark py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-0 h-64 w-64 rounded-full bg-blue-600/25 blur-3xl animate-aurora" />
        <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl animate-aurora" style={{ animationDelay: "2s" }} />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <ScrollReveal>
          <AversALogoMark size={48} className="mx-auto mb-6" />
          <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
            Ready to let AI run discovery?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
            Create a free workspace, connect your next client call, and watch AversA
            turn conversation into requirements, estimates, and tasks.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500 active:scale-[0.98] sm:w-auto"
            >
              Create free workspace
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10 sm:w-auto"
            >
              Sign in
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
