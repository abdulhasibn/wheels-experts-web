import { Logo } from "@/components/ui/logo";
import { inventory } from "@/data/inventory";
import { site } from "@/data/site";

export function Footer() {
  return (
    <footer className="border-t border-edge/[0.05] px-5 py-12 sm:px-10 lg:px-16">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <Logo />
        <nav aria-label="Footer" className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted">
          <a href="#buy" className="hover:text-fg">Buy</a>
          <a href="#sell" className="hover:text-fg">Sell</a>
          {site.contactReady && (
            <>
              <a href="#visit" className="hover:text-fg">Visit</a>
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
        Sample listing photos via Wikimedia Commons:{" "}
        {inventory.map((car, i) => (
          <span key={car.id}>
            <a href={car.photo.source} target="_blank" rel="noopener noreferrer" className="hover:text-muted">
              {car.model}
            </a>{" "}
            by {car.photo.author} ({car.photo.license}){i < inventory.length - 1 ? " · " : "."}
          </span>
        ))}
      </p>
    </footer>
  );
}
