import { notFound } from "next/navigation";
import { exigerAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FormulaireArticle } from "../formulaire-article";

export const metadata = { title: "Modifier un article" };
export const dynamic = "force-dynamic";

export default async function PageModifierArticle(
  props: PageProps<"/admin/actualites/[id]">,
) {
  await exigerAdmin();
  const { id } = await props.params;

  const article = await prisma.article.findUnique({
    where: { id },
    select: {
      id: true,
      titre: true,
      chapo: true,
      contenu: true,
      imageChemin: true,
      publie: true,
    },
  });

  if (!article) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl md:text-3xl">Modifier l&apos;article</h1>
      <p className="mt-2 text-ink-muted">
        {article.publie
          ? "Cet article est publié : vos modifications seront visibles immédiatement."
          : "Cet article est en brouillon."}
      </p>

      <div className="mt-8">
        <FormulaireArticle
          article={{
            id: article.id,
            titre: article.titre,
            chapo: article.chapo,
            contenu: article.contenu,
            aUneImage: Boolean(article.imageChemin),
          }}
        />
      </div>
    </div>
  );
}
