import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | AversA",
  description: "Privacy policy and enterprise data handling practices for AversA.",
};

export default function PrivacyPage() {
  return (
    <div className="bg-white text-gray-700 px-6 py-32 sm:py-40 lg:px-8 selection:bg-blue-600 selection:text-white">
      <div className="mx-auto max-w-3xl text-sm leading-relaxed">
        <span className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">
          Security & Privacy
        </span>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
          AversA Privacy Policy
        </h1>
        <p className="mt-2 text-xs text-gray-500">
          Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric", day: "numeric" })}
        </p>

        <div className="mt-8 space-y-8 text-xs sm:text-sm text-gray-700">
          <section>
            <h2 className="text-lg font-bold text-gray-950 mb-2">1. Information We Collect</h2>
            <p className="leading-relaxed text-gray-600">
              When you use AversA, we collect your name, business email, organization affiliation, and credentials. When scheduling alignment meetings, we collect calendar event metadata and participant email addresses to generate Google Meet rooms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-950 mb-2">2. How We Use Project Information</h2>
            <p className="leading-relaxed text-gray-600">
              Project discovery answers, notes, and question statuses belong exclusively to your organization tenant. AversA does not sell, market, or share your proprietary discovery questions or requirements with third parties.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-950 mb-2">3. Google Calendar & Meet Integration</h2>
            <p className="leading-relaxed text-gray-600">
              When you connect Google Calendar, AversA requests permissions solely to check participant availability and schedule Google Meet sessions on your behalf. Token storage is strictly encrypted at rest and in transit.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-950 mb-2">4. Data Isolation & Security</h2>
            <p className="leading-relaxed text-gray-600">
              Each organization operates within strict tenant boundaries. All communications are protected using TLS 1.3 encryption.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
