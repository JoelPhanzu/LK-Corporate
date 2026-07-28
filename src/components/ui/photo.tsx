import Image from "next/image";
import { VISUELS, urlVisuel, type CleVisuel } from "@/lib/photos";
import { cn } from "@/lib/utils";

/**
 * Visuel de banque d'images, choisi dans le catalogue `lib/photos`.
 *
 * Le composant ne connaît qu'une clé : le choix éditorial de la photographie
 * vit dans le catalogue, pas dans les pages. Substituer les photos du client à
 * celles sous licence ne demandera donc de toucher qu'à ces deux fichiers.
 */
export function Photo({
  visuel,
  alt,
  largeur,
  hauteur,
  sizes,
  priority = false,
  className,
}: {
  visuel: CleVisuel;
  /**
   * Laisser vide pour une image décorative, dont le sens est déjà porté par le
   * texte voisin. À défaut, la description du catalogue est reprise.
   */
  alt?: string;
  largeur: number;
  hauteur: number;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const photo = VISUELS[visuel];

  return (
    <Image
      src={urlVisuel(photo.id, largeur, hauteur)}
      alt={alt ?? photo.alt}
      width={largeur}
      height={hauteur}
      sizes={sizes}
      priority={priority}
      className={cn("object-cover", className)}
    />
  );
}
