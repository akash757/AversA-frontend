"use client";

import { useEffect, useState } from "react";
import AversALogo from "@/components/Ui/AversALogo";

interface LoaderProps {
  message?: string;
  showProgress?: boolean;
  progress?: number;
  fullScreen?: boolean;
}

export default function Loader({
  message = "Loading workspace",
  showProgress = true,
  progress,
  fullScreen = true,
}: LoaderProps) {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const id = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 300);
    return () => clearInterval(id);
  }, []);

  const hasExplicitProgress = typeof progress === "number" && !Number.isNaN(progress);
  const clampedProgress = hasExplicitProgress ? Math.min(100, Math.max(0, Math.round(progress))) : null;

  const content = (
    <div className="relative flex flex-col items-center gap-5 p-7 rounded-3xl border border-gray-200 bg-white shadow-xl shadow-blue-500/5 max-w-sm w-full mx-4 text-center">
      {/* Logo animation container */}
      <div className="relative w-16 h-16 flex items-center justify-center">
        {/* Outer spinning ring */}
        <div
          className="absolute inset-0 rounded-full border-2 border-gray-100 border-t-[#2563EB]"
          style={{ animation: "orv-spin 1.2s linear infinite" }}
        />
        {/* Inner counter-spinning ring */}
        <div
          className="absolute inset-1.5 rounded-full border border-gray-100 border-b-cyan-500"
          style={{ animation: "orv-spinR 1.6s linear infinite" }}
        />
        {/* Center icon */}
        <div className="relative z-10 scale-75">
          <AversALogo size="sm" showTagline={false} />
        </div>
      </div>

      {/* Status Message */}
      <div className="space-y-0.5 w-full">
        <p className="text-xs font-semibold tracking-wider text-gray-800 uppercase font-mono">
          {message}
          <span className="inline-block w-4 text-left text-[#2563EB]">{dots}</span>
        </p>
        <p className="text-[11px] text-gray-400">AversA Product Intelligence</p>
      </div>

      {/* Progress bar */}
      {showProgress && (
        <div className="w-full space-y-1.5">
          <div className="relative h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            {hasExplicitProgress ? (
              <div
                className="h-full bg-gradient-to-r from-[#2563EB] to-cyan-500 rounded-full transition-all duration-150"
                style={{ width: `${clampedProgress}%` }}
              />
            ) : (
              <div
                className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-[#2563EB] to-cyan-400 rounded-full"
                style={{ animation: "orv-sweep 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite" }}
              />
            )}
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono text-gray-400 px-0.5">
            <span>ACTIVE</span>
            <span className="text-[#2563EB] font-semibold">
              {hasExplicitProgress ? `${clampedProgress}%` : "SYNC"}
            </span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes orv-spin   { to { transform: rotate(360deg);  } }
        @keyframes orv-spinR  { to { transform: rotate(-360deg); } }
        @keyframes orv-sweep  { 0% { left: -60%; } 100% { left: 120%; } }
      `}</style>

      {fullScreen ? (
        <div
          role="status"
          aria-label="Loading"
          className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm font-sans"
        >
          {/* Subtle dot grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle, #000000 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          {content}
        </div>
      ) : (
        <div role="status" aria-label="Loading" className="relative py-12 flex items-center justify-center w-full">
          {content}
        </div>
      )}
    </>
  );
}
