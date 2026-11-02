import { Nav } from "@/components/nav";
import { Collection } from "@/components/sections/collection";
import { Footer } from "@/components/sections/footer";
import { Match } from "@/components/sections/match";
import { Sell } from "@/components/sections/sell";
import { Showcase } from "@/components/sections/showcase";
import { Trust } from "@/components/sections/trust";
import { Visit } from "@/components/sections/visit";
import { site } from "@/data/site";
import { getCars, type Page, type PublicCar } from "@/lib/api";
import { SmoothScroll } from "@/lib/smooth-scroll";

/** Cars on the home page strip; Match scores a wider slice of stock. */
const FEATURED = 8;
const MATCH_POOL = 48;

export default async function Home() {
  // The home page must render even if the stock API is down.
  const stock: Page<PublicCar> = await getCars({ limit: MATCH_POOL }).catch(() => ({
    items: [],
    total: 0,
    limit: MATCH_POOL,
    offset: 0,
  }));

  return (
    <SmoothScroll>
      <Nav />
      <main>
        <Showcase />
        <Collection cars={stock.items.slice(0, FEATURED)} total={stock.total} />
        <Match cars={stock.items} />
        <Sell />
        {site.socialProofReady && <Trust />}
        {site.contactReady && <Visit cars={stock.items} />}
      </main>
      <Footer />
    </SmoothScroll>
  );
}
