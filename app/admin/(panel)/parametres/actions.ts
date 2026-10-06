"use server";

import { done, fail, str } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import type { SiteSettings } from "@/lib/db/schema";

const BACK = "/admin/parametres";

const url = (v: string) => {
  if (!v) return "";
  return /^https?:\/\//.test(v) ? v : `https://${v}`;
};

export async function saveSettings(fd: FormData) {
  await requireAdmin();
  const hours: SiteSettings["hours"] = [];
  for (let i = 0; i < 4; i++) {
    const days = str(fd, `days_${i}`, 60);
    const slots = str(fd, `slots_${i}`, 400)
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    if (days && slots.length) hours.push({ days, slots });
  }
  const value: SiteSettings = {
    phone: str(fd, "phone", 40),
    whatsapp: str(fd, "whatsapp", 40),
    email: str(fd, "email", 120),
    address: str(fd, "address", 200),
    mapQuery: str(fd, "mapQuery", 200),
    facebook: url(str(fd, "facebook", 300)),
    instagram: url(str(fd, "instagram", 300)),
    hours,
  };
  if (!value.phone || !value.address) fail(BACK, "Téléphone et adresse sont obligatoires.");
  if (hours.length === 0) fail(BACK, "Indiquez au moins un groupe d'horaires.");
  await db
    .insert(schema.settings)
    .values({ key: "site", value })
    .onConflictDoUpdate({ target: schema.settings.key, set: { value } });
  done(BACK, "Informations mises à jour sur tout le site.");
}
