import { Nav } from "@/components/nav";
import { Collection } from "@/components/sections/collection";
import { Footer } from "@/components/sections/footer";
import { Match } from "@/components/sections/match";
import { Sell } from "@/components/sections/sell";
import { Showcase } from "@/components/sections/showcase";
import { Trust } from "@/components/sections/trust";
import { Visit } from "@/components/sections/visit";
import { site } from "@/data/site";
import { SmoothScroll } from "@/lib/smooth-scroll";

export default function Home() {
  return (
    <SmoothScroll>
      <Nav />
      <main>
        <Showcase />
        <Collection />
        <Match />
        <Sell />
        {site.socialProofReady && <Trust />}
        {site.contactReady && <Visit />}
      </main>
      <Footer />
    </SmoothScroll>
  );
}
