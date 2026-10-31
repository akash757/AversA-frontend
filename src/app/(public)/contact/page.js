import Link from "next/link";
import ContactForm from "@/components/contact/ContactForm";
import {
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  BuildingOfficeIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

export const metadata = {
  title: "Contact Us | AversA AI Product & Project Management Agent",
  description:
    "Contact the AversA team for platform walkthroughs, enterprise discovery matrix deployments, or AI agent support across the software development lifecycle (SDLC).",
  alternates: {
    canonical: "https://aversa.ai/contact",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const contactJsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "name": "Contact AversA",
  "url": "https://aversa.ai/contact",
  "description":
    "Get in touch with AversA support and enterprise advisors for AI product management and project management solutions.",
  "mainEntity": {
    "@type": "Organization",
    "name": "AversA Platform Inc.",
    "url": "https://aversa.ai",
    "email": "contact@aversa.ai",
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "email": "contact@aversa.ai",
        "contactType": "customer service",
        "availableLanguage": "English",
      },
      {
        "@type": "ContactPoint",
        "email": "enterprise@aversa.ai",
        "contactType": "sales",
        "availableLanguage": "English",
      },
    ],
  },
};

export default function ContactPage() {
  return (
    <div className="relative min-h-screen bg-white text-gray-900 selection:bg-blue-600 selection:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />
      <section className="relative z-10 pt-32 pb-20 sm:pt-40 sm:pb-28 bg-gradient-to-b from-blue-50/50 via-white to-gray-50/30">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">
              Get in Touch
            </span>
            <h1 className="mt-3 text-3xl sm:text-5xl font-black tracking-tight text-gray-950">
              Contact AversA Support & Sales
            </h1>
            <p className="mt-3 text-xs sm:text-sm text-gray-600 leading-relaxed">
              Have questions about deploying our AI Product Management Agent, customizing discovery taxonomies, or integrating Google Meet with your SDLC workflows? We are here to help.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Contact Info Cards */}
            <div className="space-y-4">
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xs">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB] border border-blue-200">
                    <EnvelopeIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-950">Direct Email Support</h3>
                    <p className="text-[11px] text-gray-500">Fast response within 2 hours</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  Drop our product operations team a message anytime for technical questions, billing inquiries, or feedback.
                </p>
                <a
                  href="mailto:contact@aversa.ai"
                  className="mt-3 inline-block font-mono text-xs font-semibold text-[#2563EB] hover:underline"
                >
                  contact@aversa.ai
                </a>
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xs">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 border border-sky-200">
                    <ChatBubbleLeftRightIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-950">Product Walkthrough</h3>
                    <p className="text-[11px] text-gray-500">Live 1-on-1 discovery tour</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  Book a walkthrough to see our AI Product Management Agent turn real meeting transcripts into verified PRDs and sprint roadmaps.
                </p>
                <Link
                  href="/signup"
                  className="mt-3 inline-block text-xs font-semibold text-[#2563EB] hover:underline"
                >
                  Launch free workspace →
                </Link>
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xs">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                    <BuildingOfficeIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-950">Enterprise Solutions</h3>
                    <p className="text-[11px] text-gray-500">Dedicated VPC & SAML SSO</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  Custom discovery matrix taxonomies, dedicated LLM fine-tuning, SLA guarantees, and enterprise procurement.
                </p>
                <a
                  href="mailto:enterprise@aversa.ai"
                  className="mt-3 inline-block font-mono text-xs font-semibold text-emerald-700 hover:underline"
                >
                  enterprise@aversa.ai
                </a>
              </div>

              <div className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-gray-50/80 px-4 py-3 text-xs text-gray-500">
                <ClockIcon className="h-4 w-4 text-gray-400 shrink-0" />
                <span>Support team active 24/7 across US, Europe, and Asia-Pacific timezones.</span>
              </div>
            </div>

            {/* Form */}
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
}
