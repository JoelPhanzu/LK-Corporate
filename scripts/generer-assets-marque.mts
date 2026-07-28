import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import { statSync } from "node:fs";

/**
 * Dérive toutes les déclinaisons du logo depuis les fichiers officiels.
 *
 * La source de vérité reste « Images et logos/logo png », livré par le client.
 * Rien n'est redessiné à la main : chaque variante est produite par recadrage
 * ou permutation de couleur, ce qui garantit que le tracé reste exactement
 * celui validé. Relancer ce script après toute nouvelle livraison du logo.
 *
 * Utilisation : npm run marque:assets
 */

const SRC = "Images et logos/logo png";
const OUT = "public/marque";
const APP = "src/app";

/** Marine de la charte, prélevé sur le lettrage du logo. */
const MARINE = { r: 0x1b, g: 0x2a, b: 0x4a };
/** Rouge de la charte, prélevé sur la flèche. */
const ROUGE = { r: 0xbf, g: 0x33, b: 0x24 };

type Boite = { left: number; top: number; width: number; height: number };

/** Recadre au plus juste sur les pixels non transparents. */
async function detourer(fichier: string): Promise<Boite> {
  const { data, info } = await sharp(fichier)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;
  let minX = W;
  let minY = H;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (data[(y * W + x) * 4 + 3] > 8) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  return { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

/**
 * Bascule le lettrage marine vers le blanc en préservant la flèche.
 *
 * Le marine est la seule couleur de la charte dont la composante bleue domine
 * la rouge ; ce simple test sépare donc le lettrage des deux rouges, y compris
 * sur les pixels d'anti-aliasing, sans masque tracé à la main.
 */
async function versBlanc(fichier: string) {
  const { data, info } = await sharp(fichier)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    if (data[i + 2] > data[i]) {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
    }
  }
  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  });
}

await mkdir(OUT, { recursive: true });

const verrou = `${SRC}/LK-Corporate_horizontal_couleur.png`;
const icone = `${SRC}/LK-Corporate_icone.png`;
const boiteVerrou = await detourer(verrou);
const boiteIcone = await detourer(icone);

// 1. Verrou horizontal, lettrage marine : posé sur les fonds clairs.
await sharp(verrou)
  .extract(boiteVerrou)
  .png({ compressionLevel: 9, palette: true })
  .toFile(`${OUT}/lk-corporate.png`);

// 2. Verrou horizontal, lettrage blanc : posé sur le bandeau marine.
//    Régénéré depuis la version couleur plutôt que repris du fichier
//    « inversée » fourni, lequel est un aplat opaque : il aurait laissé un
//    rectangle visible dès que la teinte du fond varie d'un pixel.
await (await versBlanc(verrou))
  .extract(boiteVerrou)
  .png({ compressionLevel: 9, palette: true })
  .toFile(`${OUT}/lk-corporate-inverse.png`);

// 3. Symbole seul, pour les usages où le lettrage serait illisible.
await sharp(icone)
  .extract(boiteIcone)
  .png({ compressionLevel: 9, palette: true })
  .toFile(`${OUT}/lk-corporate-symbole.png`);

// 4. Icônes d'application : symbole centré sur une tuile blanche.
//    Le blanc l'emporte sur le marine parce que le rouge de la flèche ne
//    contraste que 2,5:1 sur le marine, illisible à 16 px.
/**
 * Compose la tuile directement à la taille voulue : `sharp` redimensionne
 * avant de composer, un rendu unique en 512 px puis réduit ferait échouer la
 * composition. Rendre le symbole à sa taille finale donne en prime un tracé
 * net dans les petites définitions.
 */
