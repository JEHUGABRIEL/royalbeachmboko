import { z } from "zod";

/** Vraie date du calendrier au format AAAA-MM-JJ (refuse 2026-02-31). */
export const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide.")
  .refine((s) => {
    const [y, m, d] = s.split("-").map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
  }, "Date invalide.");

export const addDays = (iso: string, days: number) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
};

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Heure invalide.");
const phone = z.string().trim().regex(/^\+?[\d\s.-]{8,20}$/, "Numéro de téléphone invalide.");
const optionalEmail = z
  .string()
  .trim()
  .max(200)
  .refine((s) => s === "" || z.email().safeParse(s).success, "Adresse e-mail invalide.");

export const reservationAreas = [
  "Indifférent",
  "Terrasse face au fleuve",
  "Salle panoramique",
  "Plage / ponton",
  "Salle de réception (groupe)",
] as const;

export const guestOptions = [...Array.from({ length: 12 }, (_, i) => String(i + 1)), "13+"] as const;

/** Formulaire de réservation public. `today` = date du jour à Bangui. */
export const reservationSchema = (today: string) =>
  z.object({
    name: z.string().trim().min(2, "Merci d'indiquer votre nom.").max(100),
    phone,
    email: optionalEmail.optional().default(""),
    date: isoDate
      .refine((d) => d >= today, "Merci de choisir une date à venir.")
      .refine((d) => d <= addDays(today, 365), "Les réservations sont ouvertes sur un an maximum."),
    time: time.refine((t) => t >= "09:00" && t <= "23:00", "Nous accueillons les réservations entre 9h et 23h."),
    guests: z.enum(guestOptions, "Nombre de personnes invalide."),
    area: z.enum(reservationAreas).optional().default("Indifférent"),
    occasion: z.string().trim().max(120).optional().default(""),
    notes: z.string().trim().max(1000).optional().default(""),
  });

export const contactSubjects = ["Information", "Privatisation / mariage", "Événement d'entreprise", "Autre"] as const;

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Merci d'indiquer votre nom.").max(100),
  contact: z
    .string()
    .trim()
    .max(200)
    .refine((s) => z.email().safeParse(s).success || /^\+?[\d\s.-]{8,20}$/.test(s), "Indiquez un e-mail ou un téléphone valide."),
  subject: z.enum(contactSubjects).optional().default("Information"),
  message: z.string().trim().min(5, "Votre message est trop court.").max(5000),
});

/** Prix en FCFA : entier positif, plafonné pour rester dans un entier Postgres. */
export const MAX_PRICE = 10_000_000;

export { optionalEmail, phone, time };

/** Premier message d'erreur lisible d'un résultat zod. */
export const firstError = (err: z.ZodError) => err.issues[0]?.message ?? "Données invalides.";

// ---------- Mots de passe ----------

export const PASSWORD_MIN = 12;

// Mots de passe parmi les plus utilisés (et variantes locales évidentes).
const COMMON = new Set([
  "123456789012", "1234567890123", "azertyuiop12", "azertyuiopqs", "qwertyuiop12", "motdepasse123", "motdepasse1234",
  "password1234", "password12345", "passwordpassword", "iloveyou1234", "administrateur", "administrator", "admin1234567",
  "royalbeach123", "royalbeachmbocko", "royalbeach2026", "mbocko123456", "bangui123456", "centrafrique1", "centrafrique123",
  "000000000000", "111111111111", "aaaaaaaaaaaa", "abcdefghijkl", "abc123456789", "qwerty123456", "azerty123456",
  "soleil123456", "bonjour12345", "football1234", "welcome12345", "letmein12345", "changeme1234",
]);

/** Renvoie un message d'erreur si le mot de passe est trop faible, sinon null. */
export function passwordProblem(password: string, context: { email?: string; name?: string } = {}): string | null {
  if (password.length < PASSWORD_MIN) return `Le mot de passe doit contenir au moins ${PASSWORD_MIN} caractères.`;
  if (password.length > 200) return "Mot de passe trop long.";
  const lower = password.toLowerCase();
  if (COMMON.has(lower)) return "Ce mot de passe est trop courant, choisissez-en un autre.";
  if (/^(.)\1+$/.test(password)) return "Le mot de passe ne peut pas être un seul caractère répété.";
  if (new Set(password).size < 5) return "Le mot de passe doit contenir au moins 5 caractères différents.";
  const local = context.email?.split("@")[0]?.toLowerCase();
  if (local && local.length >= 4 && lower.includes(local)) return "Le mot de passe ne doit pas contenir votre adresse e-mail.";
  const firstName = context.name?.trim().split(/\s+/)[0]?.toLowerCase();
  if (firstName && firstName.length >= 4 && lower.includes(firstName)) return "Le mot de passe ne doit pas contenir votre nom.";
  if (/^(royal\s*beach|mbocko)/i.test(password) && password.replace(/[^a-z]/gi, "").length < 12) {
    return "Évitez un mot de passe basé uniquement sur le nom du restaurant.";
  }
  return null;
}
