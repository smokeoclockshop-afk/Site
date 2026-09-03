'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Menu as MenuIcon, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { site } from '@/lib/site';
import { cn } from '@/lib/utils';
import { Wordmark } from '@/components/ui/Wordmark';
import { OrderButton } from '@/components/order/OrderButton';
import { MessengerRow } from '@/components/order/MessengerRow';

const NAV = [
  { key: 'smoker', href: '/smoker' },
  { key: 'products', href: '/vyroby' },
  { key: 'master', href: '/maister' },
  { key: 'b2b', href: '/b2b' },
  { key: 'contact', href: '/kontakty' },
] as const;

export function Header() {
  const t = useTranslations('nav');
  const tc = useTranslations('common');
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [overDark, setOverDark] = useState(true); // dark hero sits at the top
  const [menuOpen, setMenuOpen] = useState(false);
  const [prevPath, setPrevPath] = useState(pathname);
  const reduce = useReducedMotion();
  const darkEls = useRef<Element[]>([]);

  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setMenuOpen(false);
  }

  // The bar itself is only a transparent frosted blur — its tint/text adapt to
  // whatever section is currently behind it (dark hero/footer vs parchment).
  useEffect(() => {
    const refreshZones = () => {
      darkEls.current = Array.from(document.querySelectorAll('[data-dark-bg]'));
    };
    const probe = () => {
      setScrolled(window.scrollY > 24);
      const y = 36; // header midline
      let dark = false;
      for (const el of darkEls.current) {
        const r = el.getBoundingClientRect();
        if (r.top <= y && r.bottom >= y) {
          dark = true;
          break;
        }
      }
      setOverDark(dark);
    };
    refreshZones();
    probe();
    const iv = window.setInterval(refreshZones, 1500);
    window.addEventListener('scroll', probe, { passive: true });
    window.addEventListener('resize', probe);
    return () => {
      clearInterval(iv);
      window.removeEventListener('scroll', probe);
      window.removeEventListener('resize', probe);
    };
  }, [pathname]);

  useEffect(() => {
    document.documentElement.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.documentElement.style.overflow = '';
    };
  }, [menuOpen]);

  // Mobile drawer is parchment-light → force dark text while it is open.
  const dark = overDark && !menuOpen;
  const tone: 'dark' | 'light' = dark ? 'light' : 'dark';
  const linkColor = dark
    ? 'text-parchment-50/90 hover:text-parchment-50'
    : 'text-espresso hover:text-saffron-600';
  // Crisp hairline outline in the opposite colour so text stays legible over busy photos.
  const halo = dark ? 'edge-on-dark' : 'edge-on-light';

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-[60] border-b transition-[background-color,border-color] duration-500',
          scrolled || menuOpen
            ? cn(
                'backdrop-blur-xl backdrop-saturate-150',
                dark
                  ? 'border-parchment-50/10 bg-[rgb(23_20_17/0.3)]'
                  : 'border-onyx/10 bg-[rgb(241_234_224/0.3)]',
              )
            : 'border-transparent bg-transparent',
        )}
      >
        <div className="mx-auto flex h-[var(--header-h)] w-full max-w-[1440px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-12">
          <Link href="/" aria-label={site.name} className={cn('shrink-0', halo)}>
            <Wordmark tone={tone} />
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-7 lg:flex xl:gap-9">
            {NAV.map(({ key, href }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={key}
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={cn('relative text-[15px] font-semibold transition-colors', halo, linkColor, active && (dark ? 'text-parchment-50' : 'text-onyx'))}
                >
                  {t(key)}
                  {active && <span aria-hidden className="absolute -bottom-1.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-saffron-500" />}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3 lg:gap-5">
            <a
              href={`tel:${site.workshop.phoneHref}`}
              dir="ltr"
              className={cn('spec hidden whitespace-nowrap text-[0.9rem]! font-bold! transition-colors md:block', halo, linkColor)}
            >
              {site.workshop.phone}
            </a>
            <div className="hidden md:block">
              <OrderButton source="header" variant="saffron" className="px-5 py-2.5">
                {tc('order')}
              </OrderButton>
            </div>
            <button
              type="button"
              aria-label={menuOpen ? tc('closeMenu') : tc('openMenu')}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              className={cn('grid size-10 cursor-pointer place-items-center lg:hidden', halo, dark ? 'text-parchment-50' : 'text-onyx')}
            >
              {menuOpen ? <X className="size-6" aria-hidden /> : <MenuIcon className="size-6" aria-hidden />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="drawer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grain fixed inset-0 z-[55] bg-coal-950 lg:hidden"
          >
            <motion.nav
              aria-label="Mobile"
              className="relative z-10 flex h-full flex-col justify-between px-6 pt-[calc(var(--header-h)+2rem)] pb-10"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={{ visible: { transition: { staggerChildren: reduce ? 0 : 0.05 } }, hidden: {} }}
            >
              <ul className="space-y-1">
                {NAV.map(({ key, href }) => (
                  <motion.li
                    key={key}
                    variants={{
                      hidden: { opacity: 0, y: reduce ? 0 : 16 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
                    }}
                  >
                    <Link href={href} className="display block py-2.5 text-3xl text-smoke-50 transition-colors hover:text-ember-400">
                      {t(key)}
                    </Link>
                  </motion.li>
                ))}
              </ul>
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: reduce ? 0 : 16 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
                }}
                className="flex flex-col gap-4"
              >
                <OrderButton source="mobile-menu" className="w-full">
                  {tc('order')}
                </OrderButton>
                <MessengerRow place="mobile-menu" />
              </motion.div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
