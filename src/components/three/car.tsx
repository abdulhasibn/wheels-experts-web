"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { CAR_MODEL, type CarModelConfig, type SurfaceRole } from "@/lib/car-model";
import { PAINTS, modelReadyStore, paintStore, stage } from "@/lib/store";

const NOSE_ROTATION: Record<CarModelConfig["noseAxis"], number> = {
  "+z": 0,
  "-z": Math.PI,
  "+x": -Math.PI / 2,
  "-x": Math.PI / 2,
};

function paintHex(): string {
  const id = paintStore.get();
  return PAINTS.find((paint) => paint.id === id)?.hex ?? PAINTS[0].hex;
}

/** Physically based stand-ins for each kind of surface on a car. */
function createSurfaces(): Record<SurfaceRole, THREE.Material> {
  return {
    paint: new THREE.MeshPhysicalMaterial({
      color: paintHex(),
      metalness: 0.7,
      roughness: 0.32,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      envMapIntensity: 1,
    }),
    glass: new THREE.MeshPhysicalMaterial({
      color: "#020404",
      metalness: 0.2,
      roughness: 0,
      transparent: true,
      opacity: 0.72,
      clearcoat: 1,
      envMapIntensity: 1.1,
      ior: 1.5,
    }),
    headlight: new THREE.MeshPhysicalMaterial({
      color: "#ffffff",
      metalness: 0.1,
      roughness: 0,
      transparent: true,
      opacity: 0.25,
      clearcoat: 1,
      envMapIntensity: 2,
    }),
    taillight: new THREE.MeshPhysicalMaterial({
      color: "#5a0306",
      emissive: "#ff1a1a",
      emissiveIntensity: 0.35,
      roughness: 0.1,
      clearcoat: 1,
      transparent: true,
      opacity: 0.92,
    }),
    chrome: new THREE.MeshStandardMaterial({ color: "#e6eaea", metalness: 1, roughness: 0.14, envMapIntensity: 1.6 }),
    rim: new THREE.MeshStandardMaterial({ color: "#9aa3a4", metalness: 1, roughness: 0.26, envMapIntensity: 1.3 }),
    rubber: new THREE.MeshStandardMaterial({ color: "#0b0b0b", metalness: 0, roughness: 0.88 }),
    caps: new THREE.MeshStandardMaterial({ color: "#1b2422", metalness: 0.85, roughness: 0.3 }),
    trim: new THREE.MeshStandardMaterial({ color: "#151817", metalness: 0.2, roughness: 0.62 }),
    leather: new THREE.MeshStandardMaterial({ color: "#1e1a18", metalness: 0, roughness: 0.55 }),
  };
}

function isAncestor(ancestor: THREE.Object3D, node: THREE.Object3D): boolean {
  for (let p = node.parent; p; p = p.parent) if (p === ancestor) return true;
  return false;
}

function roleOf(config: CarModelConfig, material: THREE.Material): SurfaceRole | null {
  return config.surfaces.find(([pattern]) => pattern.test(material.name))?.[1] ?? null;
}

/** Normalises the model (nose to +z, real length, on the floor), re-shades it and finds the wheels. */
function prepare(config: CarModelConfig, source: THREE.Object3D, surfaces: Record<SurfaceRole, THREE.Material>) {
  const model = source.clone(true);
  const oriented = new THREE.Group();
  oriented.rotation.y = NOSE_ROTATION[config.noseAxis];
  oriented.add(model);

  model.traverse((child) => {
    if (config.hide?.test(child.name)) child.visible = false;
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.castShadow = mesh.receiveShadow = true;
    const nodeRole = config.nodeSurfaces?.find(([pattern]) => pattern.test(mesh.name))?.[1];
    if (nodeRole) {
      mesh.material = surfaces[nodeRole];
    } else if (Array.isArray(mesh.material)) {
      // Unmatched materials keep the model's own shading (and textures).
      mesh.material = mesh.material.map((m) => {
        const role = roleOf(config, m);
        return role ? surfaces[role] : m;
      });
    } else {
      const role = roleOf(config, mesh.material);
      if (role) mesh.material = surfaces[role];
    }
  });

  const box = new THREE.Box3().setFromObject(oriented, true);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const scale = config.lengthM / size.z;

  const root = new THREE.Group();
  root.scale.setScalar(scale);
  root.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);
  root.add(oriented);
  root.updateMatrixWorld(true);

  // A wheel only spins if its pivot sits at its own centre.
  const wheels: THREE.Object3D[] = [];
  const nodeCenter = new THREE.Vector3();
  const origin = new THREE.Vector3();
  model.traverse((child) => {
    if (!config.wheels.test(child.name) || wheels.some((wheel) => isAncestor(wheel, child))) return;
    const nodeBox = new THREE.Box3().setFromObject(child, true);
    if (nodeBox.isEmpty()) return;
    nodeBox.getCenter(nodeCenter);
    child.getWorldPosition(origin);
    if (origin.distanceTo(nodeCenter) < 0.05) wheels.push(child);
  });

  return { root, wheels };
}

export interface CarProps {
  model?: CarModelConfig;
  /** Scroll progress that rolls the wheels (0 → 1). */
  progress?: { progress: number };
}

export function Car({ model = CAR_MODEL, progress = stage }: CarProps) {
  const { scene } = useGLTF(model.url, model.draco ?? false);
  const surfaces = useMemo(() => createSurfaces(), []);
  const prepared = useMemo(() => prepare(model, scene, surfaces), [model, scene, surfaces]);
  const target = useMemo(() => new THREE.Color(), []);
  const spun = useRef(0);

  useEffect(() => {
    modelReadyStore.set(true);
  }, [prepared]);

  useEffect(() => () => Object.values(surfaces).forEach((material) => material.dispose()), [surfaces]);

  useFrame((_, delta) => {
    // Paint changes ease in rather than snapping.
    target.set(paintHex());
    (surfaces.paint as THREE.MeshPhysicalMaterial).color.lerp(target, 1 - Math.exp(-6 * delta));
    // Wheels roll as the visitor scrolls.
    const angle = progress.progress * Math.PI * 14;
    const step = angle - spun.current;
    spun.current = angle;
    for (const wheel of prepared.wheels) wheel.rotateX(step);
  });

  return <primitive object={prepared.root} />;
}

useGLTF.preload(CAR_MODEL.url, CAR_MODEL.draco ?? false);
