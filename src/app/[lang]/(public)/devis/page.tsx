import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EnTetePage } from "@/components/public/en-tete-page";
import { Container } from "@/components/ui/container";
import { getDictionnaire } from "@/lib/dictionnaire";
import { domaine as getDomaine, domaines } from "@/lib/domaines-en";
import { alternances, chemin, estLangue } from "@/lib/i18n";
import { FormulaireDevis } from "./formulaire-devis";

export async function generateMetadata(
  props: PageProps<"/[lang]/devis">,
): Promise<Metadata> {
  const { lang } = await props.params;
  if (!estLangue(lang)) return {};

  const dico = getDictionnaire(lang);
  return {
    title: dico.devis.metaTitre,
    description: dico.devis.metaDescription,
    alternates: alternances(lang, "/devis"),
  };
}

export default async function PageDevis(props: PageProps<"/[lang]/devis">) {
  const { lang } = await props.params;
  if (!estLangue(lang)) notFound();

  const dico = getDictionnaire(lang);

  // Le lien depuis une fiche service arrive avec ?domaine=slug : on présélectionne
  // le domaine, après avoir vérifié qu'il existe bien.
  const { domaine } = await props.searchParams;
  const slug = typeof domaine === "string" ? domaine : undefined;
  const domaineInitial = slug && getDomaine(slug, lang) ? slug : undefined;

  return (
    <>
      <EnTetePage titre={dico.devis.titre} chapo={dico.devis.chapo} />

      <section className="py-16 md:py-24">
        <Container>
          <div className="max-w-2xl">
            <FormulaireDevis
              langue={lang}
              domaineInitial={domaineInitial}
              domaines={domaines(lang)}
              lienSuivi={chemin(lang, "/suivi")}
              libelles={{
                succesTitre: dico.devis.succesTitre,
                succesTexte: dico.devis.succesTexte,
                succesReference: dico.devis.succesReference,
                succesLien: dico.devis.succesLien,
                legendeCoordonnees: dico.devis.legendeCoordonnees,
                legendeBesoin: dico.devis.legendeBesoin,
                champNom: dico.devis.champNom,
                champEmail: dico.devis.champEmail,
                aideEmail: dico.devis.aideEmail,
                champTelephone: dico.devis.champTelephone,
                champEntreprise: dico.devis.champEntreprise,
                champDomaine: dico.devis.champDomaine,
                choisirDomaine: dico.devis.choisirDomaine,
                champDescription: dico.devis.champDescription,
                aideDescription: dico.devis.aideDescription,
                champBudget: dico.devis.champBudget,
                champDelai: dico.devis.champDelai,
                champAdresse: dico.devis.champAdresse,
                aideAdresse: dico.devis.aideAdresse,
                champPieces: dico.devis.champPieces,
                aidePieces: dico.devis.aidePieces,
                nePasRemplir: dico.devis.nePasRemplir,
                envoyer: dico.devis.envoyer,
                envoi: dico.commun.envoi,
                facultatif: dico.devis.facultatif,
              }}
            />
          </div>
        </Container>
      </section>
    </>
  );
}
