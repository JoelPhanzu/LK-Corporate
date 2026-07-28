import { exigerAdmin } from "@/lib/auth";
import { FormulaireArticle } from "../formulaire-article";

export const metadata = { title: "Nouvel article" };
export const dynamic = "force-dynamic";

export default async function PageNouvelArticle() {
  await exigerAdmin();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl md:text-3xl">Nouvel article</h1>
      <p className="mt-2 text-ink-muted">
        L&apos;article est enregistré en brouillon. Il n&apos;apparaît sur le
        site qu&apos;une fois publié depuis la liste.
      </p>

      <div className="mt-8">
        <FormulaireArticle />
      </div>
    </div>
  );
}
