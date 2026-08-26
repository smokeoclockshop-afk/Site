'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import type { SiteContent } from '@/lib/content';
import { Container } from '@/components/ui/Container';
import { Slot } from '@/components/ui/Slot';
import { OrderButton } from '@/components/order/OrderButton';
import { triggerBurst } from '@/components/effects/burst';

type Data = SiteContent['products'];

export function CatalogView({ data }: { data: Data }) {
  const [tab, setTab] = useState(data.tabs[0].slug);
  const [fastOnly, setFastOnly] = useState(false);

  const items = data.items.filter(
    (it) => it.tab === tab && (!fastOnly || (it.badge?.includes('днів') ?? false)),
  );

  return (
    <section className="pt-[calc(var(--header-h)+3rem)] pb-24">
      <Container>
        <p className="kicker">{data.kicker}</p>
        <h1 className="display struck mt-3 text-[clamp(2.5rem,6vw,4.5rem)] text-smoke-50">{data.title}</h1>
        <p className="mt-5 max-w-2xl leading-relaxed text-smoke-300">{data.intro}</p>

        {/* Tabs */}
        <div className="no-scrollbar mt-10 flex gap-6 overflow-x-auto border-b border-[color:rgb(44_44_44/0.12)]">
          {data.tabs.map((t) => {
            const active = tab === t.slug;
            return (
              <button
                key={t.slug}
                type="button"
                onClick={(e) => {
                  setTab(t.slug);
                  triggerBurst(e.clientX, e.clientY, 'sparks');
                }}
                className={cn('relative shrink-0 whitespace-nowrap pb-3 text-sm transition-colors', active ? 'text-smoke-50' : 'text-ash-500 hover:text-smoke-300')}
              >
                {t.label}
                {active && <motion.span layoutId="catalog-tab" className="absolute inset-x-0 -bottom-px h-0.5 bg-ember-500" />}
              </button>
            );
          })}
        </div>

        {/* Filter */}
        <label className="mt-6 inline-flex cursor-pointer items-center gap-2 text-sm text-smoke-300">
          <input type="checkbox" checked={fastOnly} onChange={(e) => setFastOnly(e.target.checked)} className="size-4 accent-ember-500" />
          {data.filterLabel}
        </label>

        {/* Grid */}
        <motion.div layout className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {items.map((it) => (
            <motion.article
              key={`${it.tab}-${it.name}`}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="group relative flex flex-col border border-[color:rgb(44_44_44/0.12)] bg-coal-800"
            >
              <div className="relative overflow-hidden">
                <Slot id={it.slot} imgClassName="transition-transform duration-500 group-hover:scale-[1.04]" />
                {it.badge && (
                  <span className={cn('spec absolute left-2 top-2 px-2 py-1', it.badge.includes('днів') ? 'bg-coal-950/80 text-smoke-300' : 'bg-ember-500 text-onyx')}>
                    {it.badge}
                  </span>
                )}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-ember-500/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="text-smoke-50">{it.name}</h3>
                <p className="spec mt-1 text-ember-500">{it.from}</p>
                <div className="mt-4 flex-1" />
                {it.action === 'smoker' ? (
                  <Link href="/smoker" className="inline-flex w-full items-center justify-center rounded-[2px] border border-[color:rgb(44_44_44/0.2)] py-2.5 text-sm text-smoke-50 transition-colors hover:bg-smoke-50/8">
                    Дивитись
                  </Link>
                ) : (
                  <OrderButton source={`catalog:${it.slug ?? it.name}`} payload={{ product: it.name }} variant="ghost" className="w-full py-2.5">
                    Замовити
                  </OrderButton>
                )}
              </div>
            </motion.article>
          ))}
        </motion.div>

        <p className="mt-14 max-w-3xl text-sm leading-relaxed text-ash-500">{data.seoText}</p>
      </Container>
    </section>
  );
}
