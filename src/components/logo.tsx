import Image from "next/image";
import Link from "next/link";
import { chemin, type Langue } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Verrou de marque officiel.
 *
 * Les deux fichiers sont dérivés du logo validé par le client, sans retouche
 * du tracé (voir scripts/generer-assets-marque.mts). La version claire n'est
 * pas un fichier livré mais une permutation du lettrage marine vers le blanc :
 * le fichier « inversée » d'origine embarquait un fond opaque qui aurait
 * dessiné un rectangle dès que la teinte du bandeau varie.
 *
 * Les dimensions déclarées correspondent au rendu réel, pas à la définition
 * source : Next.js taille ainsi le srcset au plus juste, et le rapport
 * hauteur / largeur suffit à écarter tout décalage de mise en page.
 */

/** Rapport du verrou détouré, 1851 x 233. */
const LARGEUR = 222;
const HAUTEUR = 28;

export function Logo({
  className,
  surMarque = false,
  langue,
}: {
  className?: string;
  /** true lorsque le logo est posé sur un aplat bleu marine. */
  surMarque?: boolean;
  /**
   * Langue du site vitrine, pour que le retour à l'accueil reste dans la
   * langue courante. Omise dans l'espace d'administration, qui n'en a pas :
   * le lien pointe alors la racine, que le proxy aiguille.
   */
  langue?: Langue;
}) {
  const accueil = langue ? chemin(langue, "/") : "/";
  // Sur un aplat marine, le verrou blanc convient dans les deux thèmes : la
  // teinte du bandeau ne varie pas. Ailleurs, la surface passe du blanc au
  // marine avec le thème, et le lettrage doit suivre, sans quoi il disparaît
  // dans le fond — c'était le cas de l'écran de connexion en mode sombre.
  if (surMarque) {
    return (
      <Verrou
        source="/marque/lk-corporate-inverse.png"
        accueil={accueil}
        className={cn("inline-flex", className)}
      />
    );
  }

  return (
    <>
      <Verrou
        source="/marque/lk-corporate.png"
        accueil={accueil}
        className={cn("verrou-sur-clair", className)}
      />
      <Verrou
        source="/marque/lk-corporate-inverse.png"
        accueil={accueil}
        className={cn("verrou-sur-sombre", className)}
      />
    </>
  );
}

function Verrou({
  source,
  accueil,
  className,
}: {
  source: string;
  accueil: string;
  className?: string;
}) {
  return (
    <Link
      href={accueil}
      aria-label="Lk-corporate, retour à l'accueil"
      className={cn("shrink-0 items-center", className)}
    >
      <Image
        src={source}
        alt=""
        width={LARGEUR}
        height={HAUTEUR}
        priority
        className="h-6 w-auto sm:h-7"
      />
    </Link>
  );
}
