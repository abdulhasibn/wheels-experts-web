"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type Photo = { url: string; category: string };
type View = { scale: number; x: number; y: number };

const MIN_SCALE = 1;
const MAX_SCALE = 5;
const DOUBLE_TAP_SCALE = 2.5;
const RESET: View = { scale: 1, x: 0, y: 0 };

const dist = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y);

/**
 * Full-screen photo viewer. Phones: pinch to zoom, drag to pan, double-tap to toggle zoom,
 * swipe sideways (when not zoomed) to change photo. Desktop: wheel / click to zoom, arrow keys, Esc.
 */
export function GalleryLightbox({
  photos,
  title,
  index,
  onIndexChange,
  onClose,
}: {
  photos: Photo[];
  title: string;
  index: number;
  onIndexChange: (next: number) => void;
  onClose: () => void;
}) {
  const [view, setView] = useState<View>(RESET);
  const stage = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef({ startDist: 0, startScale: 1, startView: RESET, startPoint: { x: 0, y: 0 }, moved: false });
  const lastTap = useRef(0);
  const viewRef = useRef(view);
  useEffect(() => {
    viewRef.current = view;
  }, [view]);

  const count = photos.length;
  const photo = photos[index] ?? photos[0]!;

  // Keep keyboard/focus handling and background scroll lock while open.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const clamp = useCallback((v: View): View => {
    const el = stage.current;
    if (!el || v.scale <= MIN_SCALE) return RESET;
    const maxX = ((v.scale - 1) * el.clientWidth) / 2;
    const maxY = ((v.scale - 1) * el.clientHeight) / 2;
    return { scale: v.scale, x: Math.max(-maxX, Math.min(maxX, v.x)), y: Math.max(-maxY, Math.min(maxY, v.y)) };
  }, []);

  const go = useCallback(
    (delta: number) => {
      if (count < 2) return;
      setView(RESET);
      onIndexChange((index + delta + count) % count);
    },
    [count, index, onIndexChange],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  const zoomTo = (scale: number, clientX: number, clientY: number) => {
    const el = stage.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cur = viewRef.current;
    const next = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale));
    // Keep the point under the finger/cursor fixed while scaling.
    const px = clientX - rect.left - rect.width / 2;
    const py = clientY - rect.top - rect.height / 2;
    const ratio = next / cur.scale;
    setView(clamp({ scale: next, x: px - (px - cur.x) * ratio, y: py - (py - cur.y) * ratio }));
  };

  // Wheel zoom must be a non-passive native listener to preventDefault.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomTo(viewRef.current.scale * Math.exp(-e.deltaY * 0.002), e.clientX, e.clientY);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    g.startView = viewRef.current;
    g.startPoint = { x: e.clientX, y: e.clientY };
    g.moved = false;
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()] as [{ x: number; y: number }, { x: number; y: number }];
      g.startDist = dist(a, b);
      g.startScale = viewRef.current.scale;
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()] as [{ x: number; y: number }, { x: number; y: number }];
      g.moved = true;
      zoomTo(g.startScale * (dist(a, b) / (g.startDist || 1)), (a.x + b.x) / 2, (a.y + b.y) / 2);
    } else if (pointers.current.size === 1 && viewRef.current.scale > 1) {
      const dx = e.clientX - g.startPoint.x;
      const dy = e.clientY - g.startPoint.y;
      if (Math.abs(dx) + Math.abs(dy) > 3) g.moved = true;
      setView(clamp({ scale: g.startView.scale, x: g.startView.x + dx, y: g.startView.y + dy }));
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    const wasSingle = pointers.current.size === 1;
    pointers.current.delete(e.pointerId);
    const g = gesture.current;
    // Re-base the remaining finger so a lifted pinch finger doesn't make the image jump.
    const rest = [...pointers.current.values()][0];
    if (rest) {
      g.startView = viewRef.current;
      g.startPoint = rest;
    }
    if (!wasSingle) return;

    const dx = e.clientX - g.startPoint.x;
    const dy = e.clientY - g.startPoint.y;
    const zoomed = viewRef.current.scale > 1;
    // Swipe to change photo, only when not zoomed.
    if (!zoomed && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      go(dx < 0 ? 1 : -1);
      return;
    }
    if (g.moved || Math.abs(dx) + Math.abs(dy) > 8) return;

    // Tap: double-tap (touch) / click (mouse) toggles zoom.
    const now = Date.now();
    if (e.pointerType === "mouse" || now - lastTap.current < 300) {
      lastTap.current = 0;
      if (zoomed) setView(RESET);
      else zoomTo(DOUBLE_TAP_SCALE, e.clientX, e.clientY);
    } else {
      lastTap.current = now;
    }
  };

  const btn =
    "grid size-11 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20";

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={`${title} photos`} className="fixed inset-0 z-[100] flex flex-col bg-black">
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs tabular-nums">
          {index + 1} / {count}
        </span>
        <button type="button" onClick={onClose} aria-label="Close full screen" className={btn}>
          <X className="size-5" />
        </button>
      </div>

      <div
        ref={stage}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={(e) => e.preventDefault()}
        className="relative min-h-0 flex-1 touch-none select-none overflow-hidden"
        style={{ cursor: view.scale > 1 ? "grab" : "zoom-in" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={photo.url}
          src={photo.url}
          alt={`${title} — ${photo.category} view`}
          draggable={false}
          className="absolute inset-0 size-full object-contain will-change-transform"
          style={{ transform: `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.scale})` }}
        />
        {count > 1 && (
          <>
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => go(-1)}
              aria-label="Previous photo"
              className={`${btn} absolute left-3 top-1/2 -translate-y-1/2 max-sm:hidden`}
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => go(1)}
              aria-label="Next photo"
              className={`${btn} absolute right-3 top-1/2 -translate-y-1/2 max-sm:hidden`}
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}
      </div>
      <p className="px-4 py-3 text-center text-xs text-white/60">Pinch or double-tap to zoom</p>
    </div>,
    document.body,
  );
}
