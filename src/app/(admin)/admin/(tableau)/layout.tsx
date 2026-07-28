import type { Metadata } from "next";
import Link from "next/link";
import { SignOutIcon } from "@phosphor-icons/react/dist/ssr";
import { NavigationAdmin } from "@/components/admin/navigation-admin";
import { exigerAdmin } from "@/lib/auth";
import { seDeconnecter } from "../connexion/actions";

export const metadata: Metadata = {
  title: { default: "Administration", template: "%s | Administration" },
  robots: { index: false, follow: false },
};

/**
 * Garde de l'espace admin.
 *
 * `exigerAdmin()` redirige vers la connexion en l'absence de session valide.
 * Cette garde protège l'affichage, mais PAS les Server Actions, qui restent
 * joignables par POST direct : chacune rejoue donc la vérification.
 */
export default async function LayoutAdmin({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await exigerAdmin();

  return (
    <div className="flex min-h-[100dvh] flex-col lg:flex-row">
      <NavigationAdmin />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-line px-5 py-3 md:px-8">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{session.nom}</p>
            <p className="truncate text-xs text-ink-muted">{session.email}</p>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="hidden text-sm font-medium text-ink-muted hover:text-accent-text sm:inline"
            >
              Voir le site
            </Link>
            <form action={seDeconnecter}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-brand border border-line-strong px-3 py-2 text-sm font-medium transition-colors hover:border-ink"
              >
                <SignOutIcon size={16} weight="bold" aria-hidden />
                Déconnexion
              </button>
            </form>
          </div>
        </header>

        <main className="flex-1 px-5 py-8 md:px-8">{children}</main>
      </div>
    </div>
  );
}
