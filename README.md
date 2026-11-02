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
| Cars on the floor | `src/data/inventory.ts`. Sample data for now; there is no public inventory API yet |
| Staff login link | `NEXT_PUBLIC_STAFF_PORTAL_URL` |

Test-drive and valuation requests open WhatsApp with the message pre-filled. To have them land in AutoLead as `website` leads, the backend needs a public lead-intake endpoint.
