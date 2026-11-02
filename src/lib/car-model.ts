/**
 * Which 3D car the showcase loads, and how to shade it. Any glTF/GLB works:
 * the loader turns it nose-first to +z, scales it to `lengthM`, sits it on
 * the floor and centres it, so camera shots in lib/showcase.ts stay valid.
 */
export type SurfaceRole =
  | "paint"
  | "glass"
  | "chrome"
  | "rim"
  | "rubber"
  | "trim"
  | "caps"
  | "taillight"
  | "headlight"
  | "leather";

export interface CarModelConfig {
  url: string;
  /** Path to the Draco decoder when the file is Draco-compressed. */
  draco?: string;
  /** Direction the car's nose points in the source file. */
  noseAxis: "+x" | "-x" | "+z" | "-z";
  /** Real-world length in metres. */
  lengthM: number;
  /** Source material name → how we shade it. First match wins; unmatched materials are kept. */
  surfaces: [RegExp, SurfaceRole][];
  /** Node name → shading, checked before `surfaces` (for nodes that share a material with something else). */
  nodeSurfaces?: [RegExp, SurfaceRole][];
  /** Node names of wheels that spin with scroll (skipped if the pivot is off-centre). */
  wheels: RegExp;
  /** Nodes to hide (badges, maker logos). */
  hide?: RegExp;
}

/** Current homepage car: three.js example car (MIT, mrdoob/three.js examples/models/gltf/ferrari.glb). */
export const CAR_MODEL: CarModelConfig = {
  url: "/models/car.glb",
  draco: "/draco/",
  noseAxis: "-z",
  lengthM: 4.53,
  surfaces: [
    [/^Body_Color$/, "paint"],
    [/^Glass_Gray$/, "glass"],
    [/^Projector_Glass$/, "headlight"],
    [/^Taillight_Glass$|^Turn_Signal_LED$/, "taillight"],
    [/^metal_chrome$/, "chrome"],
    [/^metal_gray$/, "rim"],
    [/^Tires$/, "rubber"],
    [/^Ferrari_Yellow$/, "caps"],
    [/^Carbon_Fiber$|^Carpet$|^Interior_light$|^Interior_dark$|^plastic_gray$/, "trim"],
    [/^Leather/, "leather"],
  ],
  nodeSurfaces: [[/^trim$/, "rim"]],
  wheels: /^wheel_(fl|fr|rl|rr)$/,
  hide: /^yellow_trim$|^blue$/,
};

