import Link from "next/link";

export const metadata = {
  title: "Terms of Service | AversA",
  description: "Terms and conditions for using the AversA platform.",
};

export default function TermsPage() {
  return (
    <div className="bg-white text-gray-700 px-6 py-32 sm:py-40 lg:px-8 selection:bg-blue-600 selection:text-white">
      <div className="mx-auto max-w-3xl text-sm leading-relaxed">
        <span className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">
          Legal Agreement
        </span>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
          Terms of Service
        </h1>
        <p className="mt-2 text-xs text-gray-500">
          Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric", day: "numeric" })}
        </p>

        <div className="mt-8 space-y-8 text-xs sm:text-sm text-gray-700">
          <section>
            <h2 className="text-lg font-bold text-gray-950 mb-2">1. Terms Acceptance</h2>
            <p className="leading-relaxed text-gray-600">
              By accessing or using the AversA platform, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-950 mb-2">2. Use License & Intellectual Property</h2>
            <p className="leading-relaxed text-gray-600">
              AversA grants you a revocable, non-exclusive, non-transferable license to use our platform to manage client discovery, alignment meetings, and project delivery in accordance with your subscription tier.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-950 mb-2">3. User Accounts & Responsibilities</h2>
            <p className="leading-relaxed text-gray-600">
              You are responsible for safeguarding your credentials and for all activities that occur under your account. You agree not to misuse the service or access accounts without authorization.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-950 mb-2">4. Disclaimers & Limitations</h2>
            <p className="leading-relaxed text-gray-600">
              AversA services are provided &apos;as is&apos;. While we strive for 99.9% uptime and accurate synchronization with calendar APIs, we make no express warranties beyond our service level agreements.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
