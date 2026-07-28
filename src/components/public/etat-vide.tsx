/**
 * État vide composé, utilisé partout où une section est alimentée depuis
 * l'espace admin et n'a pas encore de contenu. Il indique explicitement
 * comment la remplir plutôt que de laisser une zone blanche.
 */
export function EtatVide({
  titre,
  texte,
}: {
  titre: string;
  texte: string;
}) {
  return (
    <div className="rounded-brand border border-dashed border-line-strong px-6 py-16 text-center">
      <p className="text-lg font-semibold">{titre}</p>
      <p className="mx-auto mt-2 max-w-[60ch] leading-relaxed text-ink-muted">
        {texte}
      </p>
    </div>
  );
}
