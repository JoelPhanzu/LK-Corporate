import { exigerAdmin } from "@/lib/auth";
import { FormulaireRealisation } from "../formulaire-realisation";

export const metadata = { title: "Nouvelle réalisation" };
export const dynamic = "force-dynamic";

export default async function PageNouvelleRealisation() {
  await exigerAdmin();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl md:text-3xl">Nouvelle réalisation</h1>
      <p className="mt-2 text-ink-muted">
        Le projet est enregistré en brouillon. Il apparaît dans la galerie
        publique une fois publié depuis la liste.
      </p>

      <div className="mt-8">
        <FormulaireRealisation />
      </div>
    </div>
  );
}
