import { Nav } from "@/components/nav";
import { Collection } from "@/components/sections/collection";
import { Footer } from "@/components/sections/footer";
import { Match } from "@/components/sections/match";
import { Sell } from "@/components/sections/sell";
import { Showcase } from "@/components/sections/showcase";
import { Trust } from "@/components/sections/trust";
import { Visit } from "@/components/sections/visit";
import { site } from "@/data/site";
import { carStatus, getCars, type Page, type PublicCar } from "@/lib/api";
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

  // Sold cars belong on /cars and their detail page only: never feature, score or link them here.
  // Available cars sort first, so once a sold car shows up we have seen every available one.
  const available = stock.items.filter((car) => carStatus(car) === "available");
  const availableTotal = available.length < stock.items.length || stock.items.length >= stock.total ? available.length : stock.total;

  return (
    <SmoothScroll>
      <Nav />
      <main>
        <Showcase />
        <Collection cars={available.slice(0, FEATURED)} total={availableTotal} />
        <Match cars={available} />
        <Sell />
        {site.socialProofReady && <Trust />}
        {site.contactReady && <Visit cars={available} />}
      </main>
      <Footer />
    </SmoothScroll>
  );
}
