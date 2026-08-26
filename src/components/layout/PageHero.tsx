import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { Slot } from '@/components/ui/Slot';

/**
 * Dark header band for inner pages, optionally over a slot image. Every page
 * opens on coal so the transparent header reads consistently.
 */
export function PageHero({
  kicker,
  title,
  subtitle,
  imageSlot,
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
  imageSlot?: string;
}) {
  return (
    <section className="grain relative overflow-hidden bg-coal-900 pt-[calc(var(--header-h)+5rem)] pb-20 text-center">
      {imageSlot && (
        <>
          <div className="absolute inset-0">
            <Slot id={imageSlot} className="h-full" imgClassName="opacity-40" priority />
          </div>
          <div className="absolute inset-0 bg-coal-950/70" />
        </>
      )}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-4 top-[calc(var(--header-h)+1.5rem)] bottom-4 border border-[color:rgb(44_44_44/0.12)] sm:inset-x-7"
      />
      <Container className="relative z-10">
        <Reveal>
          {kicker && <p className="kicker">{kicker}</p>}
          <h1 className="display struck mt-5 text-smoke-50 text-[clamp(2.5rem,7vw,5rem)]">{title}</h1>
          {subtitle && (
            <p className="mx-auto mt-6 max-w-2xl leading-relaxed text-smoke-300">{subtitle}</p>
          )}
        </Reveal>
      </Container>
    </section>
  );
}
