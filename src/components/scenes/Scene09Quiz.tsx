'use client';

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight, Check, Flame } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import type { SiteContent } from '@/lib/content';
import { Container } from '@/components/ui/Container';
import { StampText } from '@/components/shared/StampText';
import { triggerBurst } from '@/components/effects/burst';
import { isValidPhone, submitLead } from '@/lib/lead';
import { track } from '@/lib/analytics';

type Data = SiteContent['home']['quiz'];

/**
 * We sell smokers — so every quiz outcome IS a smoker: different size and
 * trim, no prices. Only the B2B branch routes to the business page.
 */
interface SmokerResult {
  kind: 'product' | 'b2b' | 'custom';
  name: string;
  tagline: string;
  chips: string[];
  img: string;
  href?: string;
}

const RESULTS: Record<string, SmokerResult> = {
  compact: {
    kind: 'product',
    name: 'Смокер 430 «Компакт»',
    tagline: 'Той самий довгий дим — у розмірі для сімейного двору.',
    chips: ['Камера Ø430 мм', 'Сталь 4 мм', 'Решітка 0,3 м²', 'Колеса й дубові ручки', 'Термометр у кришці'],
    img: '/media/hero-open-smoker.jpg',
  },
  flagship: {
    kind: 'product',
    name: 'Смокер 530',
    tagline: 'Флагман цеху: годує компанію до десяти і тримає жар всю ніч.',
    chips: ['Камера Ø530 мм', 'Сталь 4 мм', 'Решітки 0,45 м²', 'Фаєрбокс під довгий дим', 'Термометр + робоча полиця'],
    img: '/media/smoker-rustic.jpg',
  },
  xl: {
    kind: 'product',
    name: 'Смокер 530 XL',
    tagline: 'Коли гостей рахують дворами: подовжена камера і запас решіток.',
    chips: ['Подовжена камера', 'Дві решітки — 0,7 м²', 'Сталь 4 мм', 'Посилені колеса', 'Гак для туш'],
    img: '/media/showcase-poster.jpg',
  },
  pro: {
    kind: 'b2b',
    name: 'Смокер 530 Pro · для закладів',
    tagline: 'Продуктивність під потік кухні — з сервісом і навчанням команди.',
    chips: ['Подвоєні решітки', 'Ритм щоденної роботи', 'Навчання команди', 'Сервіс і документи'],
    img: '/media/pig-roast-chef.jpg',
    href: '/b2b',
  },
  custom: {
    kind: 'custom',
    name: 'Кастомний смокер',
    tagline: 'Розміри, комплектація і гравіювання — проєктуємо разом із майстром.',
    chips: ['Розміри під ваше ТЗ', 'Комплектація на вибір', 'Гравіювання і клеймо', 'Особистий проєкт'],
    img: '/media/weld-action.jpg',
  },
};

function computeResult(a: number[]): SmokerResult {
  const [people, , place, budget] = a;
  if (people === 3 || place === 2) return RESULTS.pro;
  if (budget === 3) return RESULTS.custom;
  if (people === 0) return RESULTS.compact;
  if (people === 2) return RESULTS.xl;
  return RESULTS.flagship;
}

type Status = 'idle' | 'sending' | 'success' | 'error';

const EASE = [0.22, 1, 0.36, 1] as const;
const inputCls =
  'w-full rounded-[2px] border border-onyx/20 bg-parchment-50 px-4 py-2.5 text-onyx placeholder:text-walnut/70 focus:border-saffron-500 focus:outline-none';

