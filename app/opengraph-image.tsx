import { ImageResponse } from "next/og";

export const alt = "paytrak - Suivi de bulletins de paie";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Donnees fictives, uniquement decoratives.
const MOIS = [
  [190, 214],
  [205, 226],
  [200, 238],
  [232, 250],
  [246, 270],
  [258, 292],
];

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #0b1a3a 0%, #12295a 100%)",
          padding: "72px",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: 1 }}>
          <div style={{ display: "flex", fontSize: 128, fontWeight: 700, letterSpacing: -3 }}>
            <span>pay</span>
            <span style={{ color: "#f0601e" }}>trak</span>
          </div>
          <div style={{ display: "flex", fontSize: 46, fontWeight: 600, marginTop: 8 }}>
            Comprends. Suis. Progresse.
          </div>
          <div style={{ display: "flex", fontSize: 30, color: "#9fb0d6", marginTop: 20 }}>
            Suivi de bulletins de paie
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", width: 440 }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              width: 400,
              height: 320,
              padding: "24px 24px 0 24px",
              borderBottom: "2px solid #3a528c",
            }}
          >
            {MOIS.map((m, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-end" }}>
                <div style={{ width: 22, height: m[0], background: "#4a68b4", borderRadius: "4px 4px 0 0", marginRight: 4 }} />
                <div style={{ width: 22, height: m[1], background: "#f0601e", borderRadius: "4px 4px 0 0" }} />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", fontSize: 22, color: "#7f93c4", marginTop: 16 }}>
            Exemple fictif
          </div>
        </div>
      </div>
    ),
    size
  );
}
