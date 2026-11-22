// Shared by the server layout and the client theme hook, so no "use client" here.

export type Theme = "dark" | "light";

export const THEME_STORAGE_KEY = "we.theme";

/** Page background per theme — the browser chrome (theme-color) and the 3D studio match it. */
export const INK: Record<Theme, string> = { dark: "#0a1211", light: "#f5f8f7" };

/**
 * Runs in <head> before first paint so a saved light choice never flashes dark.
 * Dark is the brand default; light applies only when the visitor picked it.
 */
export const themeInitScript = `try{if(localStorage.getItem('${THEME_STORAGE_KEY}')==='light'){document.documentElement.dataset.theme='light';var c=function(){var m=document.querySelector('meta[name=theme-color]');if(m)m.setAttribute('content','${INK.light}')};c();document.addEventListener('DOMContentLoaded',c)}}catch(e){}`;