async function tuile(cote: number) {
  const marge = Math.round(cote * 0.16);
  const symbole = await sharp(icone)
    .extract(boiteIcone)
    .resize({
      width: cote - marge * 2,
      height: cote - marge * 2,
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })
    .toBuffer();
  return sharp({
    create: {
      width: cote,
      height: cote,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  }).composite([{ input: symbole, gravity: "center" }]);
}

await (await tuile(512)).png({ compressionLevel: 9 }).toFile(`${APP}/icon.png`);
await (await tuile(180)).png({ compressionLevel: 9 }).toFile(`${APP}/apple-icon.png`);

// 5. favicon.ico multi-résolutions. Le conteneur ICO accepte une charge PNG
//    par entrée, ce qui évite d'encoder des bitmaps DIB à la main.
const tailles = [16, 32, 48];
const vignettes: Buffer[] = [];
for (const taille of tailles) {
  vignettes.push(await (await tuile(taille)).png({ compressionLevel: 9 }).toBuffer());
}
const entete = Buffer.alloc(6);
entete.writeUInt16LE(0, 0); // réservé
entete.writeUInt16LE(1, 2); // type : icône
entete.writeUInt16LE(tailles.length, 4);
let decalage = 6 + 16 * tailles.length;
const entrees = tailles.map((taille, i) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(taille, 0); // largeur
  e.writeUInt8(taille, 1); // hauteur
  e.writeUInt8(0, 2); // palette
  e.writeUInt8(0, 3); // réservé
  e.writeUInt16LE(1, 4); // plans
  e.writeUInt16LE(32, 6); // bits par pixel
  e.writeUInt32LE(vignettes[i].length, 8);
  e.writeUInt32LE(decalage, 12);
  decalage += vignettes[i].length;
  return e;
});
await writeFile(`${APP}/favicon.ico`, Buffer.concat([entete, ...entrees, ...vignettes]));

// 6. Carte Open Graph : aplat marine, verrou blanc, filet rouge.
// Le verrou occupe 60 % de la largeur : en dessous il flotte, au dessus il
// touche les bords une fois la carte rognée par les aperçus des réseaux.
const LARGEUR_VERROU = 720;
// `.png()` est indispensable : la source étant un buffer brut, `toBuffer()`
// rendrait des pixels non encodés, que la composition refuse.
const verrouOG = await (await versBlanc(verrou))
  .extract(boiteVerrou)
  .resize({ width: LARGEUR_VERROU })
  .png()
  .toBuffer();
const hauteurVerrou = Math.round(
  (boiteVerrou.height / boiteVerrou.width) * LARGEUR_VERROU,
);
const filet = await sharp({
  create: { width: 240, height: 8, channels: 4, background: { ...ROUGE, alpha: 1 } },
})
  .png()
  .toBuffer();

// Bloc « verrou + filet » centré optiquement, donc légèrement au dessus du
// centre géométrique.
const hautVerrou = Math.round((630 - (hauteurVerrou + 56 + 8)) / 2) - 12;
await sharp({
  create: { width: 1200, height: 630, channels: 4, background: { ...MARINE, alpha: 1 } },
})
  .composite([
    { input: verrouOG, top: hautVerrou, left: Math.round((1200 - LARGEUR_VERROU) / 2) },
    { input: filet, top: hautVerrou + hauteurVerrou + 56, left: (1200 - 240) / 2 },
  ])
  .png({ compressionLevel: 9 })
  .toFile(`${APP}/opengraph-image.png`);

const produits = [
  `${OUT}/lk-corporate.png`,
  `${OUT}/lk-corporate-inverse.png`,
  `${OUT}/lk-corporate-symbole.png`,
  `${APP}/icon.png`,
  `${APP}/apple-icon.png`,
  `${APP}/favicon.ico`,
  `${APP}/opengraph-image.png`,
];
for (const fichier of produits) {
  console.log(fichier.padEnd(40), `${(statSync(fichier).size / 1024).toFixed(1)} Ko`);
}
console.log(`\nverrou détouré  : ${boiteVerrou.width}x${boiteVerrou.height}`);
console.log(`symbole détouré : ${boiteIcone.width}x${boiteIcone.height}`);
