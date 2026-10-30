import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "AversA — AI Product Management & Client Discovery Platform";
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
          background: "linear-gradient(135deg, #090D16 0%, #0F172A 45%, #1E3A8A 100%)",
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
        {/* Glow ambient background */}
        <div
          style={{
            position: "absolute",
            width: "560px",
            height: "560px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(37,99,235,0.32) 0%, rgba(0,0,0,0) 70%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />

        {/* Category Pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: "rgba(37,99,235,0.18)",
            border: "1px solid rgba(96,165,250,0.35)",
            borderRadius: "9999px",
            padding: "8px 24px",
            marginBottom: "28px",
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
              fontSize: "18px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Autonomous Product Intelligence Platform
          </span>
        </div>

        {/* Brand Name Wordmark */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            fontSize: "96px",
            fontWeight: 900,
            letterSpacing: "-0.04em",
            marginBottom: "18px",
          }}
        >
          <span style={{ color: "#3B82F6" }}>A</span>
          <span style={{ color: "#FFFFFF" }}>vers</span>
          <span style={{ color: "#3B82F6" }}>A</span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "32px",
            fontWeight: 700,
            color: "#F1F5F9",
            textAlign: "center",
            maxWidth: "960px",
            lineHeight: 1.3,
            marginBottom: "26px",
          }}
        >
          Turn Client Discovery Conversations into Shipped Products
        </div>

        {/* Feature Badges */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            color: "#94A3B8",
            fontSize: "18px",
            fontWeight: 600,
          }}
        >
          <span style={{ color: "#CBD5E1" }}>Day 1 Discovery</span>
          <span style={{ color: "#3B82F6" }}>•</span>
          <span style={{ color: "#CBD5E1" }}>Requirements Engine</span>
          <span style={{ color: "#3B82F6" }}>•</span>
          <span style={{ color: "#CBD5E1" }}>Google Meet Alignment</span>
          <span style={{ color: "#3B82F6" }}>•</span>
          <span style={{ color: "#CBD5E1" }}>Sprint Roadmaps</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

