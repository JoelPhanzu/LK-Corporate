import Image from "next/image";
import Link from "next/link";
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
}: {
  className?: string;
  /** true lorsque le logo est posé sur un aplat bleu marine. */
  surMarque?: boolean;
}) {
  return (
    <Link
      href="/"
      aria-label="Lk-corporate, retour à l'accueil"
      className={cn("inline-flex shrink-0 items-center", className)}
    >
      <Image
        src={
          surMarque
            ? "/marque/lk-corporate-inverse.png"
            : "/marque/lk-corporate.png"
        }
        alt=""
        width={LARGEUR}
        height={HAUTEUR}
        priority
        className="h-6 w-auto sm:h-7"
      />
    </Link>
  );
}
