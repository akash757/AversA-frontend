import { ToastProvider } from "@/components/Ui/Toast";
import { AuthProvider } from "@/providers/AuthProvider";
import "./globals.css";

export const metadata = {
  metadataBase: new URL("https://aversa.ai"),
  title: {
    default: "AversA — Autonomous AI Product & Project Management Agent | SDLC Platform",
    template: "%s | AversA AI",
  },
  description:
    "AversA is the autonomous AI product management agent and project management agent for the software development lifecycle (SDLC). Turn client discovery calls and stakeholder meetings into structured PRDs, technical estimates, frozen scope baselines, and sprint-ready user stories.",
  keywords: [
    "AversA",
    "AversA AI",
    "product management agent",
    "project management agent",
    "AI product management agent",
    "AI project management agent",
    "software development lifecycle",
    "software development lifecycle website",
    "sdl platform",
    "sdlc website",
    "PRD generator",
    "client discovery matrix",
    "requirements engineering",
    "sprint planning agent",
    "scope baseline locking",
    "meeting intelligence",
    "Google Meet discovery",
  ],
  authors: [{ name: "AversA Platform Inc.", url: "https://aversa.ai" }],
  creator: "AversA Platform Inc.",
  publisher: "AversA Platform Inc.",
  category: "technology",
  applicationName: "AversA",
  alternates: {
    canonical: "https://aversa.ai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "AversA — Autonomous AI Product & Project Management Agent | SDLC Platform",
    description:
      "Turn client discovery into shipped code. AversA provides autonomous AI product management and project management agents across the entire software development lifecycle (SDLC).",
    url: "https://aversa.ai",
    siteName: "AversA AI",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "AversA — Autonomous AI Product & Project Management Agent for the Software Development Lifecycle (SDLC)",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AversA — Autonomous AI Product & Project Management Agent | SDLC",
    description:
      "Autonomous AI product and project management agent for the software development lifecycle (SDLC). Turn discovery conversations into shipped products.",
    creator: "@aversahq",
    site: "@aversahq",
    images: ["/opengraph-image"],
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon.png", sizes: "32x32" },
    ],
    apple: [{ url: "/icon.svg" }],
  },
  manifest: "/site.webmanifest",
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://aversa.ai/#organization",
      "name": "AversA",
      "alternateName": ["AversA AI", "AversA Platform Inc."],
      "url": "https://aversa.ai",
      "logo": {
        "@type": "ImageObject",
        "url": "https://aversa.ai/aversa-logo.svg",
        "width": "512",
        "height": "512",
      },
      "sameAs": [
        "https://twitter.com/aversahq",
        "https://github.com/aversa-ai",
        "https://linkedin.com/company/aversa-ai",
      ],
      "contactPoint": [
        {
          "@type": "ContactPoint",
          "contactType": "customer support",
          "email": "contact@aversa.ai",
          "availableLanguage": ["en"],
        },
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://aversa.ai/#website",
      "url": "https://aversa.ai",
      "name": "AversA — Autonomous AI Product & Project Management Agent",
      "description":
        "The Autonomous AI Product Management Agent & Project Management Agent for the Software Development Lifecycle (SDLC).",
      "publisher": {
        "@id": "https://aversa.ai/#organization",
      },
      "inLanguage": "en-US",
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://aversa.ai/#software",
      "name": "AversA",
      "alternateName": "AversA AI Product & Project Management Agent",
      "applicationCategory": "ProjectManagementApplication",
      "operatingSystem": "All modern browsers, Cloud",
      "url": "https://aversa.ai",
      "description":
        "Autonomous AI product management agent and project management agent for the modern software development lifecycle (SDLC). Transforms client discovery meetings into verified PRDs, locked scope baselines, and sprint-ready tasks.",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
      },
      "creator": {
        "@id": "https://aversa.ai/#organization",
      },
      "featureList": [
        "Autonomous AI Product Management Agent",
        "AI Project Management Agent",
        "Software Development Lifecycle (SDLC) Automation",
        "Client Discovery Matrix & Questionnaire Engine",
        "Google Meet Audio Intelligence & Diarization",
        "Automated PRD & User Story Generation",
        "Immutable Scope Baseline Locking",
        "Technical Effort Estimation & Milestone Roadmaps",
      ],
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased font-sans">
        <ToastProvider>
          <AuthProvider>{children}</AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
