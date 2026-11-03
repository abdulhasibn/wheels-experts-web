# Wheels Experts — public website

Customer-facing site for the Wheels Experts showroom (buyers and people selling their car). This is separate from the AutoLead staff app in `../autoLeadFrontend`.

```bash
pnpm install
pnpm dev        # http://localhost:3002
pnpm build
```

The stack is Next.js 16, Tailwind v4, React Three Fiber, GSAP ScrollTrigger and Lenis.

## Before launch: replace the placeholders

| What | Where |
| --- | --- |
| 3D car model | `public/models/car.glb`: the three.js example car (MIT). Swap the file and edit `src/lib/car-model.ts` (nose direction, length, which material is paint, glass, chrome…) |
| Studio lighting | `public/env/studio.hdr`: Poly Haven "Studio Small 09" (CC0) |
| Camera shots per scroll panel | `src/lib/showcase.ts` |
| Phone, WhatsApp number, address, hours, stats, testimonials | `src/data/site.ts` |
| Cars on the floor | Live from AutoLead's anonymous `/public` API. Set `NEXT_PUBLIC_API_URL` (default `http://localhost:4000`); the backend must list this site's origin in `PUBLIC_SITE_ORIGINS` |
| Staff login link | `NEXT_PUBLIC_STAFF_PORTAL_URL` |

`/cars` lists every Listed car with filters; `/cars/[id]` shows photos and specs. **Location for test drive** asks for name + mobile, creates a `website` lead in AutoLead (`POST /public/test-drive-requests`), and only then reveals the showroom address. Stock pages revalidate every 5 minutes. Valuation requests still open WhatsApp.
