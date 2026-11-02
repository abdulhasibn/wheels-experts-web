"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  r: number;
  phase: number;
  speed: number;
  /** A few stars occasionally flare into a soft four-point glint. */
  glint: boolean;
}

/** A region as fractions of the canvas: [x0, y0, x1, y1]. */
type Box = [number, number, number, number];

interface SideConfig {
  seed: number;
  /** Where points may land. */
  field: Box;
  /** Where they may not — keeps points and threads off the car. */
  avoid?: Box;
  count: number;
  /** Scales every alpha (points, threads, glints, grid). 1 = the left side's strength. */
  intensity: number;
  gridMask: string;
  starsMask: string;
}

const SIDES = {
  left: {
    seed: 7,
    field: [0, 0, 0.44, 1],
    count: 22,
    intensity: 1,
    gridMask:
      "radial-gradient(60% 55% at 28% 55%, black 0%, rgb(0 0 0 / 0.55) 40%, transparent 75%), linear-gradient(90deg, black 30%, transparent 70%)",
    starsMask:
      "linear-gradient(90deg, black 0%, black 40%, transparent 56%), linear-gradient(180deg, transparent 0%, black 16%, black 86%, transparent 100%)",
  },
  right: {
    seed: 23,
    field: [0.6, 0.06, 1, 0.96],
    // The hero car (see lib/showcase.ts "hero") sits roughly here on desktop.
    avoid: [0.44, 0.2, 0.94, 0.6],
    count: 12,
    // Quieter than the left: it frames the car rather than competing with it.
    intensity: 0.45,
    gridMask:
      "radial-gradient(45% 60% at 96% 50%, black 0%, rgb(0 0 0 / 0.5) 45%, transparent 80%), linear-gradient(270deg, black 15%, transparent 45%)",
    starsMask:
      "linear-gradient(270deg, black 0%, black 30%, transparent 45%), linear-gradient(180deg, transparent 0%, black 14%, black 88%, transparent 100%)",
  },
} satisfies Record<string, SideConfig>;

/** Canvas colours as "r, g, b". */
const colors = { thread: "52, 211, 153", core: "167, 243, 208", halo: "94, 234, 212", grid: "45 212 191 / 0.09" } as const;

/** Deterministic PRNG so the layout is the same on every visit. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function inside([x0, y0, x1, y1]: Box, x: number, y: number, w: number, h: number): boolean {
  return x >= x0 * w && x <= x1 * w && y >= y0 * h && y <= y1 * h;
}

/** Spaced-out points (Poisson-ish: reject any that land too close to another, or in `avoid`). */
function scatter(w: number, h: number, side: SideConfig, count: number, minGap: number): Star[] {
  const rand = mulberry32(side.seed);
  const [x0, y0, x1, y1] = side.field;
  const stars: Star[] = [];
  for (let tries = 0; stars.length < count && tries < count * 80; tries++) {
    const x = (x0 + rand() * (x1 - x0)) * w;
    const y = (y0 + rand() * (y1 - y0)) * h;
    if (side.avoid && inside(side.avoid, x, y, w, h)) continue;
    if (stars.some((s) => Math.hypot(s.x - x, s.y - y) < minGap)) continue;
    stars.push({
      x,
      y,
      r: 0.7 + rand() * 1.1,
      phase: rand() * Math.PI * 2,
      speed: 0.35 + rand() * 0.6,
      glint: rand() < 0.18,
    });
  }
  return stars;
}

/** Each star links to its nearest one or two neighbours within reach — a loose web, not a mesh. */
function link(stars: Star[], reach: number, crosses: (a: Star, b: Star) => boolean): [number, number][] {
  const edges = new Set<string>();
  stars.forEach((star, i) => {
    stars
      .map((other, j) => ({ j, d: Math.hypot(other.x - star.x, other.y - star.y) }))
      .filter(({ j, d }) => j !== i && d < reach && !crosses(star, stars[j]!))
      .sort((a, b) => a.d - b.d)
      .slice(0, i % 3 === 0 ? 2 : 1)
      .forEach(({ j }) => edges.add(i < j ? `${i}-${j}` : `${j}-${i}`));
  });
  return [...edges].map((key) => key.split("-").map(Number) as [number, number]);
}

