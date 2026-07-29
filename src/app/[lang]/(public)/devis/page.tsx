import type { Metadata } from "next";
import { EnTetePage } from "@/components/public/en-tete-page";
import { Container } from "@/components/ui/container";
import { getDomaine } from "@/lib/domaines";
import { FormulaireDevis } from "./formulaire-devis";

export const metadata: Metadata = {
  title: "Demander un devis",
  description:
    "Décrivez votre projet de construction, de fourniture, d'installation ou de transport et recevez une proposition chiffrée de LK-CORPORATE.",
};

export default async function PageDevis(props: PageProps<"/[lang]/devis">) {
  // Le lien depuis une fiche service arrive avec ?domaine=slug : on présélectionne
  // le domaine, après avoir vérifié qu'il existe bien.
  const { domaine } = await props.searchParams;
  const slug = typeof domaine === "string" ? domaine : undefined;
  const domaineInitial = slug && getDomaine(slug) ? slug : undefined;

  return (
    <>
      <EnTetePage
        titre="Demander un devis"
        chapo="Décrivez votre besoin en quelques lignes. Nous revenons vers vous avec une proposition chiffrée, et vous recevez une référence pour suivre votre demande."
      />

      <section className="py-16 md:py-24">
        <Container>
          <div className="max-w-2xl">
            <FormulaireDevis domaineInitial={domaineInitial} />
          </div>
        </Container>
      </section>
    </>
  );
}
