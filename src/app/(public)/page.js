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
