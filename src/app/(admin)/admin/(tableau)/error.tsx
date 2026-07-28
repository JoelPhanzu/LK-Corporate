"use client";

import { Bouton } from "@/components/ui/button";

/**
 * Filet de sécurité de l'espace admin.
 *
 * Le message technique n'est jamais affiché : il peut contenir des détails
 * d'infrastructure. Il est envoyé en console pour le diagnostic, et
 * l'utilisateur reçoit une formulation actionnable.
 */
export default function ErreurAdmin({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error("Erreur dans l'espace admin", error);

  return (
    <div className="mx-auto max-w-xl py-12">
      <h1 className="text-2xl">Une erreur est survenue</h1>
      <p className="mt-3 leading-relaxed text-ink-muted">
        L&apos;opération n&apos;a pas pu aboutir. Vous pouvez réessayer. Si le
        problème persiste, transmettez le code ci-dessous au prestataire.
      </p>
      {error.digest && (
        <p className="mt-4 font-mono text-sm text-ink-muted">
          Code : {error.digest}
        </p>
      )}
      <Bouton onClick={reset} className="mt-6">
        Réessayer
      </Bouton>
    </div>
  );
}
