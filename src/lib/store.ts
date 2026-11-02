"use client";

import { useSyncExternalStore } from "react";

/** Minimal external store — shared between the DOM tree and the R3F canvas. */
export interface Store<T> {
  get: () => T;
  set: (next: T) => void;
  subscribe: (listener: () => void) => () => void;
}

export function createStore<T>(initial: T): Store<T> {
  let state = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => state,
    set: (next) => {
      if (Object.is(next, state)) return;
      state = next;
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export function useStore<T>(store: Store<T>): T {
  return useSyncExternalStore(store.subscribe, store.get, store.get);
}

export const PAINTS = [
  { id: "lagoon", name: "Lagoon Teal", hex: "#04423d" },
  { id: "pearl", name: "Pearl White", hex: "#c9cfcd" },
  { id: "graphite", name: "Graphite", hex: "#16191b" },
  { id: "crimson", name: "Rosso", hex: "#5e0808" },
] as const;

export type PaintId = (typeof PAINTS)[number]["id"];

export const paintStore = createStore<PaintId>("lagoon");

/** Flips true once the 3D car has loaded, so the canvas can fade in. */
export const modelReadyStore = createStore(false);

/** Car the visitor last showed interest in — prefills the test-drive form. */
export const interestStore = createStore<string>("");

/**
 * Scroll progress through the 3D showcase (0 → 1). Written by ScrollTrigger,
 * read every frame by the camera rig, so it is a plain mutable object rather
 * than a subscribed store.
 */
export const stage = { progress: 0 };
