import Link from "next/link";

export const metadata = {
  title: "Privacy Policy",
  description:
    "Enterprise data protection, AI confidentiality, and privacy practices for AversA AI Product & Project Management Agent platform.",
  alternates: {
    canonical: "https://aversa.ai/privacy",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPage() {
  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    day: "numeric",
  });

  return (
    <div className="bg-white text-gray-700 px-6 py-32 sm:py-40 lg:px-8 selection:bg-blue-600 selection:text-white">
      <div className="mx-auto max-w-3xl text-sm leading-relaxed">
        <span className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">
          Security & Compliance
        </span>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
          AversA Privacy Policy
        </h1>
        <p className="mt-2 text-xs text-gray-500">Last updated: {currentDate}</p>

        <div className="mt-8 space-y-8 text-xs sm:text-sm text-gray-700">
          <section>
            <h2 className="text-base font-bold text-gray-950 mb-2">1. Overview & Commitment</h2>
            <p className="leading-relaxed text-gray-600">
              AversA Platform Inc. (&ldquo;AversA&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) operates an autonomous AI Product Management and Project Management Agent designed to assist engineering teams, product managers, and agencies throughout the Software Development Lifecycle (SDLC). We respect your privacy and enforce stringent enterprise controls across all customer data.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-950 mb-2">2. Information We Collect</h2>
            <div className="space-y-3 leading-relaxed text-gray-600">
              <p>
                <strong>Account Credentials:</strong> Full name, organizational email address, cryptographic password hashes, company affiliation, and assigned role permissions.
              </p>
              <p>
                <strong>Discovery & Project Artifacts:</strong> Client discovery questionnaires, stage-gate matrices, interview notes, PRDs, technical estimates, scope baseline snapshots, and requirement-linked task boards.
              </p>
              <p>
                <strong>Audio & Meeting Diarization Data:</strong> When you connect meeting intelligence features, we process meeting transcripts and audio segments solely to extract requirements and action items for your organization.
              </p>
              <p>
                <strong>Integration Metadata:</strong> When connecting third-party services such as Google Calendar or Google Meet, we access event dates, availability windows, and participant emails solely to facilitate calendar coordination.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-950 mb-2">3. AI Data Handling & Model Training Policy</h2>
            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-xs leading-relaxed text-blue-900">
              <p className="font-semibold mb-1">Zero Training on Customer Data:</p>
              <p>
                AversA does NOT use your confidential client conversations, discovery transcripts, project specs, or proprietary business logic to train public or shared foundation AI models. Your project intelligence is isolated to your organization tenant.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-950 mb-2">4. Google API User Data Policy Compliance</h2>
            <p className="leading-relaxed text-gray-600">
              AversA&apos;s use and transfer of information received from Google APIs adheres to the{" "}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline"
              >
                Google API Services User Data Policy
              </a>
              , including Limited Use requirements. We request only the minimal calendar scopes necessary to verify invitee availability and schedule alignment sessions.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-950 mb-2">5. Multi-Tenant Isolation & Data Encryption</h2>
            <p className="leading-relaxed text-gray-600">
              Every organization operates within strict tenant boundaries enforced at database and application levels. All data in transit is protected using TLS 1.3 encryption, and data at rest is secured using AES-256 standards.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-950 mb-2">6. Your Rights Under GDPR & CCPA</h2>
            <p className="leading-relaxed text-gray-600">
              Regardless of your geographic location, you retain full rights to access, rectify, export, or permanently delete your account and associated organization artifacts. You may also configure cookie preferences at any time via our{" "}
              <Link href="/consent" className="text-blue-600 underline">
                Cookie & Consent Settings
              </Link>.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-950 mb-2">7. Contact the Security Team</h2>
            <p className="leading-relaxed text-gray-600">
              For security disclosures, data subject access requests, or compliance inquiries, please email our data protection team directly at{" "}
              <a href="mailto:privacy@aversa.ai" className="font-mono text-blue-600 hover:underline">
                privacy@aversa.ai
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
