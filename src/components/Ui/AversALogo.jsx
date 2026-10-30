import React from "react";

/**
 * AversA Emblem Logomark
 * Symmetrical twin-A geometric prism representing convergence, client discovery,
 * and autonomous AI execution.
 */
export function AversALogoMark({ size = 36, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 drop-shadow-[0_2px_10px_rgba(37,99,235,0.28)] ${className}`}
      aria-label="AversA Logo Mark"
    >
      <defs>
        <linearGradient id="aversa-grad-primary" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="35%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
        <linearGradient id="aversa-grad-secondary" x1="42" y1="6" x2="6" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="50%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1E40AF" />
        </linearGradient>
        <linearGradient id="aversa-core-glow" x1="18" y1="18" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#93C5FD" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
        <filter id="aversa-glow-filter" x="12" y="12" width="24" height="24" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Outer Modern Hex-Prism Shield */}
      <path
        d="M24 3.5L42 13.8V34.2L24 44.5L6 34.2V13.8L24 3.5Z"
        stroke="url(#aversa-grad-primary)"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />

      {/* Left Apex "A" Silhouette Pillar */}
      <path
        d="M14 36L22 13H26L34 36H28.5L26.8 30.5H21.2L19.5 36H14Z"
        fill="url(#aversa-grad-secondary)"
        fillOpacity="0.14"
      />

      {/* Twin Dynamic "A" Vectors (Dual Apex Convergence) */}
      {/* Primary Left Chevron of the "A" */}
      <path
        d="M24 10L14 34H19.5L24 23L28.5 34H34L24 10Z"
        stroke="url(#aversa-grad-primary)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Reciprocal Horizontal Crossbar & AI Convergence Bridge */}
      <path
        d="M17.5 27.5H30.5"
        stroke="url(#aversa-grad-primary)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* Central Neural Pulse / Discovery Nexus */}
      <circle cx="24" cy="24" r="3.5" fill="url(#aversa-core-glow)" filter="url(#aversa-glow-filter)" />
      <circle cx="24" cy="24" r="1.6" fill="#FFFFFF" />

      {/* Micro-alignment Accents on Vertices */}
      <circle cx="24" cy="5" r="1.4" fill="#38BDF8" />
      <circle cx="24" cy="43" r="1.4" fill="#4F46E5" />
    </svg>
  );
}

/**
 * AversA Brand Header & Wordmark
 * Displays "AversA" with first and last 'A' capitalized, stylized typography, and optional tagline.
 */
export default function AversALogo({
  size = "md",
  showText = true,
  showTagline = false,
  inverted = false,
  className = "",
  textClassName = "",
}) {
  const markSizes = {
    xs: 24,
    sm: 28,
    md: 36,
    lg: 44,
    xl: 56,
  };

  const fontSizes = {
    xs: "text-base",
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
  };

  const markSize = markSizes[size] || 36;
  const fontSize = fontSizes[size] || "text-xl";

  const primaryLetterColor = inverted ? "text-blue-400" : "text-[#2563EB]";
  const middleLetterColor = inverted ? "text-white" : "text-gray-950";
  const taglineColor = inverted ? "text-gray-400" : "text-gray-500";

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <AversALogoMark size={markSize} />
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span
              className={`font-black tracking-tight font-sans ${fontSize} ${textClassName} inline-flex items-baseline`}
            >
              {/* First Capital 'A' */}
              <span className={`${primaryLetterColor} font-black`}>A</span>
              {/* Lowercase 'vers' */}
              <span className={`${middleLetterColor} font-extrabold tracking-tight`}>vers</span>
              {/* Last Capital 'A' */}
              <span className={`${primaryLetterColor} font-black`}>A</span>
            </span>
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
          </div>
          {showTagline && (
            <span className={`text-[10px] uppercase font-bold tracking-wider ${taglineColor} mt-0.5`}>
              AI Product Intelligence
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Named alias for backward compatibility
export { AversALogo as OrvaneLogo, AversALogoMark as OrvaneLogoMark };

