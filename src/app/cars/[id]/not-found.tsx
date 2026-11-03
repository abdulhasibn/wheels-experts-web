import Link from "next/link";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/sections/footer";

export default function CarNotFound() {
  return (
    <>
      <Nav />
      <main className="mx-auto flex min-h-[70svh] max-w-xl flex-col items-center justify-center px-5 pt-24 text-center">
        <p className="eyebrow mb-4">Not available</p>
        <h1 className="text-3xl font-semibold tracking-tight">This car has found a new home.</h1>
        <p className="mt-3 text-muted">It may have been sold or taken off our floor. Here&apos;s what&apos;s in stock now.</p>
        <Link
          href="/cars"
          className="mt-8 inline-flex h-12 items-center rounded-full bg-teal px-6 text-sm font-semibold text-ink transition hover:bg-teal-soft"
        >
          Browse cars
        </Link>
      </main>
      <Footer />
    </>
  );
}
