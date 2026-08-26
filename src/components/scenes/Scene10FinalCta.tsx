'use client';

import { Link } from '@/i18n/navigation';
import type { SiteContent } from '@/lib/content';
import { site } from '@/lib/site';
import { track } from '@/lib/analytics';
import { Container } from '@/components/ui/Container';
import { EmberField } from '@/components/effects/EmberField';
import { MessengerRow } from '@/components/order/MessengerRow';

type Data = SiteContent['home']['finalCta'];

export function Scene10FinalCta({ data }: { data: Data }) {
  return (
    <section className="relative flex min-h-[92dvh] items-center overflow-hidden bg-coal-950 py-28">
      <EmberField rate={22} repel variant="dark" />
      <Container className="relative z-10 text-center">
        <h2 className="display struck mx-auto max-w-4xl text-[clamp(2.5rem,7vw,6rem)] text-smoke-50">{data.title}</h2>

        <div className="mt-9">
          <Link
            href="/smoker"
            onClick={() => track('cta_hero_click', { which: 'final' })}
            className="cta-glow inline-flex items-center rounded-[2px] bg-ember-500 px-9 py-4 text-base font-semibold text-onyx transition-transform duration-300 hover:scale-[1.02] hover:bg-ember-600"
          >
            {data.cta}
          </Link>
        </div>

        <MessengerRow place="final-cta" big className="mt-8 justify-center" />

        <p className="spec mt-8 text-ash-500">{data.sla}</p>
        <p className="mt-3">
          <span className="spec text-ash-500">{data.phoneLabel}: </span>
          <a href={`tel:${site.workshop.phoneHref}`} className="spec text-xl text-smoke-50 hover:text-ember-400" dir="ltr">
            {site.workshop.phone}
          </a>
        </p>
      </Container>
    </section>
  );
}
