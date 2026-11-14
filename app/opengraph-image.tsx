import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { brandHex } from "@/lib/brand";
import { site } from "@/lib/site";

export const alt = `${site.name}: ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The social preview image, generated at build time from lib/site.ts. */
export default async function Image() {
  // Read inside the function, not at import time: pages import this module for its metadata
  // (alt, size), and on Cloudflare Workers there is no project folder to read from at runtime.
  const wordmark = await readFile(
    join(process.cwd(), "public/brand/chitech-cllct-wordmark-v2.png"),
  );
  const wordmarkSrc = `data:image/png;base64,${wordmark.toString("base64")}`;
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: brandHex.paper,
        color: brandHex.ink,
      }}
    >
      {/* biome-ignore lint/performance/noImgElement: next/og renders plain img elements */}
      <img src={wordmarkSrc} alt="" width={330} height={40} />
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 40, height: 5, background: brandHex.orange }} />
          <div
            style={{
              fontSize: 26,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: brandHex.muted,
            }}
          >
            {site.name}
          </div>
        </div>
        <div
          style={{
            fontSize: 92,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: -3,
            maxWidth: 1000,
          }}
        >
          {site.tagline}
        </div>
      </div>
      <div style={{ display: "flex", gap: 14 }}>
        {[brandHex.orange, brandHex.teal, brandHex.green, brandHex.yellow].map(
          (color) => (
            <div
              key={color}
              style={{ width: 120, height: 14, background: color }}
            />
          ),
        )}
      </div>
    </div>,
    size,
  );
}
