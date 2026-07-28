import { Container } from "@/components/ui/container";

/**
 * Bandeau de titre des pages secondaires.
 *
 * Réutilisé d'une page à l'autre pour installer un rythme reconnaissable, mais
 * jamais deux fois dans la même page.
 */
export function EnTetePage({
  titre,
  chapo,
}: {
  titre: string;
  chapo?: string;
}) {
  return (
    <section className="bg-surface-brand text-ink-on-brand">
      <Container>
        <div className="py-14 md:py-20">
          <h1 className="max-w-[20ch] text-4xl leading-[1.08] md:text-5xl">
            {titre}
          </h1>
          {chapo && (
            <p className="mt-5 max-w-[58ch] text-lg leading-relaxed text-ink-on-brand-muted">
              {chapo}
            </p>
          )}
        </div>
      </Container>
    </section>
  );
}
