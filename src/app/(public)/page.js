"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Loader from "@/components/Ui/Loader";
import Hero from "@/components/landing/Hero";
import TrustStrip from "@/components/landing/TrustStrip";
import ProblemSolution from "@/components/landing/ProblemSolution";
import HowWeWork from "@/components/landing/HowWeWork";
import FeatureBento from "@/components/landing/FeatureBento";
import AgentCrew from "@/components/landing/AgentCrew";
import RolesTabs from "@/components/landing/RolesTabs";
import Faq from "@/components/landing/Faq";
import FinalCta from "@/components/landing/FinalCta";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How is AversA different from a conventional project tracker?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Trackers manage tasks after they are defined. AversA acts as an autonomous AI Product Management Agent and Project Management Agent that turns ambiguous client conversations into verified requirements, estimates, proposals, and REQ-linked tasks with AI across the software development lifecycle (SDLC).",
      },
    },
    {
      "@type": "Question",
      "name": "How accurate is the AI product management agent?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "AversA’s Product Management Agent uses Gemini with context from prior meeting analyses. It surfaces requirements, risks, and gaps for human review — keeping engineering teams in full control of verified scope.",
      },
    },
    {
      "@type": "Question",
      "name": "Do I need Google Workspace to use AversA?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You can sign up with email and password. Connecting Google Calendar unlocks automatic Meet link creation, availability checks, and calendar events. AI transcript analysis works either way.",
      },
    },
    {
      "@type": "Question",
      "name": "What happens to our meeting data and SDLC artifacts?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Transcripts and analyses are stored in your organization workspace with role-based access. Organizations are strictly partitioned; customer data is never used to train public models.",
      },
    },
    {
      "@type": "Question",
      "name": "Can we customize discovery questions in the SDLC matrix?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Projects start with a battle-tested Day 1 template across eight dimensions. Product and project managers can add custom questions under any topic.",
      },
    },
    {
      "@type": "Question",
      "name": "Is AversA multi-tenant and role-aware?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Strict organization partitioning, invites, admin approvals, and roles spanning Superadmin, PM, Engineer, Designer, Client, and more.",
      },
    },
  ],
};

export default function LandingPage() {
  const router = useRouter();
  const { isLoggedIn, loading, dashboardPath } = useAuth();

  useEffect(() => {
    if (!loading && isLoggedIn && dashboardPath) {
      router.replace(dashboardPath);
    }
  }, [isLoggedIn, loading, dashboardPath, router]);

  // If already logged in, show loader while redirecting to avoid flashing public landing content
  if (isLoggedIn) {
    return <Loader />;
  }

  // If token is stored in localStorage while auth initializes, hold render
  if (loading && typeof window !== "undefined" && localStorage.getItem("accessToken")) {
    return <Loader />;
  }

  return (
    <div className="relative min-h-screen bg-white text-gray-900 selection:bg-blue-600 selection:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Hero />
      <TrustStrip />
      <ProblemSolution />
      <HowWeWork />
      <FeatureBento />
      <AgentCrew />
      <RolesTabs />
      <Faq />
      <FinalCta />
    </div>
  );
}
