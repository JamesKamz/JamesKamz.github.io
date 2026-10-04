import { ImageResponse } from "next/og";
import { getSettings } from "@/lib/content";
import { loc, locList } from "@/lib/types";

export const alt = "James Kamz — SaaS Builder, Full-Stack Engineer, Odoo Developer, Automation Expert";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const settings = await getSettings();
  const titles = locList(settings, "titles", locale);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "#0a0c0f", color: "#efebe2", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 26, color: "#3ddc97" }}>
          <div style={{ display: "flex", width: 56, height: 56, borderRadius: 12, background: "#f5a524", color: "#14100a", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 700 }}>JK</div>
          $ whoami
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 120, fontWeight: 700, letterSpacing: -4, lineHeight: 1 }}>
            {settings.alias}
            <span style={{ color: "#f5a524" }}>.</span>
          </div>
          <div style={{ display: "flex", marginTop: 24, fontSize: 30, color: "#f5a524" }}>{titles.join(" · ")}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, color: "#959ba5" }}>
          <span>{loc(settings, "location", locale)} · remote</span>
          <span>jameskamz.com</span>
        </div>
      </div>
    ),
    size,
  );
}
