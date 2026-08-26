'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { SiteContent } from '@/lib/content';
import { isValidPhone, submitLead } from '@/lib/lead';
import { track } from '@/lib/analytics';
import { StampText } from '@/components/shared/StampText';
import { triggerBurst } from '@/components/effects/burst';

type Status = 'idle' | 'sending' | 'success' | 'error';

const field =
  'w-full rounded-[2px] border border-[color:rgb(44_44_44/0.16)] bg-coal-800 px-4 py-3 text-smoke-50 placeholder:text-ash-500 transition-colors focus:border-ember-500';
const label = 'mb-1.5 block text-xs font-medium uppercase tracking-[0.14em] text-ash-500';

/** Lead form used on /kontakty (order labels) and /b2b (with company/task/budget). */
export function LeadForm({
  source,
  order,
  b2b,
}: {
  source: string;
  order: SiteContent['order'];
  b2b?: SiteContent['b2b'];
}) {
  const [status, setStatus] = useState<Status>('idle');
  const [phoneErr, setPhoneErr] = useState(false);

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
        channel: fd.get('channel'),
        company: fd.get('company'),
        comment: fd.get('task') ?? fd.get('comment'),
        budget: fd.get('budget'),
      });
      setStatus('success');
      track('lead_submit', { source });
      const r = form.getBoundingClientRect();
      triggerBurst(r.left + r.width / 2, r.top + 30, 'both');
      form.reset();
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="grain relative flex flex-col items-center border border-[color:rgb(44_44_44/0.14)] bg-coal-800 p-8 text-center">
        <div className="relative z-10">
          <StampText className="text-2xl">{order.successTitle}</StampText>
          <p className="mt-3 text-sm text-smoke-300">{order.successBody}</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {b2b && (
        <>
          <div>
            <label htmlFor="company" className={label}>{b2b.formCompany}</label>
            <input id="company" name="company" required className={field} />
          </div>
          <div>
            <label htmlFor="task" className={label}>{b2b.formTask}</label>
            <textarea id="task" name="task" rows={3} required className={cn(field, 'resize-y')} />
          </div>
          <div>
            <label htmlFor="budget" className={label}>{b2b.formBudget}</label>
            <select id="budget" name="budget" className={field}>
              {b2b.budgets.map((bd) => (
                <option key={bd}>{bd}</option>
              ))}
            </select>
          </div>
        </>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={label}>{order.name}</label>
          <input id="name" name="name" required autoComplete="name" className={field} />
        </div>
        <div>
          <label htmlFor="phone" className={label}>{order.phone}</label>
          <input id="phone" name="phone" type="tel" inputMode="tel" required autoComplete="tel" dir="ltr" aria-invalid={phoneErr} className={cn(field, phoneErr && 'border-ember-500')} />
          {phoneErr && <p role="alert" aria-live="polite" className="mt-1 text-xs text-ember-400">{order.phoneError}</p>}
        </div>
      </div>
      {!b2b && (
        <div>
          <label htmlFor="comment" className={label}>{order.comment}</label>
          <textarea id="comment" name="comment" rows={2} className={cn(field, 'resize-y')} />
        </div>
      )}
      <fieldset>
        <legend className={label}>{order.channelLabel}</legend>
        <div className="flex flex-wrap gap-2">
          {order.channels.map((ch, i) => (
            <label key={ch} className="inline-flex cursor-pointer items-center gap-2 border border-[color:rgb(44_44_44/0.16)] px-3 py-2 text-sm text-smoke-300 has-[:checked]:border-ember-500 has-[:checked]:text-smoke-50">
              <input type="radio" name="channel" value={ch} defaultChecked={i === 0} className="accent-ember-500" />
              {ch}
            </label>
          ))}
        </div>
      </fieldset>
      <button type="submit" disabled={status === 'sending'} className="cta-glow cursor-pointer rounded-[2px] bg-ember-500 px-7 py-3.5 text-sm font-semibold text-onyx transition-colors hover:bg-ember-600 disabled:opacity-60">
        {status === 'sending' ? order.sending : b2b ? b2b.submit : order.submit}
      </button>
      {status === 'error' && <p role="alert" className="text-sm text-ember-400">{order.errorText}</p>}
    </form>
  );
}
