"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";
import { CarPhoto } from "./car-card";

export function CarGallery({ photos, title }: { photos: { url: string; category: string }[]; title: string }) {
  const [index, setIndex] = useState(0);

  if (photos.length === 0) {
    return <CarPhoto src={null} alt={title} className="aspect-[4/3] w-full rounded-[28px]" />;
  }

  const current = photos[index] ?? photos[0]!;
  const step = (delta: number) => setIndex((i) => (i + delta + photos.length) % photos.length);

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] bg-ink-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={current.url}
          src={current.url}
          alt={`${title} — ${current.category} view`}
          className="absolute inset-0 size-full object-cover"
        />
        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white backdrop-blur transition hover:bg-black/65"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white backdrop-blur transition hover:bg-black/65"
            >
              <ChevronRight className="size-5" />
            </button>
            <span className="absolute bottom-3 right-3 rounded-full bg-black/55 px-3 py-1 text-xs tabular-nums text-white/90 backdrop-blur">
              {index + 1} / {photos.length}
            </span>
          </>
        )}
      </div>
      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          {photos.map((photo, i) => (
            <button
              key={photo.url}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show ${photo.category} photo`}
              aria-current={i === index}
              className={clsx(
                "relative aspect-[4/3] w-20 shrink-0 overflow-hidden rounded-xl border-2 transition",
                i === index ? "border-teal" : "border-transparent opacity-60 hover:opacity-100",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
