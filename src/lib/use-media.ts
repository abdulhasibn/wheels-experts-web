"use client";

import { useSyncExternalStore } from "react";

export function useMediaQuery(query: string, serverValue = false): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

export function useReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 767px)");
}

let webglSupport: boolean | null = null;
let fallbackReason: "no-webgl" | "software-renderer" | "" = "";

/** Why detectWebGL() said no (for the data-hero diagnostic). */
export function webglFallbackReason() {
  return fallbackReason || "unknown";
}

/**
 * True only for a real, hardware-accelerated WebGL. Software renderers
 * (SwiftShader, llvmpipe, "Microsoft Basic Render") manage ~1 fps on the 3D
 * showcase at any quality, so those machines get the static photo hero instead.
 * ?quality=low|medium|high forces 3D on for testing.
 */
function detectWebGL(): boolean {
  if (webglSupport === null) {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
      if (!gl) {
        webglSupport = false;
        fallbackReason = "no-webgl";
      } else {
        const info = gl.getExtension("WEBGL_debug_renderer_info");
        const renderer = String(info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
        const software = /swiftshader|llvmpipe|software|basic render/i.test(renderer);
        const forced = new URLSearchParams(window.location.search).has("quality");
        webglSupport = !software || forced;
        if (!webglSupport) fallbackReason = "software-renderer";
        console.info("[Wheels Experts] GPU:", renderer);
      }
    } catch {
      webglSupport = false;
      fallbackReason = "no-webgl";
    }
  }
  return webglSupport;
}

export function useWebGL(): boolean | null {
  return useSyncExternalStore(
    () => () => {},
    detectWebGL,
    () => null,
  );
}
