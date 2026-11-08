/**
 * First-party visitor analytics. Events go to AutoLead's `/public/events`;
 * the backend classifies the traffic channel, so the client only reports the
 * raw landing touch (UTM tags, click ids, referrer, in-app browser).
 * Anonymous by design: a random visitor id, never a name or phone.
 */

import { API_URL } from "./api";

export type EventType =
  | "page_view"
  | "car_view"
  | "gallery_open"
  | "filter_apply"
  | "test_drive_open"
  | "whatsapp_click"
  | "call_click"
  | "directions_click";

export type EventProps = Record<string, string | number | boolean | null>;

export interface Touch {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  hasFbclid: boolean;
  hasGclid: boolean;
  referrer?: string;
  landingPath: string;
  inAppBrowser: "instagram" | "facebook" | null;
}

export interface Attribution {
  visitorId: string;
  sessionId: string;
  firstTouch: Touch;
  lastTouch: Touch;
}

interface QueuedEvent {
  type: EventType;
  at: string;
  path: string;
  vehicleId?: string;
  props?: EventProps;
}

interface Session {
  id: string;
  lastSeen: number;
  touch: Touch;
  /** Query string the session landed with, so re-reading it doesn't restart the session. */
  entry: string;
}

const SESSION_IDLE_MS = 30 * 60 * 1000;
const FIRST_TOUCH_TTL_MS = 90 * 24 * 60 * 60 * 1000;
const FLUSH_MS = 5000;
const MAX_BATCH = 20;
const UTM_KEYS = [
  ["utm_source", "utmSource"],
  ["utm_medium", "utmMedium"],
  ["utm_campaign", "utmCampaign"],
  ["utm_content", "utmContent"],
  ["utm_term", "utmTerm"],
] as const;

const queue: QueuedEvent[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;
let listening = false;
/** Fallbacks for when storage is blocked (private mode, some in-app browsers). */
const memory = new Map<string, string>();

function read<T>(key: string): T | null {
  let raw: string | null = memory.get(key) ?? null;
  try {
    raw = localStorage.getItem(key) ?? raw;
  } catch {}
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  const raw = JSON.stringify(value);
  memory.set(key, raw);
  try {
    localStorage.setItem(key, raw);
  } catch {}
}

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  // Old in-app browsers: RFC 4122 v4 from Math.random is fine for an anonymous id.
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

const clip = (value: string | null, max: number) => (value ? value.slice(0, max) : undefined);

function currentTouch(): Touch {
  const params = new URLSearchParams(location.search);
  const touch: Touch = {
    hasFbclid: params.has("fbclid"),
    hasGclid: params.has("gclid"),
    landingPath: location.pathname.slice(0, 300),
    inAppBrowser: /Instagram/i.test(navigator.userAgent)
      ? "instagram"
      : /FBAN|FBAV|FB_IAB/i.test(navigator.userAgent)
        ? "facebook"
        : null,
  };
  for (const [param, key] of UTM_KEYS) {
    const value = clip(params.get(param), 120);
    if (value) touch[key] = value;
  }
  // Only the referring origin — never the full URL of someone else's page.
  try {
    const ref = document.referrer ? new URL(document.referrer) : null;
    if (ref && ref.host !== location.host) touch.referrer = ref.origin.slice(0, 300);
  } catch {}
  return touch;
}

/** A touch that says where the visitor came from, as opposed to a direct visit. */
function isCampaign(touch: Touch): boolean {
  return Boolean(touch.utmSource || touch.hasFbclid || touch.hasGclid || touch.referrer || touch.inAppBrowser);
}

function visitorId(): string {
  let id = read<string>("we_vid");
  if (!id) {
    id = uuid();
    write("we_vid", id);
  }
  return id;
}

/**
 * The current session, starting a new one after 30 idle minutes or when the
 * visitor lands from a new campaign link mid-session.
 */
function session(): Session {
  const now = Date.now();
  const landing = currentTouch();
  const existing = read<Session>("we_sess");
  const arrivedFromCampaign =
    Boolean(landing.utmSource || landing.hasFbclid || landing.hasGclid) && location.search !== existing?.entry;
  const expired = !existing || now - existing.lastSeen > SESSION_IDLE_MS;

  if (existing && !expired && !arrivedFromCampaign) {
    existing.lastSeen = now;
    write("we_sess", existing);
    return existing;
  }

  const fresh: Session = { id: uuid(), lastSeen: now, touch: landing, entry: location.search };
  write("we_sess", fresh);

  const first = read<{ touch: Touch; at: number }>("we_first");
  if (!first || now - first.at > FIRST_TOUCH_TTL_MS) write("we_first", { touch: landing, at: now });
  // Last touch is the last non-direct one, so a later bookmark visit keeps the ad's credit.
  if (isCampaign(landing) || !read<Touch>("we_last")) write("we_last", landing);
  return fresh;
}

function send(body: string) {
  const url = `${API_URL}/public/events`;
  // text/plain keeps the beacon a "simple" CORS request — no preflight.
  const blob = new Blob([body], { type: "text/plain" });
  if (navigator.sendBeacon?.(url, blob)) return;
  fetch(url, { method: "POST", body, keepalive: true, headers: { "Content-Type": "text/plain" } }).catch(() => {});
}

export function flush() {
  if (timer) clearTimeout(timer);
  timer = null;
  if (queue.length === 0) return;
  const s = session();
  while (queue.length > 0) {
    const events = queue.splice(0, MAX_BATCH);
    send(JSON.stringify({ visitorId: visitorId(), sessionId: s.id, touch: s.touch, events }));
  }
}

function listen() {
  if (listening) return;
  listening = true;
  document.addEventListener("visibilitychange", () => document.visibilityState === "hidden" && flush());
  window.addEventListener("pagehide", flush);
}

export function track(type: EventType, options: { vehicleId?: string; props?: EventProps } = {}) {
  if (typeof window === "undefined") return;
  listen();
  session();
  queue.push({ type, at: new Date().toISOString(), path: location.pathname.slice(0, 300), ...options });
  if (queue.length >= MAX_BATCH) flush();
  else if (!timer) timer = setTimeout(flush, FLUSH_MS);
}

/** Sent with a test-drive request, so the lead is credited to the right channel. */
export function getAttribution(): Attribution | undefined {
  if (typeof window === "undefined") return undefined;
  const s = session();
  return {
    visitorId: visitorId(),
    sessionId: s.id,
    firstTouch: read<{ touch: Touch }>("we_first")?.touch ?? s.touch,
    lastTouch: read<Touch>("we_last") ?? s.touch,
  };
}
