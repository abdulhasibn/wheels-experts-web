"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { site } from "@/data/site";
import { Logo } from "./ui/logo";

// Root-relative so the same nav works on the home page and on /cars.
const LINKS = [
  { href: "/cars", label: "Buy" },
  { href: "/#match", label: "Find your match" },
  { href: "/#sell", label: "Sell" },
  ...(site.contactReady ? [{ href: "/#visit", label: "Visit" }] : []),
];

const CTA = { href: "/cars", label: "Browse cars" };

export function Nav() {
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setSolid(y > 24);
      setHidden(y > 240 && y > last);
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={clsx(
        "fixed inset-x-0 top-0 z-50 transition-transform duration-500 ease-out-expo",
        hidden && "-translate-y-full",
      )}
    >
      <nav
        aria-label="Primary"
        className={clsx(
          "mx-auto mt-3 flex h-14 max-w-6xl items-center justify-between rounded-2xl px-4 transition-colors duration-500 sm:px-5 mx-3 sm:mx-auto",
          solid ? "glass" : "border border-transparent",
        )}
      >
        <Link href="/" aria-label="Wheels Experts — home">
          <Logo />
        </Link>
        <ul className="hidden items-center gap-8 text-sm text-muted md:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="transition-colors hover:text-fg">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2.5">
          <Link
            href={CTA.href}
            className="rounded-full bg-fg px-4 py-2 text-[13px] font-semibold text-ink transition hover:bg-teal-soft"
          >
            {CTA.label}
          </Link>
        </div>
      </nav>
    </header>
  );
}
