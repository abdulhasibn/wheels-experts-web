import { site } from "@/data/site";

export function whatsappLink(message: string): string {
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export interface TestDriveRequest {
  name: string;
  phone: string;
  car: string;
  date: string;
}

export function testDriveMessage({ name, phone, car, date }: TestDriveRequest): string {
  const when = date
    ? new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })
    : "any day this week";
  return [
    `Hi Wheels Experts, I'd like to book a test drive.`,
    ``,
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Car: ${car || "Not sure yet — happy to see options"}`,
    `Preferred day: ${when}`,
  ].join("\n");
}

export const valuationMessage =
  "Hi Wheels Experts, I'd like a valuation for my car.\n\nMake & model:\nYear:\nKm driven:\nCity:";
