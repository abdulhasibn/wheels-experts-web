"use client";

import { createStore } from "./store";

/**
 * Adaptive rendering quality for the 3D showcase.
 *
 * 1. On load we guess a starting tier from the GPU the browser reports
 *    (plus CPU cores and memory). That guess is also the ceiling.
 * 2. While the scene runs, drei's PerformanceMonitor watches the real frame
 *    rate and steps the tier down (or back up, never past the ceiling).
 *
 * Fast machines (Apple silicon, discrete GPUs) stay on "high": exactly the
 * look the site was designed with. Add ?quality=low|medium|high to force a tier.
 */
export type Tier = "low" | "medium" | "high";

export const TIERS: Tier[] = ["low", "medium", "high"];

export interface TierSettings {
  /** Device-pixel-ratio cap for desktop and phone renders. */
  dpr: { desktop: number; phone: number };
  /** Post-processing on desktop (phones always use native MSAA instead). */
  multisampling: number;
  ao: false | "medium" | "high";
  bloom: boolean;
  shadowMap: 0 | 1024 | 2048;
}

export const TIER_SETTINGS: Record<Tier, TierSettings> = {
  high: { dpr: { desktop: 2, phone: 2.5 }, multisampling: 8, ao: "high", bloom: true, shadowMap: 2048 },
  medium: { dpr: { desktop: 1.5, phone: 2 }, multisampling: 4, ao: "medium", bloom: true, shadowMap: 1024 },
  low: { dpr: { desktop: 1, phone: 1.5 }, multisampling: 0, ao: false, bloom: false, shadowMap: 0 },
};

const rank = (tier: Tier) => TIERS.indexOf(tier);
const lower = (a: Tier, b: Tier): Tier => (rank(a) <= rank(b) ? a : b);

/** Best guess from hardware. Runs once, client-side only. */
export function detectTier(): Tier {
  const forced = new URLSearchParams(window.location.search).get("quality");
  if (forced === "low" || forced === "medium" || forced === "high") return forced;

  let renderer = "";
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    if (!gl) return "low";
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    renderer = String(info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
  } catch {
    return "low";
  }

  let tier: Tier;
  if (/swiftshader|llvmpipe|software|basic render|microsoft basic/i.test(renderer)) {
    tier = "low"; // no real GPU
  } else if (/apple|nvidia|geforce|rtx|gtx|quadro|radeon (rx|pro)|amd radeon(?!.*(vega|graphics))/i.test(renderer)) {
    tier = "high"; // Apple silicon or a discrete GPU
  } else if (/iris xe|iris\(r\) xe|arc|radeon.*(vega|graphics)|adreno|mali/i.test(renderer)) {
    tier = "medium"; // better integrated GPUs
  } else if (/intel|uhd|hd graphics/i.test(renderer)) {
    tier = "low"; // older/basic Intel integrated graphics (most budget Windows laptops)
  } else {
    tier = "medium"; // unknown: start in the middle, the frame-rate monitor adjusts
  }

  // Few CPU cores or little memory caps the starting point.
  const cores = navigator.hardwareConcurrency ?? 8;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  if (cores <= 4 || memory <= 4) tier = lower(tier, "medium");
  if (cores <= 2 || memory <= 2) tier = "low";
  return tier;
}

/** Current tier (changes live) and the ceiling detection allowed. */
export const qualityStore = createStore<Tier>("high");
export const quality = { ceiling: "high" as Tier, detected: false, forced: false };

export function initQuality() {
  if (quality.detected) return;
  const tier = detectTier();
  quality.forced = new URLSearchParams(window.location.search).has("quality");
  quality.ceiling = tier;
  quality.detected = true;
  qualityStore.set(tier);
}

export function stepDown() {
  const current = qualityStore.get();
  if (current !== "low") qualityStore.set(TIERS[rank(current) - 1]!);
}

export function stepUp() {
  const current = qualityStore.get();
  if (rank(current) < rank(quality.ceiling)) qualityStore.set(TIERS[rank(current) + 1]!);
}
