import { z } from "zod";
import type { MessagesValidation } from "./messages";

/** Schéma du formulaire de contact, construit avec les messages de la langue. */
export function schemaContact(m: MessagesValidation) {
  return z.object({
    nom: z.string().trim().min(2, m.nomRequis).max(120, m.nomLong),
    email: z
      .string()
      .trim()
      .min(1, m.emailRequis)
      .max(180)
      .email(m.emailInvalide),
    telephone: z.string().trim().max(40).or(z.literal("")),
    sujet: z.string().trim().min(3, m.sujetRequis).max(160, m.sujetLong),
    message: z
      .string()
      .trim()
      .min(20, m.messageCourt)
      .max(5000, m.messageLong),
  });
}

export type DonneesContact = z.infer<ReturnType<typeof schemaContact>>;
