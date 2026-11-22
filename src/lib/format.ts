const LABELS: Record<string, string> = {
  petrol: "Petrol",
  diesel: "Diesel",
  cng: "CNG",
  electric: "Electric",
  hybrid: "Hybrid",
  manual: "Manual",
  automatic: "Automatic",
  amt: "AMT",
  cvt: "CVT",
  dct: "DCT",
  hatchback: "Hatchback",
  sedan: "Sedan",
  suv: "SUV",
  muv: "MUV",
  mpv: "MPV",
  crossover: "Crossover",
  coupe: "Coupe",
  convertible: "Convertible",
  sports: "Sports",
  "pick-up": "Pick-up",
};

/** Display label for a fuel, gearbox or body style value from the API. */
export function label(value: string): string {
  return LABELS[value] ?? value.charAt(0).toUpperCase() + value.slice(1);
}

/** ₹6.40 L, ₹16.9 L, ₹1.25 Cr — how Indian car prices are read. */
export function formatPrice(rupees: number | null): string {
  if (rupees === null) return "Price on request";
  if (rupees >= 1e7) return `₹${(rupees / 1e7).toFixed(2)} Cr`;
  const lakh = rupees / 1e5;
  return `₹${lakh.toFixed(lakh < 10 ? 2 : 1)} L`;
}

export function formatKm(km: number): string {
  return `${new Intl.NumberFormat("en-IN").format(km)} km`;
}

export function formatOwners(previousOwners: number): string {
  if (previousOwners <= 1) return "1st owner";
  const suffix = previousOwners === 2 ? "nd" : previousOwners === 3 ? "rd" : "th";
  return `${previousOwners}${suffix} owner`;
}

export function carTitle(car: { year: number; make: string; model: string }): string {
  return `${car.year} ${car.make} ${car.model}`;
}

/**
 * Indian mobile as typed (`98765 43210`, `+91…`, `0…`) → 10 digits, or null.
 * Mirrors the API's IndianMobile so the form can catch mistakes early.
 */
export function parseMobile(input: string): string | null {
  let digits = input.replace(/[\s\-().]/g, "");
  if (digits.startsWith("+91")) digits = digits.slice(3);
  else if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return /^[6-9]\d{9}$/.test(digits) ? digits : null;
}

const NOT_RECORDED = "Not recorded";

const RC_LABELS: Record<string, string> = {
  clear: "Clear",
  hypothecation: "Hypothecated (loan)",
  under_transfer: "Transfer in progress",
};

const SERVICE_LABELS: Record<string, string> = {
  full: "Full history",
  partial: "Partial history",
  none: "No records",
  unknown: "Not known",
};

/** Insurance as a buyer reads it: valid-until date, expired, Nil, or not recorded. */
export function formatInsurance(
  validUntil: string | null | undefined,
  nil: boolean | undefined,
  today: Date = new Date(),
): string {
  if (nil) return "Nil";
  const match = validUntil ? /^(\d{4})-(\d{2})-(\d{2})/.exec(validUntil) : null;
  if (!match) return NOT_RECORDED;
  const end = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  const date = end.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return end < startOfToday ? `Expired ${date}` : `Valid till ${date}`;
}

export function formatRcStatus(status: string | null | undefined): string {
  return status ? (RC_LABELS[status] ?? label(status)) : NOT_RECORDED;
}

export function formatServiceHistory(history: string | null | undefined): string {
  return history ? (SERVICE_LABELS[history] ?? label(history)) : NOT_RECORDED;
}

export function formatAccidentHistory(reported: boolean | undefined): string {
  if (reported === undefined) return NOT_RECORDED;
  return reported ? "Reported" : "None reported";
}
