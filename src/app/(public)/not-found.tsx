import Link from "next/link";
import { LienBouton } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { NAV_PUBLIC } from "@/lib/site";

export default function PageIntrouvable() {
  return (
    <section className="py-24 md:py-32">
      <Container>
        <div className="max-w-[60ch]">
          <p className="text-sm font-semibold text-accent-text">Erreur 404</p>
          <h1 className="mt-3 text-3xl md:text-4xl">
            Cette page n&apos;existe pas
          </h1>
          <p className="mt-4 leading-relaxed text-ink-muted">
            Le lien est peut-être incorrect ou la page a été déplacée. Vous
            pouvez reprendre depuis l&apos;une des rubriques ci-dessous.
          </p>

          <ul className="mt-8 flex flex-wrap gap-3">
            {NAV_PUBLIC.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex rounded-brand border border-line-strong px-4 py-2.5 text-sm font-medium transition-colors hover:border-ink hover:text-accent-text"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <LienBouton href="/devis" className="mt-8">
            Demander un devis
          </LienBouton>
        </div>
      </Container>
    </section>
  );
}
