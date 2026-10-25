import Image from "next/image";

const LOGO_RATIO = 546 / 242; // intrinsic width/height of nyhl-logo.png

export default function LogoLoader({ size = 64, label = "Loading..." }: { size?: number; label?: string }) {
  const cardHeight = size;
  const cardWidth = Math.round(size * LOGO_RATIO);
  const diagonal = Math.round(Math.hypot(cardWidth, cardHeight));
  const ringSize = Math.round(diagonal * 1.18);
  const glowSize = Math.round(diagonal * 1.5);

  return (
    <div className="nyhl-loader flex flex-col items-center gap-4 py-16">
      <div className="relative flex items-center justify-center" style={{ width: glowSize, height: glowSize }}>
        <div
          className="absolute rounded-full"
          style={{
            width: glowSize,
            height: glowSize,
            background: "radial-gradient(circle, rgba(246,144,30,0.35), transparent 70%)",
            animation: "nyhl-glow-pulse 2.4s ease-in-out infinite",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: ringSize,
            height: ringSize,
            border: "2.5px solid transparent",
            borderTopColor: "var(--accent)",
            borderRightColor: "var(--accent)",
            animation: "nyhl-ring-spin 1s linear infinite",
          }}
        />
        <div
          className="flex items-center justify-center rounded-xl bg-white px-3 py-2 shadow-lg"
          style={{ animation: "nyhl-logo-breathe 2.4s ease-in-out infinite" }}
        >
          <Image src="/nyhl-shifts/nyhl-logo.png" alt="NYHL" width={cardWidth} height={cardHeight} priority />
        </div>
      </div>
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{label}</span>
      <style>{`
        @keyframes nyhl-glow-pulse {
          0%, 100% { opacity: 0.45; transform: scale(0.88); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        @keyframes nyhl-ring-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes nyhl-logo-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(0.93); }
        }
        @media (prefers-reduced-motion: reduce) {
          .nyhl-loader * { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
