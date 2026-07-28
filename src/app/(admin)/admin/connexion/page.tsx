import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { getSessionAdmin } from "@/lib/auth";
import { FormulaireConnexion } from "./formulaire-connexion";

export const metadata: Metadata = {
  title: "Connexion",
  robots: { index: false, follow: false },
};

export default async function PageConnexion() {
  // Une session déjà valide n'a rien à faire sur l'écran de connexion.
  if (await getSessionAdmin()) redirect("/admin");

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-surface-sunken px-5 py-12">
      <div className="w-full max-w-md">
        <div className="flex justify-center">
          <Logo />
        </div>

        <div className="mt-8 rounded-brand border border-line bg-surface p-8">
          <h1 className="text-2xl">Espace administration</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            Réservé à l&apos;équipe LK-CORPORATE.
          </p>

          <div className="mt-8">
            <FormulaireConnexion />
          </div>
        </div>
      </div>
    </main>
  );
}
