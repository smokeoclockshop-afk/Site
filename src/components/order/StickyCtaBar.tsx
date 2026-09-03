'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useOrder } from './OrderModalContext';

/**
 * Mobile-only sticky CTA (price + order). Appears after `threshold` px of
 * scroll; hides while the order modal is open. Safe-area aware.
 */
export function StickyCtaBar({
  price,
  cta,
  source,
  threshold = 640,
}: {
  price: string;
  cta: string;
  source: string;
  threshold?: number;
}) {
  const { open, isOpen } = useOrder();
  const [show, setShow] = useState(false);
  const [footerIn, setFooterIn] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > threshold);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  // Never cover the footer links: hide while any part of the footer is on screen.
  useEffect(() => {
    const footer = document.querySelector('footer');
    if (!footer) return;
    const io = new IntersectionObserver(([e]) => setFooterIn(e.isIntersecting), { threshold: 0 });
    io.observe(footer);
    return () => io.disconnect();
  }, []);

  return (
    <AnimatePresence>
      {show && !isOpen && !footerIn && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-between gap-3 border-t border-[color:rgb(44_44_44/0.14)] bg-coal-900/95 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden"
        >
          <span className="spec text-smoke-50">{price}</span>
          <button
            type="button"
            onClick={() => open(source)}
            className="cta-glow cursor-pointer rounded-[2px] bg-ember-500 px-6 py-2.5 text-sm font-semibold text-onyx"
          >
            {cta}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
