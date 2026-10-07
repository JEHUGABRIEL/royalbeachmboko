import "server-only";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

/** Redirige vers `path` avec un message de succès affiché par <Flash>. */
export function done(path: string, message: string): never {
  revalidatePath("/", "layout");
  redirect(withParam(path, "ok", message));
}

/** Redirige vers `path` avec un message d'erreur affiché par <Flash>. */
export function fail(path: string, message: string): never {
  redirect(withParam(path, "error", message));
}

function withParam(path: string, key: string, value: string) {
  const [base, query = ""] = path.split("?");
  const params = new URLSearchParams(query);
  params.delete("ok");
  params.delete("error");
  params.set(key, value);
  return `${base}?${params}`;
}

export const str = (fd: FormData, key: string, max = 500) => {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim().slice(0, max) : "";
};

export const int = (fd: FormData, key: string) => {
  const v = str(fd, key).replace(/[\s.]/g, "");
  if (!v) return null;
  const n = Number(v);
  return Number.isInteger(n) && n >= 0 ? n : NaN;
};

export const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60) || "item";

export type PageProps = { searchParams: Promise<Record<string, string | undefined>> };

/** Cookie temporaire contenant le lien d'invitation quand l'e-mail n'a pas pu partir. */
export const LINK_COOKIE = "rb_invite_link";

/** Numéro de page à partir de `?page=` (1 par défaut). */
export const pageParam = (v: string | undefined) => {
  const n = Number(v);
  return Number.isInteger(n) && n > 1 ? n : 1;
};

/** URL publique du site, pour les liens envoyés par e-mail. */
export async function siteOrigin() {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
