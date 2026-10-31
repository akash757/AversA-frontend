import Link from "next/link";

export const metadata = {
  title: "Terms of Service & User Agreement",
  description:
    "Terms of service, acceptable use guidelines, and software licensing agreement for AversA AI Product & Project Management Agent platform.",
  alternates: {
    canonical: "https://aversa.ai/terms",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsPage() {
  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    day: "numeric",
  });

  return (
    <div className="bg-white text-gray-700 px-6 py-32 sm:py-40 lg:px-8 selection:bg-blue-600 selection:text-white">
      <div className="mx-auto max-w-3xl text-sm leading-relaxed">
        <span className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">
          Legal & Governance
        </span>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
          Terms of Service
        </h1>
        <p className="mt-2 text-xs text-gray-500">Last updated: {currentDate}</p>

        <div className="mt-8 space-y-8 text-xs sm:text-sm text-gray-700">
          <section>
            <h2 className="text-base font-bold text-gray-950 mb-2">1. Agreement to Terms</h2>
            <p className="leading-relaxed text-gray-600">
              By accessing, registering for, or using the AversA platform (&ldquo;Service&rdquo;), you enter into a legally binding agreement with AversA Platform Inc. (&ldquo;AversA&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;). If you are using the Service on behalf of an enterprise or organization, you represent that you have authority to bind that entity to these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-950 mb-2">2. Scope of Service & License Grant</h2>
            <p className="leading-relaxed text-gray-600">
              AversA provides an autonomous AI Product Management and Project Management Agent platform that automates discovery question workflows, audio diarization analysis, PRD authoring, scope baseline protection, and sprint task generation across the Software Development Lifecycle (SDLC). Subject to these Terms, AversA grants you a non-exclusive, non-transferable, revocable license to access the platform.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-950 mb-2">3. Intellectual Property & AI Output Ownership</h2>
            <div className="space-y-3 leading-relaxed text-gray-600">
              <p>
                <strong>Customer Ownership:</strong> You retain complete ownership, rights, and title to all customer data, audio recordings, discovery inputs, generated PRDs, task backlogs, and work items produced by AversA for your workspace.
              </p>
              <p>
                <strong>Platform IP:</strong> AversA and its licensors retain all rights, title, and interest in and to the platform codebase, algorithmic agents, UI components, discovery templates, and proprietary taxonomies.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-950 mb-2">4. User Responsibilities & Acceptable Use</h2>
            <p className="leading-relaxed text-gray-600">
              You agree not to: (a) reverse-engineer or decompile any portion of the AversA agent framework; (b) upload unlawful, harmful, or copyright-infringing materials; (c) attempt unauthorized access to other tenant organizations; or (d) interfere with the network infrastructure or API rate limits.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-950 mb-2">5. Service Availability & SLA</h2>
            <p className="leading-relaxed text-gray-600">
              AversA targets a 99.9% monthly uptime SLA for production enterprise tiers. Planned maintenance is communicated in advance, and status updates are provided via our operational monitors.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-950 mb-2">6. Limitation of Liability</h2>
            <p className="leading-relaxed text-gray-600">
              To the maximum extent permitted by applicable law, AversA will not be liable for any indirect, incidental, punitive, or consequential damages arising from the use of or inability to use the platform. AI-generated proposals and estimates serve as decision support tools and should be reviewed by qualified project managers before commercial execution.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-950 mb-2">7. Governing Law & Dispute Resolution</h2>
            <p className="leading-relaxed text-gray-600">
              These Terms will be governed by and construed in accordance with the laws of the State of Delaware, without regard to conflict of law principles.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
