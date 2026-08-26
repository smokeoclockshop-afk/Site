'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSlot } from '@/lib/media';
import type { SiteContent } from '@/lib/content';
import { Container } from '@/components/ui/Container';
import { Slot } from '@/components/ui/Slot';
import { Reveal } from '@/components/ui/Reveal';
import { Odometer } from '@/components/shared/Odometer';
import { OrderButton } from '@/components/order/OrderButton';
import { StickyCtaBar } from '@/components/order/StickyCtaBar';
import { track } from '@/lib/analytics';

/* eslint-disable @next/next/no-img-element */

const BASE_PRICE = 25000;
const fmt = new Intl.NumberFormat('uk-UA');

export function SmokerView({ data, stickyBar }: { data: SiteContent['smoker']; stickyBar: SiteContent['stickyBar'] }) {
  const [active, setActive] = useState(0);
  const [opts, setOpts] = useState<Set<string>>(new Set());
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const total = BASE_PRICE + data.options.filter((o) => opts.has(o.id)).reduce((s, o) => s + o.price, 0);
  const selectedLabels = data.options.filter((o) => opts.has(o.id)).map((o) => o.label);
  const gallery = Array.from({ length: data.galleryCount }, (_, i) => `ph.smoker.g${String(i + 1).padStart(2, '0')}`);
  const activeSlot = getSlot(gallery[active]);

  function toggle(id: string) {
    setOpts((prev) => {
      const next = new Set(prev);
      const checked = !next.has(id);
      if (checked) next.add(id);
      else next.delete(id);
      track('config_change', { option: id, checked });
      return next;
    });
  }

  return (
    <>
      <section className="pt-[calc(var(--header-h)+2.5rem)] pb-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-2">
            {/* Gallery */}
            <div>
              <div className="relative aspect-[4/3] overflow-hidden bg-coal-800">
                <AnimatePresence mode="popLayout">
                  <motion.img
                    key={activeSlot.src}
                    src={activeSlot.src}
                    alt={activeSlot.alt}
                    className="absolute inset-0 h-full w-full object-cover"
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </AnimatePresence>
              </div>
              <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
                {gallery.map((id, i) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActive(i)}
                    aria-label={`Фото ${i + 1}`}
                    className={cn('relative aspect-square w-16 shrink-0 overflow-hidden border', i === active ? 'border-ember-500' : 'border-transparent opacity-70')}
                  >
                    <img src={getSlot(id).src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Buy panel */}
            <div>
              <h1 className="display struck text-[clamp(2.2rem,5vw,3.6rem)] text-smoke-50">{data.name}</h1>
              <p className="mt-2 text-smoke-300">{data.tagline}</p>

              <div className="mt-6 flex items-end gap-4">
                <span className="display text-4xl text-smoke-50">
                  <Odometer value={`${fmt.format(total)} ₴`} />
                </span>
              </div>
              <p className="spec mt-1 text-ash-500">{data.perMonth}</p>

              <div className="mt-4 inline-flex items-center gap-2 border border-ember-500/40 bg-ember-500/10 px-3 py-2">
                <ShieldCheck className="size-4 text-ember-500" aria-hidden />
                <span className="spec text-smoke-50">{data.warranty}</span>
              </div>

              <p className="spec mt-4 text-ash-500">{data.status}</p>

              {/* Configurator */}
              <div className="mt-6">
                <p className="kicker mb-3">{data.optionsTitle}</p>
                <div className="space-y-2">
                  {data.options.map((o) => (
                    <label key={o.id} className="flex cursor-pointer items-center justify-between gap-3 border border-[color:rgb(44_44_44/0.14)] px-4 py-3 transition-colors hover:border-[color:rgb(44_44_44/0.2)] has-[:checked]:border-ember-500/50 has-[:checked]:bg-ember-500/5">
                      <span className="flex items-center gap-3 text-sm text-smoke-50">
                        <input type="checkbox" checked={opts.has(o.id)} onChange={() => toggle(o.id)} className="size-4 accent-ember-500" />
                        {o.label}
                      </span>
                      <span className="spec text-ash-500">+{fmt.format(o.price)} ₴</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <OrderButton source="product" payload={{ product: data.name, config: selectedLabels }} className="w-full sm:w-auto">
                  {data.cta}
                </OrderButton>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Specs */}
      <section className="bg-coal-900 py-16">
        <Container>
          <Reveal className="mx-auto max-w-3xl">
            <p className="kicker">{data.specsTitle}</p>
            <dl className="mt-6 grid grid-cols-2 gap-x-10 gap-y-4 sm:grid-cols-3">
              {data.specs.map((s) => (
                <div key={s.label} className="border-b border-[color:rgb(44_44_44/0.1)] pb-3">
                  <dt className="spec text-ash-500">{s.label}</dt>
                  <dd className="spec mt-1 text-lg text-smoke-50">{s.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </Container>
      </section>

      {/* Cooked on this smoker */}
      <section className="py-16">
        <Container>
          <h2 className="display text-2xl text-smoke-50">{data.cookedTitle}</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            {data.cooked.map((c) => (
              <a key={c.title} href={c.href} className="group block">
                <Slot id={c.slot} imgClassName="transition-transform duration-500 group-hover:scale-[1.03]" />
                <p className="mt-2 text-smoke-50">{c.title}</p>
              </a>
            ))}
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="bg-coal-900 py-16">
        <Container>
          <div className="mx-auto max-w-3xl">
            <h2 className="display text-2xl text-smoke-50">{data.faqTitle}</h2>
            <div className="mt-6 divide-y divide-[color:rgb(44_44_44/0.1)]">
              {data.faq.map((f, i) => {
                const open = openFaq === i;
                return (
                  <div key={f.q} className={cn('border-l-2 pl-4', open ? 'border-ember-500' : 'border-transparent')}>
                    <button
                      type="button"
                      onClick={() => setOpenFaq(open ? null : i)}
                      aria-expanded={open}
                      className="flex w-full cursor-pointer items-center justify-between gap-4 py-4 text-left text-smoke-50"
                    >
                      {f.q}
                      <ChevronDown className={cn('size-5 shrink-0 text-ash-500 transition-transform', open && 'rotate-180')} aria-hidden />
                    </button>
                    <div className={cn('grid transition-[grid-template-rows] duration-300', open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
                      <div className="overflow-hidden">
                        <p className="pb-4 leading-relaxed text-smoke-300">{f.a}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Container>
      </section>

      {/* Cross-sell */}
      <section className="py-16">
        <Container>
          <h2 className="display text-2xl text-smoke-50">{data.crossSellTitle}</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            {data.crossSell.map((c) => (
              <div key={c.name} className="grain relative border border-[color:rgb(44_44_44/0.12)] bg-coal-800 p-4">
                <Slot id={c.slot} className="relative z-10" />
                <p className="relative z-10 mt-3 text-smoke-50">{c.name}</p>
                <p className="spec relative z-10 text-ember-500">{c.from}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Final CTA */}
      <section className="bg-coal-900 py-20 text-center">
        <Container>
          <h2 className="display struck text-[clamp(1.8rem,4vw,3rem)] text-smoke-50">{data.finalTitle}</h2>
          <div className="mt-8">
            <OrderButton source="product-final" payload={{ product: data.name, config: selectedLabels }}>{data.finalCta}</OrderButton>
          </div>
        </Container>
      </section>

      <StickyCtaBar price={stickyBar.price} cta={stickyBar.cta} source="sticky-smoker" threshold={500} />
    </>
  );
}
