import { Counter } from "@/components/ui/counter";
import { Reveal } from "@/components/ui/reveal";
import { stats, testimonials } from "@/data/site";

export function Trust() {
  return (
    <section aria-label="Why customers trust us" className="border-y border-edge/[0.05] px-5 py-28 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <dl className="grid grid-cols-2 gap-y-12 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col-reverse border-l border-edge/[0.08] pl-6">
              <dt className="mt-1 text-sm text-muted">{stat.label}</dt>
              <dd className="text-[clamp(2.4rem,5vw,4rem)] font-semibold tracking-[-0.04em] text-gradient">
                <Counter value={stat.value} suffix={stat.suffix} />
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-28 grid gap-12 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.1}>
              <figure>
                <blockquote className="text-xl leading-snug tracking-tight text-fg/90">&ldquo;{t.quote}&rdquo;</blockquote>
                <figcaption className="mt-5 text-sm">
                  <span className="font-semibold">{t.name}</span>
                  <span className="text-subtle"> · {t.detail}</span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
