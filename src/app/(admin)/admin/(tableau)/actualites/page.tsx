import Link from "next/link";
import { PlusIcon } from "@phosphor-icons/react/dist/ssr";
import { BoutonSuppression } from "@/components/admin/bouton-suppression";
import { LienBouton } from "@/components/ui/button";
import { exigerAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { basculerPublication, supprimerArticle } from "./actions";

export const metadata = { title: "Actualités" };
export const dynamic = "force-dynamic";

const dateFr = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" });

async function chargerArticles() {
  try {
    return await prisma.article.findMany({
      orderBy: { modifieLe: "desc" },
      select: {
        id: true,
        slug: true,
        titre: true,
        publie: true,
        publieLe: true,
        modifieLe: true,
      },
    });
  } catch (erreur) {
    console.error("Chargement des articles impossible", erreur);
    return null;
  }
}

export default async function PageAdminActualites() {
  await exigerAdmin();
  const articles = await chargerArticles();

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl">Actualités</h1>
        <LienBouton href="/admin/actualites/nouveau">
          <PlusIcon size={18} weight="bold" aria-hidden />
          Nouvel article
        </LienBouton>
      </div>

      {articles === null && (
        <div
          role="alert"
          className="mt-8 rounded-brand border border-line bg-surface-sunken p-4 text-sm"
        >
          <p className="font-semibold">Liste indisponible</p>
          <p className="mt-1 text-ink-muted">La base ne répond pas.</p>
        </div>
      )}

      {articles !== null && articles.length === 0 && (
        <div className="mt-8 rounded-brand border border-dashed border-line-strong px-6 py-12 text-center">
          <p className="font-semibold">Aucun article</p>
          <p className="mt-1 text-sm text-ink-muted">
            Créez votre premier article, il apparaîtra sur le site dès sa
            publication.
          </p>
        </div>
      )}

      {articles !== null && articles.length > 0 && (
        <ul className="mt-8 divide-y divide-line border-y border-line">
          {articles.map((article) => (
            <li
              key={article.id}
              className="flex flex-wrap items-start justify-between gap-4 py-4"
            >
              <div className="min-w-0">
                <Link
                  href={`/admin/actualites/${article.id}`}
                  className="font-medium hover:text-accent-text"
                >
                  {article.titre}
                </Link>
                <p className="mt-1 text-sm text-ink-muted">
                  {article.publie ? (
                    <>
                      Publié
                      {article.publieLe
                        ? ` le ${dateFr.format(article.publieLe)}`
                        : ""}
                    </>
                  ) : (
                    "Brouillon"
                  )}
                  {", modifié le "}
                  {dateFr.format(article.modifieLe)}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {article.publie && (
                  <Link
                    href={`/actualites/${article.slug}`}
                    className="rounded-brand border border-line-strong px-3 py-1.5 text-sm font-medium transition-colors hover:border-ink"
                  >
                    Voir
                  </Link>
                )}

                <form action={basculerPublication}>
                  <input type="hidden" name="id" value={article.id} />
                  <button
                    type="submit"
                    className="rounded-brand border border-line-strong px-3 py-1.5 text-sm font-medium transition-colors hover:border-ink"
                  >
                    {article.publie ? "Dépublier" : "Publier"}
                  </button>
                </form>

                <BoutonSuppression
                  action={supprimerArticle}
                  id={article.id}
                  message={`Supprimer définitivement « ${article.titre} » ? Cette action est irréversible.`}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
