type Vec3 = [number, number, number];

export interface Shot {
  id: string;
  position: Vec3;
  target: Vec3;
}

/**
 * One camera shot per full-screen panel in the showcase section, in order.
 * Panel i sits at scroll progress i / (SHOT_COUNT - 1).
 * The car's nose points to +z; y is up; it sits on the floor at y = 0.
 */
export const SHOTS: Shot[] = [
  { id: "hero", position: [5.17, 1.99, 7.72], target: [-2.57, -0.15, 0.08] },
  { id: "profile", position: [10.8, 1.1, 1.7], target: [0, 0.45, 1.7] },
  { id: "papers", position: [1.1, 0.95, 4.6], target: [-0.9, 0.5, 0.6] },
  { id: "service", position: [2.3, 0.45, 2.9], target: [0.85, 0.32, 1.3] },
  { id: "inspection", position: [2.6, 7.4, 2.4], target: [-1.5, 0, 0.6] },
  { id: "photos", position: [-6.6, 1.8, -5.6], target: [-1.2, 0.4, 1.0] },
  // Final landing: a big side profile, low in the frame under the headline. Same
  // side (-x) as the "photos" shot, so the camera never passes through the car.
  { id: "outro", position: [-7.6, 1.2, 0], target: [0, 1.05, 0] },
];

export const SHOT_COUNT = SHOTS.length;

/**
 * Phone-only camera path (portrait screens). Each shot orbits the car instead
 * of naming a camera position, so moving between shots sweeps around the car
 * and the framing adapts to any phone's shape.
 *
 * azimuth: degrees around the car, 0 = in front of the nose, 90 = driver side (+x).
 * elevation: degrees above the horizon.
 * focus: the point (metres, car space) the shot is about.
 * across / tall: metres of scene the screen width / height should span (largest wins).
 * screenY: where the focus sits on screen, 0 = top, 1 = bottom. Copy lives in the
 * bottom ~40% on phones, so most shots keep the car in the upper part.
 */
export interface OrbitShot {
  id: string;
  azimuth: number;
  elevation: number;
  focus: Vec3;
  across?: number;
  tall?: number;
  screenY: number;
}

export const MOBILE_SHOTS: OrbitShot[] = [
  { id: "hero", azimuth: 38, elevation: 13, focus: [0, 0.55, 0], across: 4.4, screenY: 0.31 },
  { id: "profile", azimuth: 24, elevation: 6, focus: [0.2, 0.55, 0.9], across: 2.9, screenY: 0.36 },
  { id: "papers", azimuth: 4, elevation: 24, focus: [0, 0.95, 0.35], across: 2.75, screenY: 0.3 },
  { id: "service", azimuth: 72, elevation: 6, focus: [0.95, 0.36, 1.35], across: 1.5, screenY: 0.36 },
  { id: "inspection", azimuth: 20, elevation: 84, focus: [0, 0.4, 0], tall: 8.6, screenY: 0.36 },
  { id: "photos", azimuth: 215, elevation: 12, focus: [0, 0.6, 0], across: 4.3, screenY: 0.36 },
  { id: "outro", azimuth: 360, elevation: 7, focus: [0, 0.6, 0], across: 2.6, screenY: 0.54 },
];
