import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt =
  "AversA — Autonomous AI Product & Project Management Agent for the Software Development Lifecycle (SDLC)";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #07090F 0%, #0F172A 50%, #1E3A8A 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          padding: "60px 80px",
          position: "relative",
        }}
      >
        {/* Glow ambient background circles */}
        <div
          style={{
            position: "absolute",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(37,99,235,0.35) 0%, rgba(0,0,0,0) 70%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />

        {/* Top category Pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: "rgba(37,99,235,0.20)",
            border: "1px solid rgba(96,165,250,0.4)",
            borderRadius: "9999px",
            padding: "8px 24px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: "#38BDF8",
            }}
          />
          <span
            style={{
              color: "#93C5FD",
              fontSize: "17px",
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Autonomous AI for Software Development Lifecycle (SDLC)
          </span>
        </div>

        {/* Brand Name Wordmark */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            fontSize: "94px",
            fontWeight: 900,
            letterSpacing: "-0.04em",
            marginBottom: "16px",
          }}
        >
          <span style={{ color: "#3B82F6" }}>A</span>
          <span style={{ color: "#FFFFFF" }}>vers</span>
          <span style={{ color: "#3B82F6" }}>A</span>
        </div>

        {/* Main Title / Keywords */}
        <div
          style={{
            fontSize: "36px",
            fontWeight: 800,
            color: "#F8FAFC",
            textAlign: "center",
            maxWidth: "1020px",
            lineHeight: 1.25,
            marginBottom: "14px",
          }}
        >
          Product Management Agent & Project Management Agent
        </div>

        {/* Value Proposition */}
        <div
          style={{
            fontSize: "22px",
            fontWeight: 500,
            color: "#CBD5E1",
            textAlign: "center",
            maxWidth: "920px",
            lineHeight: 1.4,
            marginBottom: "32px",
          }}
        >
          Turn client discovery meetings into verified PRDs, scope baselines, and sprint tasks across the entire SDLC.
        </div>

        {/* Feature Badges */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            color: "#94A3B8",
            fontSize: "16px",
            fontWeight: 700,
          }}
        >
          <span
            style={{
              background: "rgba(255,255,255,0.06)",
              padding: "6px 16px",
              borderRadius: "8px",
              color: "#E2E8F0",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            Product Management Agent
          </span>
          <span style={{ color: "#3B82F6" }}>•</span>
          <span
            style={{
              background: "rgba(255,255,255,0.06)",
              padding: "6px 16px",
              borderRadius: "8px",
              color: "#E2E8F0",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            Project Management Agent
          </span>
          <span style={{ color: "#3B82F6" }}>•</span>
          <span
            style={{
              background: "rgba(255,255,255,0.06)",
              padding: "6px 16px",
              borderRadius: "8px",
              color: "#E2E8F0",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            SDLC Requirements Engine
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
