import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#022c22",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "serif",
          fontWeight: 700,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
          }}
        >
          <div style={{ fontSize: 90, lineHeight: 1, color: "#f59e0b" }}>
            ♠
          </div>
          <div style={{ fontSize: 42, lineHeight: 1, color: "#f8fafc" }}>
            CS
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
