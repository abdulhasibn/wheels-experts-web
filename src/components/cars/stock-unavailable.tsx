import { site } from "@/data/site";

/** The stock API could not be reached and there is no cached page to serve. */
export function StockUnavailable() {
  return (
    <div className="mt-12 rounded-[28px] border border-dashed border-edge/10 p-10 text-center">
      <p className="text-xl font-semibold">We&apos;re updating our stock.</p>
      <p className="mt-2 text-muted">Please check back in a few minutes.</p>
      {site.contactReady && (
        <a href={site.phoneHref} className="mt-6 inline-block text-sm font-medium text-teal hover:text-teal-soft">
          Or call us on {site.phoneDisplay} →
        </a>
      )}
    </div>
  );
}
