import type { PublicCar } from "@/lib/api";

/**
 * Buyer-facing version of AutoLead's lead ↔ vehicle match score
 * (autoLeadBackend/src/features/leads/domain/lead-vehicle-match.ts, ADR-0013).
 * Same weights and budget tolerance for the criteria a visitor can pick here;
 * criteria left on "Any" are skipped and the score is renormalised to 100.
 */
const WEIGHTS = {
  budget: 25,
  fuelType: 7,
  transmission: 7,
  bodyType: 4,
} as const;

/** Over budget by this share of the budget earns nothing. */
const BUDGET_TOLERANCE = 0.15;

export interface BuyerPreference {
  budgetLakh: number;
  bodyType: string | null;
  fuel: string | null;
  transmission: string | null;
}

/** Only priced cars can be scored against a budget. */
export type PricedCar = PublicCar & { listedPrice: number };

function budgetFraction(budget: number, price: number): number {
  if (price <= budget) return 1;
  if (budget <= 0) return 0;
  const over = (price - budget) / budget;
  return Math.max(0, 1 - over / BUDGET_TOLERANCE);
}

export function priceLakh(car: PricedCar): number {
  return car.listedPrice / 1e5;
}

export function scoreCar(preference: BuyerPreference, car: PricedCar): number {
  let possible = WEIGHTS.budget;
  let earned = WEIGHTS.budget * budgetFraction(preference.budgetLakh, priceLakh(car));

  const exact = (weight: number, wanted: string | null, actual: string | null) => {
    if (wanted === null) return;
    possible += weight;
    if (wanted === actual) earned += weight;
  };
  exact(WEIGHTS.fuelType, preference.fuel, car.fuelType);
  exact(WEIGHTS.transmission, preference.transmission, car.transmission);
  exact(WEIGHTS.bodyType, preference.bodyType, car.bodyType);

  return Math.round((100 * earned) / possible);
}
