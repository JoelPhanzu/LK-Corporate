import Link from "next/link";
import { exigerAdmin } from "@/lib/auth";
import { getCoordonnees } from "@/lib/contenu";
import { FormulaireCoordonnees } from "./formulaire-coordonnees";

export const metadata = { title: "Contenu du site" };
export const dynamic = "force-dynamic";

export default async function PageContenu() {
  await exigerAdmin();
  const coordonnees = await getCoordonnees();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl md:text-3xl">Contenu du site</h1>
      <p className="mt-2 text-ink-muted">
        Ces informations apparaissent dans le pied de page et sur la page
        Contact du site public.
      </p>

      <div className="mt-8">
        <FormulaireCoordonnees coordonnees={coordonnees} />
      </div>

      <section className="mt-12 rounded-brand border border-line bg-surface-sunken p-6 text-sm">
        <h2 className="font-bold">Les autres contenus ont leur propre écran</h2>
        <ul className="mt-3 space-y-1.5 text-ink-muted">
          <li>
            Les projets de la galerie se gèrent depuis{" "}
            <Link href="/admin/realisations" className="text-accent-text hover:underline">
              Réalisations
            </Link>
            .
          </li>
          <li>
            Les articles se gèrent depuis{" "}
            <Link href="/admin/actualites" className="text-accent-text hover:underline">
              Actualités
            </Link>
            .
          </li>
          <li>
            Les neuf domaines d&apos;activité sont figés dans le code : ils
            structurent les URL et le formulaire de devis, leur modification
            demande une intervention technique.
          </li>
        </ul>
      </section>
    </div>
  );
}
