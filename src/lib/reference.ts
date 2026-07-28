import { randomInt } from "node:crypto";

/**
 * Alphabet sans caractères ambigus (ni 0/O, ni 1/I/L) : la référence est
 * souvent dictée au téléphone ou recopiée à la main.
 */
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

/** Génère une référence de demande du type « LK-7F3A2B ». */
export function genererReference(): string {
  let suffixe = "";
  for (let i = 0; i < 6; i++) {
    suffixe += ALPHABET[randomInt(ALPHABET.length)];
  }
  return `LK-${suffixe}`;
}
