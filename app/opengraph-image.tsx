import { ImageResponse } from "next/og";

/**
 * The social share image, generated at build time by next/og.
 *
 * This replaces the old `public/jbc-og.svg`. Facebook, WhatsApp, LinkedIn and
 * X do not render SVG previews, so an SVG og:image produced a blank card.
 * ImageResponse renders a real PNG from this markup on the server, and the
 * `app/opengraph-image.tsx` filename wires the og:image tag automatically.
 */
export const alt = "JBC Skin Cream — natural healing for the whole family";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "90px",
          background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div
            style={{
              width: 104,
              height: 104,
              borderRadius: 52,
              background: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#2E7D32",
              fontSize: 54,
              fontWeight: 700,
            }}
          >
            J
          </div>
          <div
            style={{
              fontSize: 82,
              fontWeight: 700,
              letterSpacing: "-0.03em",
            }}
          >
            JBC Skin Cream
          </div>
        </div>

        <div
          style={{
            marginTop: 44,
            fontSize: 44,
            lineHeight: 1.25,
            maxWidth: 920,
            color: "#E8F5E9",
          }}
        >
          Natural healing for the whole family
        </div>

        <div style={{ marginTop: 36, display: "flex", gap: 18, fontSize: 26 }}>
          <span
            style={{
              background: "#F9C922",
              color: "#1F2933",
              padding: "12px 28px",
              borderRadius: 999,
            }}
          >
            All-natural herbs
          </span>
          <span
            style={{
              background: "rgba(255,255,255,0.16)",
              color: "#ffffff",
              padding: "12px 28px",
              borderRadius: 999,
            }}
          >
            Antifungal
          </span>
          <span
            style={{
              background: "rgba(255,255,255,0.16)",
              color: "#ffffff",
              padding: "12px 28px",
              borderRadius: 999,
            }}
          >
            Safe for kids and adults
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
