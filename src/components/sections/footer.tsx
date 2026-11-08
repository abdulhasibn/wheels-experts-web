import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { site } from "@/data/site";

export function Footer() {
  return (
    <footer className="border-t border-edge/[0.05] px-5 py-12 sm:px-10 lg:px-16">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <Logo />
        <nav aria-label="Footer" className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted">
          <Link href="/cars" className="hover:text-fg">Buy</Link>
          <Link href="/#sell" className="hover:text-fg">Sell</Link>
          {site.contactReady && (
            <>
              <Link href="/#visit" className="hover:text-fg">Visit</Link>
              <a href={site.phoneHref} className="hover:text-fg">{site.phoneDisplay}</a>
            </>
          )}
        </nav>
        <div className="flex items-center gap-6 text-xs text-subtle">
          <span>© {new Date().getFullYear()} {site.name}</span>
          <a href={site.staffPortalUrl} className="hover:text-muted">
            Staff login
          </a>
        </div>
      </div>
      <p className="mx-auto mt-10 max-w-7xl text-[11px] leading-relaxed text-subtle/70">
        We count visits and which cars are viewed, with an anonymous id, to know which cars and ads people like. No
        third-party trackers.
      </p>
      <p className="mx-auto mt-2 max-w-7xl text-[11px] leading-relaxed text-subtle/70">
        Hero photo via Wikimedia Commons:{" "}
        <a
          href="https://commons.wikimedia.org/wiki/File:2023_Honda_City_e-HEV_RS.jpg"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-muted"
        >
          Honda City
        </a>{" "}
        by Chanokchon (CC BY-SA 4.0).
      </p>
    </footer>
  );
}