export function Scene09Quiz({ data }: { data: Data }) {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [answers, setAnswers] = useState<number[]>([]);
  const [done, setDone] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [phoneErr, setPhoneErr] = useState(false);
  const started = useRef(false);
  const vidRef = useRef<HTMLVideoElement>(null);
  const secRef = useRef<HTMLElement>(null);

  /* The backdrop montage only plays while the quiz is on screen. */
  useEffect(() => {
    const sec = secRef.current;
    const vid = vidRef.current;
    if (!sec || !vid) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) void vid.play().catch(() => {});
      else vid.pause();
    });
    io.observe(sec);
    return () => io.disconnect();
  }, []);

  const total = data.steps.length;
  const result = done ? computeResult(answers) : null;
  const progress = done ? 1 : (step + (answers[step] != null ? 1 : 0)) / total;
  const temp = Math.round(progress * 110);

  function choose(idx: number, e: React.MouseEvent<HTMLButtonElement>) {
    if (!started.current) {
      started.current = true;
      track('quiz_start');
    }
    if (!reduce) {
      const r = e.currentTarget.getBoundingClientRect();
      triggerBurst(r.left + r.width / 2, r.top + r.height * 0.6, 'smoke');
    }
    const next = [...answers];
    next[step] = idx;
    setAnswers(next);
    setDir(1);
    track('quiz_step', { n: step + 1, choice: idx });
    if (step < total - 1) {
      setStep(step + 1);
    } else {
      setDone(true);
      track('quiz_complete', { result: computeResult(next).name });
    }
  }

  function jumpBack(i: number) {
    setDir(-1);
    setDone(false);
    setStep(i);
  }

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
        source: result?.kind === 'custom' ? 'quiz-custom' : 'quiz',
        name: fd.get('name'),
        phone,
        channel: fd.get('channel'),
        answers: answers.map((a, i) => data.steps[i].options[a].label),
        result: result?.name,
      });
      setStatus('success');
      track('lead_submit', { source: 'quiz' });
      const r = form.getBoundingClientRect();
      if (!reduce) triggerBurst(r.left + r.width / 2, r.top + 40, 'both');
    } catch {
      setStatus('error');
    }
  }

  const slide = {
    initial: reduce ? { opacity: 0 } : { opacity: 0, x: dir * 72, filter: 'blur(8px)' },
    animate: { opacity: 1, x: 0, filter: 'blur(0px)' },
    exit: reduce ? { opacity: 0 } : { opacity: 0, x: dir * -72, filter: 'blur(8px)' },
  };

  return (
    <section ref={secRef} id="quiz" data-dark-bg className="relative overflow-hidden bg-[#221d18] py-10">
      {/* Looped smoker-and-meat montage behind everything */}
      <video
        ref={vidRef}
        src="/media/showcase.mp4"
        poster="/media/showcase-poster.jpg"
        muted
        loop
        playsInline
        autoPlay
        preload="metadata"
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover opacity-25"
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, rgb(34 29 24 / 0.92), rgb(34 29 24 / 0.55) 30%, rgb(34 29 24 / 0.55) 70%, rgb(34 29 24 / 0.92)), radial-gradient(90% 70% at 50% 45%, transparent 40%, rgb(34 29 24 / 0.55))',
        }}
      />

      <Container className="relative z-10">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <p className="kicker text-saffron-300">{data.kicker}</p>
            <h2 className="display mt-2 text-parchment-50 text-[clamp(1.8rem,2.8vw,2.6rem)]">{data.title}</h2>
          </div>

          {/* Temperature gauge */}
          <div className="mt-5 flex items-center gap-3">
            {!done && step > 0 && status !== 'success' && (
              <button
                type="button"
                onClick={() => jumpBack(step - 1)}
                className="cursor-pointer text-parchment-100/60 transition-colors hover:text-parchment-50"
                aria-label={data.back}
              >
                <ArrowLeft className="size-5" aria-hidden />
              </button>
            )}
            <div className="relative h-2 flex-1">
              <div className="absolute inset-0 overflow-hidden rounded-full bg-parchment-50/15">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-saffron-600 via-saffron-500 to-saffron-300"
                  animate={{ width: `${progress * 100}%` }}
                  transition={{ duration: 0.45, ease: EASE }}
                />
              </div>
              {Array.from({ length: total - 1 }, (_, i) => (
                <span
                  key={i}
                  aria-hidden
                  className="absolute top-1/2 h-3 w-px -translate-y-1/2 bg-parchment-50/30"
                  style={{ left: `${((i + 1) / total) * 100}%` }}
                />
              ))}
              <motion.span
                aria-hidden
                className="absolute top-1/2 size-3 -translate-y-1/2 rounded-full bg-saffron-300 shadow-[0_0_14px_4px_rgb(220_168_106/0.6)]"
                animate={{ left: `calc(${progress * 100}% - 6px)` }}
                transition={{ duration: 0.45, ease: EASE }}
              />
            </div>
            <span className="spec w-14 text-right text-saffron-300">{temp}°C</span>
          </div>

          {/* Answer breadcrumbs */}
          {answers.length > 0 && status !== 'success' && (
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {answers.slice(0, done ? total : step).map((a, i) => (
                <motion.button
                  key={`${i}-${a}`}
                  type="button"
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => jumpBack(i)}
                  className="spec inline-flex cursor-pointer items-center gap-1.5 border border-saffron-400/40 bg-roast-900/50 px-2.5 py-1 text-[11px] text-saffron-300 backdrop-blur-sm transition-colors hover:border-saffron-400"
                >
                  <Check className="size-3" aria-hidden />
                  {data.steps[i].options[a].label}
                </motion.button>
              ))}
            </div>
          )}

          {/* Fixed-height stage: steps, result and success all live in the same
              frame, so the section never jumps between questions. */}
          <div className="mt-5 flex min-h-[22rem] flex-col justify-center sm:min-h-[28rem]">
            <AnimatePresence mode="wait">
              {status === 'success' ? (
                <motion.div key="success" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-6 text-center">
                  <StampText className="text-2xl sm:text-3xl">{data.successTitle}</StampText>
                  <p className="mt-4 text-sm text-parchment-100/80">{data.successBody}</p>
                </motion.div>
              ) : done && result ? (
                <motion.div key="result" initial={reduce ? false : { opacity: 0, y: 44 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 120, damping: 20 }}>
                  <p className="kicker text-center text-saffron-300">{data.resultKicker}</p>

                  {/* The build sheet: a paper card on dark steel */}
                  <div className="mt-4 overflow-hidden border border-parchment-50/12 bg-parchment-100 shadow-[0_50px_100px_-50px_rgb(0_0_0/0.9)]">
                    <div className="grid sm:grid-cols-[40%_1fr]">
                      <motion.div
                        initial={reduce ? false : { opacity: 0, scale: 0.97, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                        transition={{ duration: 0.7, ease: EASE }}
                        className="relative min-h-40 overflow-hidden"
                      >
                        <img src={result.img} alt={result.name} className="absolute inset-0 h-full w-full object-cover" />
                      </motion.div>
                      <div className="p-4 sm:p-5">
                        <h3 className="display text-xl text-onyx sm:text-2xl">{result.name}</h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-espresso">{result.tagline}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {result.chips.map((c, i) => (
                            <motion.span
                              key={c}
                              initial={reduce ? false : { opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.35, ease: EASE, delay: 0.2 + i * 0.07 }}
                              className="spec border border-saffron-500/30 bg-saffron-500/10 px-2.5 py-1 text-saffron-600"
                            >
                              {c}
                            </motion.span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-onyx/12 p-4 sm:p-5">
                      {result.kind === 'b2b' && result.href ? (
                        <div className="text-center">
                          <Link
                            href={result.href}
                            className="group/btn inline-flex items-center gap-2.5 rounded-[2px] bg-saffron-500 px-7 py-3.5 text-sm font-semibold text-onyx transition-colors hover:bg-saffron-400"
                          >
                            {data.submit}
                            <ArrowRight className="size-4 transition-transform duration-300 group-hover/btn:translate-x-1" aria-hidden />
                          </Link>
                        </div>
                      ) : (
                        <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2" noValidate>
                          <input name="name" required placeholder={data.formName} autoComplete="name" className={inputCls} />
                          <div>
                            <input
                              name="phone"
                              type="tel"
                              inputMode="tel"
                              required
                              placeholder={data.formPhone}
                              autoComplete="tel"
                              dir="ltr"
                              aria-invalid={phoneErr}
                              className={cn(inputCls, phoneErr && 'border-saffron-600')}
                            />
                            {phoneErr && <p role="alert" aria-live="polite" className="mt-1 text-xs text-saffron-600">{data.formPhone}</p>}
                          </div>
                          <fieldset className="sm:col-span-2">
                            <legend className="spec mb-2 text-walnut">{data.formChannel}</legend>
                            <div className="flex flex-wrap gap-2">
                              {data.channels.map((ch, i) => (
                                <label
                                  key={ch}
                                  className="inline-flex cursor-pointer items-center gap-2 border border-onyx/20 bg-parchment-50 px-3 py-2 text-sm text-espresso transition-colors has-[:checked]:border-saffron-500 has-[:checked]:text-onyx"
                                >
                                  <input type="radio" name="channel" value={ch} defaultChecked={i === 0} className="accent-saffron-500" />
                                  {ch}
                                </label>
                              ))}
                            </div>
                          </fieldset>

                          {/* The forge button: glow, flame, shine sweep */}
                          <button
                            type="submit"
                            disabled={status === 'sending'}
                            className="group/cta relative cursor-pointer overflow-hidden rounded-[2px] bg-saffron-500 px-6 py-3.5 text-sm font-bold text-onyx shadow-[0_18px_44px_-14px_rgb(212_150_83/0.8)] transition-all hover:bg-saffron-400 hover:shadow-[0_20px_52px_-12px_rgb(212_150_83/0.95)] active:scale-[0.99] disabled:opacity-60 sm:col-span-2"
                          >
                            <span className="relative z-10 inline-flex w-full items-center justify-center gap-2.5">
                              <Flame className="size-[18px] transition-transform duration-300 group-hover/cta:-rotate-12 group-hover/cta:scale-110" aria-hidden />
                              {data.submit}
                              <ArrowRight className="size-[18px] transition-transform duration-300 group-hover/cta:translate-x-1.5" aria-hidden />
                            </span>
                            {!reduce && (
                              <motion.span
                                aria-hidden
                                className="pointer-events-none absolute inset-y-0 -left-20 w-14 -skew-x-12 bg-parchment-50/50 blur-[7px]"
                                animate={{ x: [0, 900] }}
                                transition={{ duration: 1.6, ease: 'easeInOut', repeat: Infinity, repeatDelay: 2.2 }}
                              />
                            )}
                          </button>
                          {status === 'error' && <p className="text-sm text-saffron-600 sm:col-span-2">Спробуйте ще раз.</p>}
                        </form>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div key={step} {...slide} transition={{ duration: 0.4, ease: EASE }}>
                  <h3 className="text-center text-lg font-semibold text-parchment-50 sm:text-xl">{data.steps[step].q}</h3>
                  <div className={cn('mt-5 grid gap-3 sm:gap-4', data.steps[step].options.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-4')}>
                    {data.steps[step].options.map((opt, i) => {
                      const picked = answers[step] === i;
                      return (
                        <motion.button
                          key={opt.label}
                          type="button"
                          onClick={(e) => choose(i, e)}
                          initial={reduce ? false : { opacity: 0, y: 24 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.45, ease: EASE, delay: 0.08 + i * 0.07 }}
                          whileHover={reduce ? undefined : { y: -4 }}
                          whileTap={reduce ? undefined : { scale: 0.97 }}
                          className={cn(
                            'group cursor-pointer overflow-hidden rounded-[2px] border bg-roast-900/50 text-left backdrop-blur-sm transition-colors',
                            picked ? 'border-saffron-400' : 'border-parchment-50/15 hover:border-saffron-400/70',
                          )}
                        >
                          {/* ≥sm: photo tile. <sm: compact thumb row (keeps mobile height steady). */}
                          <div className="relative aspect-[16/10] overflow-hidden max-sm:hidden">
                            <img
                              src={opt.img}
                              alt=""
                              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-roast-900/70 via-transparent to-transparent" />
                            {picked && (
                              <span className="absolute right-2.5 top-2.5 grid size-7 place-items-center rounded-full bg-saffron-500 text-onyx">
                                <Check className="size-4" aria-hidden />
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 px-3.5 py-3 sm:px-4 sm:py-3.5">
                            <img src={opt.img} alt="" className="size-12 shrink-0 rounded-[2px] object-cover sm:hidden" />
                            <span className={cn('spec shrink-0 transition-colors', picked ? 'text-saffron-300' : 'text-parchment-100/50 group-hover:text-saffron-300')}>
                              {String(i + 1).padStart(2, '0')}
                            </span>
                            <span className="text-[13.5px] leading-snug text-parchment-50 sm:text-sm">{opt.label}</span>
                            {picked && <Check className="ml-auto size-4 shrink-0 text-saffron-300 sm:hidden" aria-hidden />}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Container>
    </section>
  );
}
