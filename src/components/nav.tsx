"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
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
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // Links close the phone menu themselves; Escape closes it too.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

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
        hidden && !menuOpen && "-translate-y-full",
      )}
    >
      <nav
        aria-label="Primary"
        className={clsx(
          "mx-auto mt-3 flex h-14 max-w-6xl items-center justify-between rounded-2xl px-4 transition-colors duration-500 sm:px-5 mx-3 sm:mx-auto",
          solid || menuOpen ? "glass" : "border border-transparent",
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
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="-mr-2 grid size-11 place-items-center rounded-full text-fg transition hover:bg-edge/5 md:hidden"
          >
            {menuOpen ? <X aria-hidden className="size-5" /> : <Menu aria-hidden className="size-5" />}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            tabIndex={-1}
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 top-[4.25rem] -z-10 bg-black/50 backdrop-blur-sm md:hidden"
          />
          <ul
            id="mobile-menu"
            className="mx-3 mt-2 overflow-hidden rounded-2xl border border-edge/[0.06] bg-ink-2/95 p-2 backdrop-blur-xl md:hidden"
          >
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={pathname === link.href ? "page" : undefined}
                  className="flex h-12 items-center rounded-xl px-4 text-base text-muted transition hover:bg-edge/5 hover:text-fg aria-[current=page]:text-fg"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </header>
  );
}
