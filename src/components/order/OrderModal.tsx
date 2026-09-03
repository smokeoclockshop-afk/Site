'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isValidPhone, submitLead } from '@/lib/lead';
import { track } from '@/lib/analytics';
import { StampText } from '@/components/shared/StampText';
import { MessengerRow } from './MessengerRow';
import { useOrder } from './OrderModalContext';

type Status = 'idle' | 'sending' | 'success' | 'error';

const field =
  'w-full rounded-[2px] border border-[color:rgb(44_44_44/0.16)] bg-coal-950 px-3.5 py-2.5 text-smoke-50 placeholder:text-ash-500 transition-colors focus:border-ember-500';
const label = 'mb-1 block text-[11px] font-medium uppercase tracking-[0.14em] text-ash-500';

export function OrderModal() {
  const { isOpen, close, source, payload, content } = useOrder();
  const [status, setStatus] = useState<Status>('idle');
  const [phoneErr, setPhoneErr] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.documentElement.style.overflow = isOpen ? 'hidden' : '';
    if (!isOpen) {
      return () => {
        document.documentElement.style.overflow = '';
      };
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('keydown', onKey);
    // Reset + focus on the next tick (async, so no synchronous cascading render).
    const t = setTimeout(() => {
      setStatus('idle');
      setPhoneErr(false);
      nameRef.current?.focus();
    }, 60);
    return () => {
      document.removeEventListener('keydown', onKey);
      clearTimeout(t);
      document.documentElement.style.overflow = '';
    };
  }, [isOpen, close]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const phone = String(fd.get('phone') ?? '');
    if (!isValidPhone(phone)) {
      setPhoneErr(true);
      (form.elements.namedItem('phone') as HTMLInputElement)?.focus();
      return;
    }
    setPhoneErr(false);
    setStatus('sending');
    try {
      await submitLead({
        source,
        name: fd.get('name'),
        phone,
        comment: fd.get('comment'),
        channel: fd.get('channel'),
        config: payload.config,
        answers: payload.answers,
        result: payload.result,
        product: payload.product,
      });
      setStatus('success');
      track('lead_submit', { source });
      form.reset();
    } catch {
      setStatus('error');
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-80 flex items-end justify-center p-0 sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <button
            aria-label="Закрити"
            onClick={close}
            className="absolute inset-0 cursor-default bg-roast-900/60 backdrop-blur-sm"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={content.title}
            data-no-burst
            initial={{ opacity: 0, y: 24, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.99 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            data-lenis-prevent
            className="grain relative z-10 max-h-[94dvh] w-full max-w-lg overflow-y-auto overscroll-contain border-t border-[color:rgb(44_44_44/0.14)] bg-coal-800 p-5 sm:border sm:p-6"
          >
            {/* z-20: the body below is a `relative z-10` layer (above the grain),
                so the button must sit above it or clicks land on the heading. */}
            <button
              onClick={close}
              aria-label="Закрити"
              className="absolute end-4 top-4 z-20 grid size-9 cursor-pointer place-items-center text-ash-500 transition-colors hover:text-smoke-50"
            >
              <X className="size-5" aria-hidden />
            </button>

            {status === 'success' ? (
              <div className="relative z-10 flex flex-col items-center py-6 text-center">
                <StampText className="text-2xl sm:text-3xl">{content.successTitle}</StampText>
                <p className="mt-4 max-w-sm text-sm text-smoke-300">{content.successBody}</p>
                <MessengerRow place="order-success" className="mt-6 justify-center" />
              </div>
            ) : (
              <div className="relative z-10">
                <h2 className="display pr-10 text-[1.6rem] leading-tight text-smoke-50 sm:text-3xl">{content.title}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-smoke-300">{content.subtitle}</p>

                {(payload.product || payload.result || (payload.config && payload.config.length > 0)) && (
                  <p className="spec mt-2.5 text-ember-400">
                    {payload.product}
                    {payload.result && <> → {payload.result}</>}
                    {payload.config && payload.config.length > 0 && <span className="text-smoke-300"> + {payload.config.join(' · ')}</span>}
                  </p>
                )}

                <form onSubmit={onSubmit} className="mt-4 space-y-3" noValidate>
                  <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="o-name" className={label}>{content.name}</label>
                    <input ref={nameRef} id="o-name" name="name" required autoComplete="name" className={field} />
                  </div>
                  <div>
                    <label htmlFor="o-phone" className={label}>{content.phone}</label>
                    <input
                      id="o-phone"
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      required
                      autoComplete="tel"
                      placeholder="+38 (0__) ___-__-__"
                      dir="ltr"
                      aria-invalid={phoneErr}
                      className={cn(field, phoneErr && 'border-ember-500')}
                    />
                    {phoneErr && (
                      <p role="alert" aria-live="polite" className="mt-1.5 text-xs text-ember-400">
                        {content.phoneError}
                      </p>
                    )}
                  </div>
                  </div>
                  <div>
                    <label htmlFor="o-comment" className={label}>{content.comment}</label>
                    <textarea id="o-comment" name="comment" rows={2} className={cn(field, 'min-h-[2.75rem] resize-y py-2')} />
                  </div>
                  <fieldset className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <legend className={cn(label, 'float-left mb-0 mr-1')}>{content.channelLabel}</legend>
                    <div className="flex flex-wrap gap-2">
                      {content.channels.map((ch, i) => (
                        <label
                          key={ch}
                          className="inline-flex cursor-pointer items-center gap-2 border border-[color:rgb(44_44_44/0.16)] px-3 py-1.5 text-sm text-smoke-300 transition-colors has-[:checked]:border-ember-500 has-[:checked]:text-smoke-50"
                        >
                          <input type="radio" name="channel" value={ch} defaultChecked={i === 0} className="accent-ember-500" />
                          {ch}
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="cta-glow w-full cursor-pointer rounded-[2px] bg-ember-500 py-3 text-sm font-semibold text-onyx transition-colors hover:bg-ember-600 disabled:opacity-60"
                  >
                    {status === 'sending' ? content.sending : content.submit}
                  </button>
                  {status === 'error' && (
                    <p role="alert" className="text-sm text-ember-400">{content.errorText}</p>
                  )}
                </form>

                <div className="relative z-10 mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[color:rgb(44_44_44/0.12)] pt-4">
                  <p className="spec text-ash-500">{content.orWrite}</p>
                  <MessengerRow place="order-modal" compact />
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
