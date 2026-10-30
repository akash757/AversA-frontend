"use client";

import { useEffect, useState } from "react";
import AversALogo from "@/components/Ui/AversALogo";

interface LoaderProps {
  message?: string;
  showProgress?: boolean;
}

const MESSAGES = [
  "Synchronizing project workspace...",
  "Compiling discovery matrix...",
  "Calibrating system parameters...",
  "Finalizing workspace state...",
];

export default function Loader({ message, showProgress = true }: LoaderProps) {
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState("");

  useEffect(() => {
    const id = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 350);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!showProgress) return;
    const id = setInterval(() => {
      setProgress((p) => {
        const next = p + Math.random() * 4.2;
        if (next >= 100) {
          clearInterval(id);
          return 100;
        }
        return next;
      });
    }, 70);
    return () => clearInterval(id);
  }, [showProgress]);

  const msgIndex = progress > 80 ? 3 : progress > 50 ? 2 : progress > 20 ? 1 : 0;
  const displayMsg = message ?? MESSAGES[msgIndex];
  const pct = Math.floor(progress);

  return (
    <>
      <style>{`
        @keyframes orv-spin   { to { transform: rotate(360deg);  } }
        @keyframes orv-spinR  { to { transform: rotate(-360deg); } }
        @keyframes orv-pulse  { 0% { transform: scale(0.9); opacity: 0.6; } 100% { transform: scale(1.6); opacity: 0; } }
        @keyframes orv-sweep  { 0% { left: -50%; } 100% { left: 130%; } }
      `}</style>

      <div
        role="status"
        aria-label="Loading"
        className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-md font-sans"
      >
        {/* Subtle dot grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, #000000 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Center container */}
        <div className="relative flex flex-col items-center gap-6 p-8 rounded-3xl border border-gray-200 bg-white shadow-2xl shadow-blue-500/5 max-w-sm w-full mx-4 text-center">
          {/* Logo animation container */}
          <div className="relative w-20 h-20 flex items-center justify-center">
            {/* Outer spinning ring */}
            <div
              className="absolute inset-0 rounded-full border border-gray-200 border-t-[#2563EB]"
              style={{ animation: "orv-spin 1.8s linear infinite" }}
            />
            {/* Inner counter-spinning ring */}
            <div
              className="absolute inset-2 rounded-full border border-gray-100 border-b-cyan-500"
              style={{ animation: "orv-spinR 2.2s linear infinite" }}
            />
            {/* Center icon */}
            <div className="relative z-10 scale-90">
              <AversALogo size="sm" showTagline={false} />
            </div>
          </div>

          {/* Status Message */}
          <div className="space-y-1 w-full">
            <p className="text-xs font-semibold tracking-wider text-gray-800 uppercase font-mono">
              {displayMsg}
              <span className="inline-block w-4 text-left text-[#2563EB]">{dots}</span>
            </p>
            <p className="text-[11px] text-gray-500">The Intelligent Product Discovery Platform</p>
          </div>

          {/* Progress bar */}
          {showProgress && (
            <div className="w-full space-y-2">
              <div className="relative h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#2563EB] to-cyan-500 rounded-full transition-all duration-150"
                  style={{ width: `${pct}%` }}
                />
                <div
                  className="absolute top-0 bottom-0 w-1/3 bg-gradient-to-r from-transparent via-white/60 to-transparent"
                  style={{ animation: "orv-sweep 1.6s cubic-bezier(0.4, 0, 0.2, 1) infinite" }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono text-gray-400 px-0.5">
                <span>LOADING</span>
                <span className="text-[#2563EB] font-semibold">{pct}%</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
