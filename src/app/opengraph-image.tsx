import { ImageResponse } from "next/og";
import { metrics } from "@/lib/data";

export const runtime = "edge";
export const alt = "ghosts.spot2.mx";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG() {
  const value = `$${metrics.revenue_lost_mxn.toLocaleString("es-MX")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "radial-gradient(ellipse at top, rgba(239,68,68,0.18), transparent 50%), #0A0A0B",
          padding: "64px",
          color: "#fafafa",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              background: "#EF4444",
              boxShadow: "0 0 24px #EF4444",
            }}
          />
          <span style={{ fontSize: 26, color: "#A1A1AA", fontWeight: 500 }}>
            ghosts.spot2.mx
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <span
            style={{
              fontSize: 26,
              color: "#A1A1AA",
              textTransform: "uppercase",
              letterSpacing: 4,
              fontWeight: 500,
            }}
          >
            Comisión perdida · feb–abr 2026
          </span>
          <span
            style={{
              fontSize: 168,
              color: "#EF4444",
              fontWeight: 600,
              letterSpacing: -6,
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {value}
          </span>
          <span style={{ fontSize: 32, color: "#FAFAFA", maxWidth: 1000 }}>
            {metrics.total_ghosts.toLocaleString("es-MX")} conversaciones reales que nunca llegaron a un broker.
          </span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            color: "#71717A",
            fontSize: 18,
            borderTop: "1px solid #27272A",
            paddingTop: 16,
          }}
        >
          <span>Prototipo de validación · Spot2 Producto</span>
          <span style={{ fontVariantNumeric: "tabular-nums" }}>4 may 2026</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
