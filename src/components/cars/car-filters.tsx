"use client";

import Link from "next/link";
import type { FilterOptions } from "@/lib/api";
import { formatPrice, label } from "@/lib/format";

const select =
  "h-11 w-full appearance-none rounded-full border border-edge/10 bg-ink-2 px-4 pr-9 text-base text-fg sm:text-sm outline-none transition focus:border-teal/60 focus:ring-4 focus:ring-teal/10 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2399a9a5%22 stroke-width=%222%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[length:12px] bg-[right_1rem_center] bg-no-repeat";

const BUDGETS = [500000, 800000, 1000000, 1500000, 2000000, 3000000];

export interface ActiveFilters {
  makeId?: string;
  modelId?: string;
  bodyType?: string;
  fuelType?: string;
  transmission?: string;
  priceMax?: string;
  sort?: string;
}

/**
 * A plain GET form, so filtering works before (or without) JavaScript; with
 * it, every change submits straight away.
 */
export function CarFilters({ options, active }: { options: FilterOptions; active: ActiveFilters }) {
  const make = options.makes.find((m) => m.id === active.makeId);
  const hasFilters = Object.entries(active).some(([key, value]) => key !== "sort" && value);

  return (
    <form
      method="get"
      action="/cars"
      onChange={(event) => {
        const form = event.currentTarget;
        // A new make invalidates the chosen model.
        if ((event.target as HTMLElement).getAttribute("name") === "makeId") {
          const model = form.elements.namedItem("modelId");
          if (model instanceof HTMLSelectElement) model.value = "";
        }
        // Keep the URL short: unset filters are left out of the query.
        for (const el of Array.from(form.elements)) {
          if (el instanceof HTMLSelectElement && el.value === "") el.disabled = true;
        }
        form.requestSubmit();
      }}
      // Phones: one swipeable row, so the cars start above the fold. `relative` keeps
      // the absolutely-positioned sr-only labels inside it instead of widening the page.
      className="relative -mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0 sm:pb-0 xl:grid-cols-7"
    >
      <Select name="makeId" value={active.makeId} label="Make" placeholder="All makes">
        {options.makes.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </Select>
      <Select name="modelId" value={active.modelId} label="Model" placeholder="All models" disabled={!make}>
        {make?.models.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </Select>
      <Select name="bodyType" value={active.bodyType} label="Body type" placeholder="Any body">
        {options.bodyTypes.map((v) => (
          <option key={v} value={v}>
            {label(v)}
          </option>
        ))}
      </Select>
      <Select name="fuelType" value={active.fuelType} label="Fuel" placeholder="Any fuel">
        {options.fuelTypes.map((v) => (
          <option key={v} value={v}>
            {label(v)}
          </option>
        ))}
      </Select>
      <Select name="transmission" value={active.transmission} label="Gearbox" placeholder="Any gearbox">
        {options.transmissions.map((v) => (
          <option key={v} value={v}>
            {label(v)}
          </option>
        ))}
      </Select>
      <Select name="priceMax" value={active.priceMax} label="Budget" placeholder="Any budget">
        {BUDGETS.map((v) => (
          <option key={v} value={v}>
            Up to {formatPrice(v)}
          </option>
        ))}
      </Select>
      <Select name="sort" value={active.sort} label="Sort" placeholder="Newest first">
        <option value="price_asc">Price: low to high</option>
        <option value="price_desc">Price: high to low</option>
        <option value="km_asc">Lowest km</option>
      </Select>
      <noscript>
        <button type="submit" className="h-11 shrink-0 rounded-full bg-teal px-5 text-sm font-semibold text-ink">
          Apply
        </button>
      </noscript>
      {hasFilters && (
        <Link
          href="/cars"
          className="order-first shrink-0 self-center whitespace-nowrap text-sm text-teal hover:text-teal-soft sm:order-none sm:col-span-4 xl:col-span-7"
        >
          Clear filters
        </Link>
      )}
    </form>
  );
}

function Select({
  name,
  value,
  label: text,
  placeholder,
  disabled,
  children,
}: {
  name: string;
  value?: string;
  label: string;
  placeholder: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block shrink-0 sm:shrink">
      <span className="sr-only">{text}</span>
      <select name={name} defaultValue={value ?? ""} disabled={disabled} className={`${select} disabled:opacity-50`}>
        <option value="">{placeholder}</option>
        {children}
      </select>
    </label>
  );
}
