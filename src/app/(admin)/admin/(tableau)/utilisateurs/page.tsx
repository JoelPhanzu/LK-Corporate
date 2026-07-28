import { Select } from "@/components/ui/formulaire";
import { exigerAdmin, peutGererUtilisateurs } from "@/lib/auth";
import { LIBELLE_ROLE } from "@/lib/libelles";
import { prisma } from "@/lib/prisma";
import { basculerActif, changerRole } from "./actions";
import { FormulaireUtilisateur } from "./formulaire-utilisateur";

export const metadata = { title: "Utilisateurs" };
export const dynamic = "force-dynamic";

const dateFr = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" });

async function chargerUtilisateurs() {
  try {
    return await prisma.utilisateurAdmin.findMany({
      orderBy: [{ actif: "desc" }, { creeLe: "asc" }],
      select: {
        id: true,
        nom: true,
        email: true,
        role: true,
        actif: true,
        creeLe: true,
      },
    });
  } catch (erreur) {
    console.error("Chargement des utilisateurs impossible", erreur);
    return null;
  }
}

export default async function PageUtilisateurs() {
  const session = await exigerAdmin();
  const gestionnaire = peutGererUtilisateurs(session);
  const utilisateurs = await chargerUtilisateurs();

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl md:text-3xl">Utilisateurs</h1>
      <p className="mt-2 text-ink-muted">
        Comptes autorisés à accéder à l&apos;espace d&apos;administration.
      </p>

      {!gestionnaire && (
        <div
          role="status"
          className="mt-6 rounded-brand border border-line bg-surface-sunken p-4 text-sm"
        >
          <p className="font-semibold">Consultation seule</p>
          <p className="mt-1 text-ink-muted">
            Votre rôle ({LIBELLE_ROLE[session.role]}) ne permet pas de créer ni
            de modifier des comptes.
          </p>
        </div>
      )}

      {utilisateurs === null && (
        <div
          role="alert"
          className="mt-8 rounded-brand border border-line bg-surface-sunken p-4 text-sm"
        >
          <p className="font-semibold">Liste indisponible</p>
          <p className="mt-1 text-ink-muted">La base ne répond pas.</p>
        </div>
      )}

      {utilisateurs !== null && utilisateurs.length > 0 && (
        <ul className="mt-8 divide-y divide-line border-y border-line">
          {utilisateurs.map((utilisateur) => {
            const soiMeme = utilisateur.id === session.id;

            return (
              <li
                key={utilisateur.id}
                className="flex flex-wrap items-start justify-between gap-4 py-4"
              >
                <div className="min-w-0">
                  <p className="font-medium">
                    {utilisateur.nom}
                    {soiMeme && (
                      <span className="ml-2 text-sm font-normal text-ink-muted">
                        (vous)
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 truncate text-sm text-ink-muted">
                    {utilisateur.email}
                    {", "}
                    {utilisateur.actif ? "actif" : "désactivé"}
                    {", depuis le "}
                    {dateFr.format(utilisateur.creeLe)}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {gestionnaire && !soiMeme ? (
                    <>
                      <form action={changerRole} className="flex items-center gap-2">
                        <input type="hidden" name="id" value={utilisateur.id} />
                        <label htmlFor={`role-${utilisateur.id}`} className="sr-only">
                          Rôle de {utilisateur.nom}
                        </label>
                        <Select
                          id={`role-${utilisateur.id}`}
                          name="role"
                          defaultValue={utilisateur.role}
                          className="w-auto py-1.5 text-sm"
                        >
                          {(["AGENT", "ADMIN", "PROPRIETAIRE"] as const).map((role) => (
                            <option key={role} value={role}>
                              {LIBELLE_ROLE[role]}
                            </option>
                          ))}
                        </Select>
                        <button
                          type="submit"
                          className="rounded-brand border border-line-strong px-3 py-1.5 text-sm font-medium transition-colors hover:border-ink"
                        >
                          Appliquer
                        </button>
                      </form>

                      <form action={basculerActif}>
                        <input type="hidden" name="id" value={utilisateur.id} />
                        <button
                          type="submit"
                          className="rounded-brand border border-line-strong px-3 py-1.5 text-sm font-medium transition-colors hover:border-ink"
                        >
                          {utilisateur.actif ? "Désactiver" : "Réactiver"}
                        </button>
                      </form>
                    </>
                  ) : (
                    <span className="rounded-brand border border-line px-2.5 py-1 text-xs font-semibold">
                      {LIBELLE_ROLE[utilisateur.role]}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {gestionnaire && (
        <section className="mt-12 max-w-xl rounded-brand border border-line p-6">
          <h2 className="text-lg font-bold">Ajouter un collaborateur</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Le compte est utilisable immédiatement, sans email de confirmation.
          </p>
          <div className="mt-6">
            <FormulaireUtilisateur />
          </div>
        </section>
      )}
    </div>
  );
}
