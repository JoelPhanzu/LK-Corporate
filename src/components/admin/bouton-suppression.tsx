"use client";

/**
 * Bouton de suppression avec confirmation.
 *
 * Une suppression ne doit jamais partir au premier clic : le contenu détruit
 * ici n'est pas récupérable depuis l'interface. La Server Action est reçue en
 * prop, ce qui permet de garder ce composant client sans y importer de logique
 * serveur.
 */
export function BoutonSuppression({
  action,
  id,
  message,
  libelle = "Supprimer",
}: {
  action: (donnees: FormData) => void;
  id: string;
  message: string;
  libelle?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(evenement) => {
        if (!window.confirm(message)) evenement.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="rounded-brand border border-line-strong px-3 py-1.5 text-sm font-medium text-red-700 transition-colors hover:border-red-700 dark:text-red-400 dark:hover:border-red-400"
      >
        {libelle}
      </button>
    </form>
  );
}
