export type Fuel = "petrol" | "diesel" | "cng" | "electric";
export type Transmission = "manual" | "automatic";
export type BodyType = "hatchback" | "sedan" | "suv" | "muv";

export interface Car {
  id: string;
  make: string;
  model: string;
  variant: string;
  year: number;
  km: number;
  fuel: Fuel;
  transmission: Transmission;
  bodyType: BodyType;
  /** Listed price in ₹ lakh. */
  priceLakh: number;
  owners: number;
  /** Paint colour in the photo — tints the card's glow. */
  paint: string;
  photo: Photo;
}

export interface Photo {
  src: string;
  author: string;
  license: string;
  /** Wikimedia Commons file page. */
  source: string;
}

const commons = (file: string) => `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file.replace(/ /g, "_"))}`;

export const FUEL_LABEL: Record<Fuel, string> = {
  petrol: "Petrol",
  diesel: "Diesel",
  cng: "CNG",
  electric: "Electric",
};

export const TRANSMISSION_LABEL: Record<Transmission, string> = {
  manual: "Manual",
  automatic: "Automatic",
};

export const BODY_LABEL: Record<BodyType, string> = {
  hatchback: "Hatchback",
  sedan: "Sedan",
  suv: "SUV",
  muv: "MUV",
};

/**
 * SAMPLE listings. There is no public inventory API yet, so the collection is
 * curated here; swap for live stock once the backend exposes one. Photos are
 * freely licensed shots of each model from Wikimedia Commons (credited in the
 * footer) until the showroom's own listing photos are used.
 */
export const inventory: Car[] = [
  { id: "creta-22", make: "Hyundai", model: "Creta", variant: "SX(O) 1.5 CRDi", year: 2022, km: 28400, fuel: "diesel", transmission: "automatic", bodyType: "suv", priceLakh: 16.9, owners: 1, paint: "#8a8f93",
    photo: { src: "/cars/creta-22.jpg", author: "Andra Febrian", license: "CC BY-SA 4.0", source: commons("2022 Hyundai Creta Prime (Indonesia) front view.jpg") } },
  { id: "nexon-ev-23", make: "Tata", model: "Nexon EV", variant: "Max XZ+ Lux", year: 2023, km: 18900, fuel: "electric", transmission: "automatic", bodyType: "suv", priceLakh: 14.2, owners: 1, paint: "#14505a",
    photo: { src: "/cars/nexon-ev-23.jpg", author: "DriveSpark", license: "CC BY 3.0", source: commons("2020 Tata Nexon EV (India) front view.png") } },
  { id: "swift-21", make: "Maruti Suzuki", model: "Swift", variant: "ZXi+", year: 2021, km: 31200, fuel: "petrol", transmission: "manual", bodyType: "hatchback", priceLakh: 6.4, owners: 1, paint: "#b91c1c",
    photo: { src: "/cars/swift-21.jpg", author: "Alexander-93", license: "CC BY-SA 4.0", source: commons("2020 Suzuki Swift Facelift IMG 1884.jpg") } },
  { id: "xuv700-22", make: "Mahindra", model: "XUV700", variant: "AX7 Diesel", year: 2022, km: 41000, fuel: "diesel", transmission: "automatic", bodyType: "suv", priceLakh: 21.5, owners: 1, paint: "#1d3fae",
    photo: { src: "/cars/xuv700-22.jpg", author: "DriveSpark", license: "CC BY 3.0", source: commons("2021 Mahindra XUV700 2.2 AX7 (India) front view.png") } },
  { id: "city-22", make: "Honda", model: "City", variant: "ZX i-VTEC CVT", year: 2022, km: 22700, fuel: "petrol", transmission: "automatic", bodyType: "sedan", priceLakh: 12.8, owners: 1, paint: "#e7ebea",
    photo: { src: "/cars/city-22.jpg", author: "Chanokchon", license: "CC BY-SA 4.0", source: commons("2023 Honda City e-HEV RS.jpg") } },
  { id: "seltos-21", make: "Kia", model: "Seltos", variant: "HTX 1.5", year: 2021, km: 36500, fuel: "petrol", transmission: "manual", bodyType: "suv", priceLakh: 13.1, owners: 2, paint: "#c9a516",
    photo: { src: "/cars/seltos-21.jpg", author: "Areaseven", license: "CC BY-SA 4.0", source: commons("2020 Kia Seltos SX - Front.jpg") } },
  { id: "crysta-20", make: "Toyota", model: "Innova Crysta", variant: "2.4 VX 7-seater", year: 2020, km: 64000, fuel: "diesel", transmission: "manual", bodyType: "muv", priceLakh: 18.7, owners: 1, paint: "#e7ebea",
    photo: { src: "/cars/crysta-20.jpg", author: "Premnath Kudva", license: "CC BY-SA 4.0", source: commons("Toyota Innova Crysta 2.4 Z front right.jpg") } },
  { id: "baleno-22", make: "Maruti Suzuki", model: "Baleno", variant: "Zeta S-CNG", year: 2022, km: 27800, fuel: "cng", transmission: "manual", bodyType: "hatchback", priceLakh: 7.2, owners: 1, paint: "#1e3a8a",
    photo: { src: "/cars/baleno-22.jpg", author: "Milind Kwatra", license: "CC BY 3.0", source: commons("2022 Maruti Suzuki Baleno Alpha (India) front view.jpg") } },
];

export function formatLakh(lakh: number): string {
  return `₹${lakh.toFixed(lakh < 10 ? 2 : 1)} L`;
}

export function formatKm(km: number): string {
  return `${new Intl.NumberFormat("en-IN").format(km)} km`;
}
