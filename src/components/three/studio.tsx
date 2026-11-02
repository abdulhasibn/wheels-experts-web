"use client";

import { ContactShadows, Environment, Lightformer } from "@react-three/drei";

/**
 * Photo-studio lighting: a real studio HDRI (Poly Haven "Studio Small 09",
 * CC0) for reflections, plus a few soft boxes and a teal rim strip on top.
 * The HDRI lights the car only; the background and floor stay brand ink.
 */
export function Studio({ shadowMap }: { shadowMap: 0 | 1024 | 2048 }) {
  return (
    <>
      <color attach="background" args={["#0a1211"]} />
      <fog attach="fog" args={["#0a1211", 7, 17]} />

      <Environment files="/env/studio.hdr" resolution={512} environmentIntensity={0.45}>
        {/* Overhead soft box — the long highlight that runs down the bonnet and roof */}
        <Lightformer form="rect" intensity={1.5} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[3, 9, 1]} />
        {/* Side strips for crisp shoulder-line reflections */}
        <Lightformer form="rect" intensity={1} position={[-6, 1.4, 0]} rotation-y={Math.PI / 2} scale={[12, 0.5, 1]} />
        <Lightformer form="rect" intensity={1} position={[6, 1.4, 0]} rotation-y={-Math.PI / 2} scale={[12, 0.5, 1]} />
        {/* Brand rim light */}
        <Lightformer form="rect" intensity={1.8} color="#2dd4bf" position={[0, 1, -8]} scale={[10, 0.4, 1]} />
      </Environment>

      {/* Key light for real cast shadows under the car */}
      {/* Keyed by map size so a quality change rebuilds the shadow map cleanly. Low tier: no cast shadow (the contact shadow below still grounds the car). */}
      <directionalLight
        key={shadowMap}
        position={[3, 8, 4]}
        intensity={0.6}
        castShadow={shadowMap > 0}
        shadow-mapSize={[shadowMap || 512, shadowMap || 512]}
        shadow-bias={-0.0004}
      >
        <orthographicCamera attach="shadow-camera" args={[-4, 4, 4, -4, 0.1, 20]} />
      </directionalLight>

      {/*
        Shadow catcher: the floor itself is invisible, so the page's ink
        background shows through and only the car's shadow is drawn. A lit
        floor picks up the studio HDRI and reads as a grey slab.
      */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <shadowMaterial transparent opacity={0.5} />
      </mesh>
      {/* Soft contact shadow under the tyres keeps the car grounded. */}
      <ContactShadows position={[0, 0.002, 0]} scale={9} far={1.4} blur={2.6} opacity={0.75} resolution={512} frames={1} color="#000000" />
    </>
  );
}
