import { notFound } from "next/navigation";
import { exigerAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FormulaireRealisation } from "../formulaire-realisation";

export const metadata = { title: "Modifier une réalisation" };
export const dynamic = "force-dynamic";

export default async function PageModifierRealisation(
  props: PageProps<"/admin/realisations/[id]">,
) {
  await exigerAdmin();
  const { id } = await props.params;

  const realisation = await prisma.realisation.findUnique({ where: { id } });
  if (!realisation) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl md:text-3xl">Modifier la réalisation</h1>
      <p className="mt-2 text-ink-muted">
        {realisation.publie
          ? "Cette réalisation est publiée : vos modifications seront visibles immédiatement."
          : "Cette réalisation est en brouillon."}
      </p>

      <div className="mt-8">
        <FormulaireRealisation
          realisation={{
            id: realisation.id,
            titre: realisation.titre,
            description: realisation.description,
            localisation: realisation.localisation ?? "",
            domaineSlug: realisation.domaineSlug,
            ordre: realisation.ordre,
            aPhotoAvant: Boolean(realisation.photoAvantChemin),
            aPhotoApres: Boolean(realisation.photoApresChemin),
            nombrePhotos: realisation.photosChemins.length,
          }}
        />
      </div>
    </div>
  );
}
