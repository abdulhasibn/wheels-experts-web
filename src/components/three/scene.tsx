"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { Bloom, EffectComposer, N8AO, SMAA, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import * as THREE from "three";
import { TIER_SETTINGS, initQuality, quality, qualityStore, stepDown, stepUp, type Tier } from "@/lib/quality";
import { modelReadyStore, useStore } from "@/lib/store";
import { Car } from "./car";
import { CameraRig } from "./camera-rig";
import { Studio } from "./studio";

// This module only loads in the browser (dynamic import, ssr: false).
initQuality();

export interface SceneProps {
  /** Phones: native MSAA + renderer tone mapping instead of the post-processing stack. */
  lite: boolean;
  /** Reduced motion: hold the hero shot. */
  still: boolean;
  /** Pause rendering while the showcase is off screen. */
  active: boolean;
}

/**
 * Desktop finishing pass, one variant per tier. Each is keyed so switching tier
 * rebuilds the composer cleanly instead of toggling effects inside it.
 */
function Finish({ tier }: { tier: Tier }) {
  if (tier === "high") {
    return (
      // 8× MSAA keeps thin panel gaps and trim from shimmering as the camera moves;
      // SMAA after it cleans up what's left on high-contrast edges.
      <EffectComposer key="high" multisampling={8}>
        <N8AO aoRadius={0.6} distanceFalloff={1} intensity={2.2} quality="high" />
        <Bloom mipmapBlur luminanceThreshold={1.2} intensity={0.22} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        <SMAA />
      </EffectComposer>
    );
  }
  if (tier === "medium") {
    return (
      <EffectComposer key="medium" multisampling={4}>
        <N8AO aoRadius={0.6} distanceFalloff={1} intensity={2} quality="medium" />
        <Bloom mipmapBlur luminanceThreshold={1.2} intensity={0.22} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        <SMAA />
      </EffectComposer>
    );
  }
  // Low: no AO, no bloom, no MSAA. SMAA still smooths edges at almost no cost.
  return (
    <EffectComposer key="low" multisampling={0}>
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <SMAA />
    </EffectComposer>
  );
}

/**
 * Watches the real frame rate once the car is loaded and settled (load and
 * shader compilation stutter on every machine), stepping quality down or back up.
 */
function AdaptiveQuality() {
  const ready = useStore(modelReadyStore);
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!ready) return;
    const timer = setTimeout(() => setArmed(true), 2000);
    return () => clearTimeout(timer);
  }, [ready]);
  // A forced tier (?quality=…) stays put so it can be judged as-is.
  if (!armed || quality.forced) return null;
  return (
    <PerformanceMonitor
      // Decline below ~45 fps; incline only with real headroom.
      bounds={(refresh) => (refresh > 90 ? [50, 100] : [45, 58])}
      flipflops={3}
      onDecline={stepDown}
      onIncline={stepUp}
    />
  );
}

export default function Scene({ lite, still, active }: SceneProps) {
  const tier = useStore(qualityStore);
  const settings = TIER_SETTINGS[tier];

  // Expose the active tier for debugging (<html data-quality="…">).
  useEffect(() => {
    document.documentElement.dataset.quality = tier;
  }, [tier]);

  return (
    <Canvas
      shadows
      frameloop={active ? "always" : "never"}
      // Desktop renders at a fixed ratio per tier (2× on high, supersampled on 1×
      // screens); phones render up to their real density, capped per tier.
      dpr={lite ? [1, settings.dpr.phone] : settings.dpr.desktop}
      camera={{ fov: 30, near: 0.1, far: 60, position: [6.6, 2.0, 7.8] }}
      gl={{
        antialias: lite,
        powerPreference: "high-performance",
        // Desktop tone-maps in the composer (ACES); phones skip the composer and tone-map here.
        toneMapping: lite ? THREE.ACESFilmicToneMapping : THREE.NoToneMapping,
        toneMappingExposure: 0.9,
      }}
    >
      <Studio shadowMap={settings.shadowMap} />
      <Suspense fallback={null}>
        <Car />
      </Suspense>
      <CameraRig still={still} />
      <AdaptiveQuality />
      {!lite && <Finish tier={tier} />}
    </Canvas>
  );
}
