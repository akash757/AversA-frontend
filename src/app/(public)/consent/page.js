import Link from "next/link";
import ConsentManager from "@/components/consent/ConsentManager";

export const metadata = {
  title: "Cookie Policy & User Consent Preferences",
  description:
    "Review and customize your cookie preferences and consent settings for the AversA AI Product & Project Management Agent platform.",
  alternates: {
    canonical: "https://aversa.ai/consent",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ConsentPage() {
  return (
    <div className="bg-white text-gray-700 px-6 py-32 sm:py-40 lg:px-8 selection:bg-blue-600 selection:text-white">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 text-center sm:text-left">
          <span className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">
            Privacy & Compliance
          </span>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
            Cookie Policy & Consent Settings
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-gray-600 leading-relaxed">
            AversA is engineered with privacy-by-design principles. We use minimal cookies necessary to deliver secure sessions, maintain your organization workspace state, and understand platform reliability across the software development lifecycle (SDLC).
          </p>
        </div>

        <div className="space-y-10">
          <ConsentManager />

          <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-6 space-y-4 text-xs sm:text-sm text-gray-600">
            <h2 className="text-sm font-bold text-gray-950">
              How AversA Treats Client & Proprietary Data
            </h2>
            <p className="leading-relaxed">
              We strictly uphold enterprise boundaries. Meeting transcripts, audio recordings, discovery questionnaires, and generated PRD documents are never shared with advertising networks or used to train third-party public models.
            </p>
            <p className="leading-relaxed">
              For complete details regarding our data storage practices, tenant encryption, and GDPR/CCPA consumer rights, please visit our{" "}
              <Link href="/privacy" className="font-semibold text-blue-600 hover:underline">
                Privacy Policy
              </Link>{" "}
              or review our{" "}
              <Link href="/terms" className="font-semibold text-blue-600 hover:underline">
                Terms of Service
              </Link>.
            </p>
            <p className="pt-2 text-xs text-gray-500">
              Questions regarding cookies or data requests? Contact our compliance team at{" "}
              <a
                href="mailto:privacy@aversa.ai"
                className="font-mono text-blue-600 hover:underline"
              >
                privacy@aversa.ai
              </a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
