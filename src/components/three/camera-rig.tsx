"use client";

import { useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { stage } from "@/lib/store";
import { MOBILE_SHOTS, SHOT_COUNT, SHOTS, type OrbitShot } from "@/lib/showcase";

const smoothstep = (t: number) => t * t * (3 - 2 * t);
const UP = new THREE.Vector3(0, 1, 0);
const DEG = Math.PI / 180;

/** Where the scroll is: which two shots we're between, and how far (eased). */
function segment(p: number, count: number) {
  const scaled = p * (count - 1);
  const i = Math.min(Math.floor(scaled), count - 2);
  return { i, t: smoothstep(THREE.MathUtils.clamp(scaled - i, 0, 1)) };
}

/** Camera distance that makes the shot span `across` metres wide / `tall` metres high. */
function orbitDistance(shot: OrbitShot, halfV: number, aspect: number): number {
  const byWidth = shot.across ? shot.across / 2 / (halfV * aspect) : 0;
  const byHeight = shot.tall ? shot.tall / 2 / halfV : 0;
  return Math.max(byWidth, byHeight);
}

/**
 * Flies the camera between the showcase shots. Scroll progress picks the
 * segment; damping smooths it so fast flicks still glide.
 *
 * Wide screens follow SHOTS (fixed positions). Portrait screens follow
 * MOBILE_SHOTS, interpolating orbit angles so the camera sweeps around the
 * car, framed for a tall screen with copy in the bottom part.
 */
export function CameraRig({ still }: { still: boolean }) {
  const camera = useThree((state) => state.camera) as THREE.PerspectiveCamera;
  const scratch = useMemo(
    () => ({
      pos: new THREE.Vector3(),
      look: new THREE.Vector3(),
      currentLook: new THREE.Vector3(0, 0.5, 0),
      a: new THREE.Vector3(),
      b: new THREE.Vector3(),
      focus: new THREE.Vector3(),
      dir: new THREE.Vector3(),
      right: new THREE.Vector3(),
      up: new THREE.Vector3(),
    }),
    [],
  );

  useFrame(({ size, scene }, delta) => {
    const { pos, look, currentLook, a, b, focus, dir, right, up } = scratch;
    const p = still ? 0 : THREE.MathUtils.clamp(stage.progress, 0, 1);
    const aspect = size.width / size.height;

    if (aspect < 1) {
      // ── Phones: orbit path ─────────────────────────────────────────────
      const { i, t } = segment(p, MOBILE_SHOTS.length);
      const from = MOBILE_SHOTS[i]!;
      const to = MOBILE_SHOTS[i + 1]!;
      const halfV = Math.tan((camera.fov * DEG) / 2);
      const lerp = THREE.MathUtils.lerp;

      const azimuth = lerp(from.azimuth, to.azimuth, t) * DEG;
      const elevation = lerp(from.elevation, to.elevation, t) * DEG;
      const distance = lerp(orbitDistance(from, halfV, aspect), orbitDistance(to, halfV, aspect), t);
      const screenY = lerp(from.screenY, to.screenY, t);
      focus.lerpVectors(a.fromArray(from.focus), b.fromArray(to.focus), t);

      dir.set(Math.sin(azimuth) * Math.cos(elevation), Math.sin(elevation), Math.cos(azimuth) * Math.cos(elevation));
      pos.copy(focus).addScaledVector(dir, distance);

      // Aim below/above the focus so it lands at `screenY` instead of dead centre.
      right.crossVectors(a.copy(dir).negate(), UP).normalize();
      up.crossVectors(right, a);
      look.copy(focus).addScaledVector(up, -(0.5 - screenY) * 2 * distance * halfV);
    } else {
      // ── Wide screens: fixed shot positions ─────────────────────────────
      const { i, t } = segment(p, SHOT_COUNT);
      const from = SHOTS[i]!;
      const to = SHOTS[i + 1]!;
      look.lerpVectors(a.fromArray(from.target), b.fromArray(to.target), t);
      pos.lerpVectors(a.fromArray(from.position), b.fromArray(to.position), t);

      if (aspect < 1.75) {
        // Narrower desktops (e.g. 1440×900): the headline is relatively wider, so
        // slide the hero shot right to keep the car's nose clear of it. Fades out
        // after the hero so the other shots are untouched.
        const heroWeight = Math.max(0, 1 - p * (SHOT_COUNT - 1));
        // Moving the camera and target left together slides the car right on screen.
        a.subVectors(look, pos).cross(UP).setY(0).normalize().multiplyScalar(-(1.75 - aspect) * 1.15 * heroWeight);
        pos.add(a);
        look.add(a);
      }
      // Near-square screens: pull back so the whole car fits.
      if (aspect < 1.2) pos.sub(look).multiplyScalar(1 + (1.2 - aspect) * 1.05).add(look);
    }

    // No idle drift: a camera that never rests moves thin trim and panel
    // edges by sub-pixel amounts every frame, which reads as glitter.

    if (still) {
      camera.position.copy(pos);
      currentLook.copy(look);
    } else {
      const k = 1 - Math.exp(-3.2 * delta);
      camera.position.lerp(pos, k);
      currentLook.lerp(look, k);
    }
    camera.lookAt(currentLook);

    // Fog only fades the floor behind the car: it starts just past the car,
    // whatever distance the current shot puts us at.
    if (scene.fog instanceof THREE.Fog) {
      const distance = camera.position.distanceTo(currentLook);
      scene.fog.near = distance + 2.5;
      scene.fog.far = distance + 12;
    }
  });

  return null;
}
