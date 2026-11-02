/**
 * Showroom details shown across the site.
 * PLACEHOLDER values — replace with the real showroom's details before launch.
 */
export const site = {
  name: "Wheels Experts",
  /**
   * Off until the real phone, WhatsApp number and address are filled in below.
   * While off, the Visit section, test-drive/valuation buttons and phone links are hidden.
   */
  contactReady: false,
  /** Off until the stats and testimonials below are real. Hides the trust section. */
  socialProofReady: false,
  // Same placeholder help line the staff app shows (autoLeadFrontend system header).
  phoneDisplay: "+91 88880 00000",
  phoneHref: "tel:+918888000000",
  whatsappNumber: "918888000000",
  address: ["Wheels Experts Showroom", "100 Feet Road, Indiranagar", "Bengaluru, Karnataka 560038"],
  hours: [
    { days: "Mon – Sat", time: "10:00 – 20:00" },
    { days: "Sunday", time: "11:00 – 18:00" },
  ],
  mapUrl: "https://maps.google.com/?q=Indiranagar+Bengaluru",
  staffPortalUrl: process.env.NEXT_PUBLIC_STAFF_PORTAL_URL ?? "https://app.wheelsexperts.in/login",
} as const;

/** PLACEHOLDER figures. */
export const stats = [
  { value: 1200, suffix: "+", label: "Cars delivered" },
  { value: 140, suffix: "", label: "Point inspection" },
  { value: 98, suffix: "%", label: "Owners who'd sell with us again" },
  { value: 9, suffix: " yrs", label: "On the road" },
] as const;

/** PLACEHOLDER testimonials. */
export const testimonials = [
  {
    quote: "They showed me the service book before I even asked. No surprises on delivery day.",
    name: "Arjun M.",
    detail: "Bought a 2021 Kia Seltos",
  },
  {
    quote: "I listed my car on Monday and had a buyer by Saturday. They handled every call.",
    name: "Priya S.",
    detail: "Sold a 2019 Honda City",
  },
  {
    quote: "Loan clearance and RC transfer were sorted for me. I just signed and drove off.",
    name: "Rahul K.",
    detail: "Bought a 2022 Tata Nexon EV",
  },
] as const;
