/**
 * AutoLead's anonymous `/public` API: Listed stock and test-drive requests.
 * Responses carry only buyer-safe fields — no plate, owner or internal prices.
 */

import type { Attribution } from "./analytics";

export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");

/** Stock pages are cached this long; signed photo URLs live 24h, far longer. */
const REVALIDATE_SECONDS = 300;

export interface PublicCar {
  id: string;
  make: string;
  model: string;
  variant: string;
  bodyType: string | null;
  year: number;
  fuelType: string;
  transmission: string;
  kmDriven: number;
  previousOwners: number;
  colour: string | null;
  /** Rupees; null means "Price on request". */
  listedPrice: number | null;
  coverImageUrl: string | null;
}

export interface PublicCarDetail extends PublicCar {
  description: string | null;
  photos: { url: string; category: string }[];
}

export interface Page<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface FilterOptions {
  makes: { id: string; name: string; models: { id: string; name: string }[] }[];
  bodyTypes: string[];
  fuelTypes: string[];
  transmissions: string[];
  priceRange: { min: number; max: number } | null;
  yearRange: { min: number; max: number } | null;
}

export interface CarQuery {
  makeId?: string;
  modelId?: string;
  bodyType?: string;
  fuelType?: string;
  transmission?: string;
  priceMax?: number;
  sort?: string;
  limit?: number;
  offset?: number;
}

export interface Showroom {
  name: string;
  address: string;
  city: string;
  phone: string;
  openingHours: unknown;
  googleMapsUrl: string | null;
}

export interface TestDriveReceipt {
  outcome: "created" | "updated";
  vehicleAvailable: boolean;
  showroom: Showroom | null;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

async function get<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { next: { revalidate: REVALIDATE_SECONDS } });
  if (!response.ok) {
    throw await toApiError(response);
  }
  return (await response.json()) as T;
}

async function toApiError(response: Response): Promise<ApiError> {
  const body = (await response.json().catch(() => null)) as { error?: { code?: string; message?: string } } | null;
  return new ApiError(response.status, body?.error?.code ?? "UNKNOWN", body?.error?.message ?? response.statusText);
}

export function getCars(query: CarQuery = {}): Promise<Page<PublicCar>> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  return get<Page<PublicCar>>(`/public/vehicles?${params}`);
}

/** Null when the car is unknown, sold or no longer listed. */
export async function getCar(id: string): Promise<PublicCarDetail | null> {
  try {
    return await get<PublicCarDetail>(`/public/vehicles/${encodeURIComponent(id)}`);
  } catch (err) {
    if (err instanceof ApiError && (err.status === 404 || err.status === 422)) return null;
    throw err;
  }
}

export function getFilterOptions(): Promise<FilterOptions> {
  return get<FilterOptions>("/public/filters");
}

/** Browser-side: files the lead and returns the showroom location. */
export async function requestTestDrive(input: {
  vehicleId: string;
  fullName: string;
  phone: string;
  fax: string;
  /** Where the visitor came from — credits the lead to Instagram, Google, etc. */
  attribution?: Attribution;
}): Promise<TestDriveReceipt> {
  const response = await fetch(`${API_URL}/public/test-drive-requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw await toApiError(response);
  }
  return (await response.json()) as TestDriveReceipt;
}
