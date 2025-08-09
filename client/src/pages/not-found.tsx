import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMemo } from "react";

export default function NotFound() {
  const { t } = useLanguage();
  const width = 800;
  const height = 360;
  const durationSec = 6.6;

  const hairs = useMemo(() => {
    const count = 650;
    const items = Array.from({ length: count }).map((_, i) => {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const length = 6 + Math.random() * 10;
      const angleDeg = -70 + Math.random() * 140; // -70..70
      const angle = (angleDeg * Math.PI) / 180;
      const x2 = x + Math.cos(angle) * length;
      const y2 = y + Math.sin(angle) * length;
      const thickness = 0.6 + Math.random() * 0.9;
      const delay = (x / width) * durationSec; // строгая синхронизация со шкалой времени
      return { id: i, x, y, x2, y2, length, thickness, delay };
    });
    return items;
  }, [width, height, durationSec]);
  return (
    <div className="relative w-full min-h-[calc(100vh-64px)]">
      <div className="mx-auto flex max-w-5xl flex-col items-center px-6 py-20 md:py-28 min-h-[calc(100vh-64px)]">
        {/* 404 Block */}
        <div className="relative mb-8 w-full select-none">
          <div className="relative mx-auto max-w-[900px]">
            {/* SVG with hair mask effect */}
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-auto"
              aria-hidden
              style={{ ["--duration" as any]: `${durationSec}s`, ["--w" as any]: `${width}px` }}
            >
              <defs>
                <linearGradient id="digits-gradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#ec4899" />
                  <stop offset="60%" stopColor="#f43f5e" />
                  <stop offset="100%" stopColor="#fb923c" />
                </linearGradient>
                <mask id="digits-mask">
                  <rect width={width} height={height} fill="black" />
                  <text
                    x="50%"
                    y="57%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={height * 0.95}
                    fontWeight={800}
                    fontFamily="Inter, system-ui, Arial, sans-serif"
                    fill="white"
                    letterSpacing="6"
                  >
                    404
                  </text>
                </mask>
                <filter id="soft-glow" x="-20%" y="-40%" width="140%" height="180%">
                  <feGaussianBlur stdDeviation="24" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Smooth digits in background */}
              <g filter="url(#soft-glow)">
                <text
                  x="50%"
                  y="57%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={height * 0.95}
                  fontWeight={800}
                  fontFamily="Inter, system-ui, Arial, sans-serif"
                  fill="url(#digits-gradient)"
                  letterSpacing="6"
                >
                  404
                </text>
              </g>

              {/* Hair strokes clipped by digits mask */}
              <g mask="url(#digits-mask)" className="text-black/60 dark:text-white/50">
                {hairs.map((h) => (
                  <line
                    key={h.id}
                    x1={h.x}
                    y1={h.y}
                    x2={h.x2}
                    y2={h.y2}
                    stroke="currentColor"
                    strokeWidth={h.thickness}
                    strokeLinecap="round"
                    className="shave-line"
                    style={{
                      ["--d" as any]: `${h.delay}s`,
                      ["--len" as any]: `${h.length}px`,
                    }}
                  />
                ))}
              </g>

              {/* Moving laser head and subtle glow, above hair group */}
              <g className="laser-track">
                <rect
                  x={0}
                  y={-10}
                  width={12}
                  height={height + 20}
                  fill="url(#digits-gradient)"
                  opacity="0.75"
                />
              </g>
            </svg>
          </div>
        </div>

        {/* Text */}
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-balance text-2xl font-semibold text-gray-900 dark:text-white sm:text-3xl">
            {t.notFoundTitle}
          </h1>
          <p className="mt-3 text-pretty text-sm text-gray-600 dark:text-gray-300 sm:text-base">
            {t.notFoundSubtitle}
          </p>
        </div>

        {/* CTA */}
        <div className="mt-10">
          <Button
            asChild
            className="group relative overflow-hidden rounded-full px-6 py-6 text-base shadow-lg transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
          >
            <Link href="/">
              <span className="relative z-[1] items-center gap-2 flex">
                {t.backToSmoothness}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
              {/* Glow sweep */}
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-pink-500 via-rose-500 to-orange-500 opacity-90" />
              <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(120px_60px_at_0%_50%,rgba(255,255,255,0.35),transparent)] blur-md transition-transform group-hover:translate-x-[40%]" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Local styles for animations */}
      <style>{`
        .shave-line {
          stroke-dasharray: var(--len);
          stroke-dashoffset: 0;
          animation: shave var(--duration) linear forwards;
          animation-delay: var(--d);
        }
        /* Полоска-лазер движется один раз слева направо синхронно со временем */
        .laser-track rect {
          animation: slide var(--duration) linear forwards;
        }
        @keyframes slide {
          from { transform: translateX(0); }
          to { transform: translateX(var(--w)); }
        }
        /* Для каждой волосинки: до прихода лазера видна, в момент прихода исчезает и остаётся скрытой */
        @keyframes shave {
          0% { opacity: 1; stroke-dashoffset: 0; }
          1% { opacity: 0; stroke-dashoffset: var(--len); }
          100% { opacity: 0; stroke-dashoffset: var(--len); }
        }
      `}</style>
    </div>
  );
}
