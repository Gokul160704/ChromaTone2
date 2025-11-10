import React from "react";

type Props = {
  children: React.ReactNode;
  /** Height of the top beige band (in viewport height) */
  bandVh?: number;
  /** Base page background color */
  baseColor?: string;
  /** Band (wave) color */
  bandColor?: string;
};

/**
 * Global background wrapper:
 * - Soft beige base
 * - Solid beige band starting at the top
 * - Curved bottom edge (wave)
 * - Subtle left→right depth gradient
 * Wrap <Routes> or your page content with this to apply everywhere.
 */
export default function WaveBackground({
  children,
  bandVh = 42,
  baseColor = "#F6EFE8",
  bandColor = "#CDB099",
}: Props) {
  return (
    <div
      className="relative min-h-screen overflow-x-hidden"
      style={{ backgroundColor: baseColor }}
    >
      {/* Top band with curved bottom (wave) */}
      <div
        className="absolute inset-x-0 top-0 z-0"
        style={{ height: `${bandVh}vh`, pointerEvents: "none" }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          viewBox="0 0 1440 400"
          width="100%"
          height="100%"
          style={{ display: "block", filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.08))" }}
        >
          <path
            fill={bandColor}
            d="
              M0,0
              H1440
              V240
              C1320,230 1180,225 1060,235
              C920,247 830,275 700,290
              C520,312 320,300 0,265
              Z"
          />
        </svg>

        {/* soft depth gradient across the band */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.06) 35%, rgba(0,0,0,0.02) 70%, rgba(0,0,0,0) 100%)",
          }}
        />
      </div>

      {/* All pages render above the background */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