/** Two mask layers that must both be opaque for a pixel to show. */
function mask(image: string): React.CSSProperties {
  return { maskImage: image, WebkitMaskImage: image, maskComposite: "intersect", WebkitMaskComposite: "source-in" };
}

/**
 * Hero backdrop: a faded, half-dissolved grid with a sparse constellation of
 * green points twinkling over it. `left` sits behind the headline; `right`
 * frames the car from the page edge without crossing it.
 */
export function Constellation({ side = "left", className }: { side?: keyof typeof SIDES; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const config: SideConfig = SIDES[side];

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let stars: Star[] = [];
    let edges: [number, number][] = [];
    let width = 0;
    let height = 0;
    let frame = 0;
    let visible = true;

    const layout = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const small = width < 640;
      const gap = small ? 70 : 95;
      // Phones: the copy spans the full width, so the left field does too.
      const field: SideConfig = small ? { ...config, field: [0, 0, 1, 1], avoid: undefined } : config;
      stars = scatter(width, height, field, small ? 16 : config.count, gap);
      // Reject threads that would pass over the avoided area.
      const crosses = (a: Star, b: Star) =>
        field.avoid !== undefined &&
        [0.25, 0.5, 0.75].some((t) => inside(field.avoid!, a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, width, height));
      edges = link(stars, gap * 1.9, crosses);
    };

    const k = config.intensity;
    const draw = (time: number) => {
      const t = time / 1000;
      ctx.clearRect(0, 0, width, height);

      // Threads first, so points sit on top of them.
      ctx.lineWidth = 0.6;
      for (const [a, b] of edges) {
        const s1 = stars[a]!;
        const s2 = stars[b]!;
        const pulse = 0.5 + 0.5 * Math.sin(t * 0.5 + s1.phase);
        ctx.strokeStyle = `rgba(${colors.thread}, ${(0.1 + 0.1 * pulse) * k})`;
        ctx.beginPath();
        ctx.moveTo(s1.x, s1.y);
        ctx.lineTo(s2.x, s2.y);
        ctx.stroke();
      }

      for (const star of stars) {
        const twinkle = 0.5 + 0.5 * Math.sin(t * star.speed * 2 + star.phase);
        const alpha = (0.35 + 0.6 * twinkle) * k;

        // Soft halo
        const halo = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.r * 7);
        halo.addColorStop(0, `rgba(${colors.halo}, ${0.3 * alpha})`);
        halo.addColorStop(1, `rgba(${colors.halo}, 0)`);
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r * 7, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = `rgba(${colors.core}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fill();

        // Occasional glint: a thin cross that blooms only near the top of the twinkle.
        if (star.glint && twinkle > 0.8) {
          const bloom = (twinkle - 0.8) / 0.2;
          const len = star.r * 6 * bloom;
          ctx.strokeStyle = `rgba(${colors.core}, ${0.45 * bloom * k})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(star.x - len, star.y);
          ctx.lineTo(star.x + len, star.y);
          ctx.moveTo(star.x, star.y - len);
          ctx.lineTo(star.x, star.y + len);
          ctx.stroke();
        }
      }
    };

    const loop = (time: number) => {
      if (visible) draw(time);
      frame = requestAnimationFrame(loop);
    };

    layout();
    if (reduced) {
      draw(0);
    } else {
      frame = requestAnimationFrame(loop);
    }

    const resize = new ResizeObserver(() => {
      layout();
      if (reduced) draw(0);
    });
    resize.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
    });
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      io.disconnect();
    };
  }, [config]);

  return (
    <div aria-hidden className={className}>
      {/* Faded grid: strongest at the outer edge, dissolving inward. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            `linear-gradient(rgb(${colors.grid}) 1px, transparent 1px), linear-gradient(90deg, rgb(${colors.grid}) 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
          opacity: config.intensity,
          ...mask(config.gridMask),
        }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" style={mask(config.starsMask)} />
    </div>
  );
}
