import { Container } from '@/components/ui/Container';
import { PageHero } from '@/components/layout/PageHero';

export interface LegalSection {
  h: string;
  p: string[];
}

/** Shared shell for privacy / terms / cookie pages. */
export function LegalLayout({
  title,
  updatedLabel,
  updatedDate,
  intro,
  sections,
}: {
  title: string;
  updatedLabel: string;
  updatedDate: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <>
      <PageHero title={title} />
      <section className="py-20 md:py-24">
        <Container>
          <div className="mx-auto max-w-3xl">
            <p className="spec text-ash-500 uppercase">
              {updatedLabel}: {updatedDate}
            </p>
            <p className="mt-6 leading-relaxed text-smoke-300">{intro}</p>
            <div className="mt-12 space-y-10">
              {sections.map((s) => (
                <div key={s.h}>
                  <h2 className="display text-2xl text-smoke-50">{s.h}</h2>
                  {s.p.map((para, i) => (
                    <p key={i} className="mt-3 leading-relaxed text-smoke-300">{para}</p>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
