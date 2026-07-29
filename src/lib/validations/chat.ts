import { z } from "zod";
import type { MessagesValidation } from "./messages";

export const MESSAGE_MAX = 2000;

/** Un jeton visiteur est un UUID v4 généré côté serveur. */
export function schemaJeton(m: MessagesValidation) {
  return z.string().uuid(m.jetonInvalide);
}

export function schemaMessage(m: MessagesValidation) {
  return z
    .string()
    .trim()
    .min(1, m.messageVide)
    .max(MESSAGE_MAX, m.messageTropLong.replace("{max}", String(MESSAGE_MAX)));
}

export function schemaIdentite(m: MessagesValidation) {
  return z.object({
    nom: z.string().trim().min(2, m.nomRequis).max(120),
    email: z
      .string()
      .trim()
      .max(180)
      .email(m.emailInvalide)
      .or(z.literal("")),
  });
}
