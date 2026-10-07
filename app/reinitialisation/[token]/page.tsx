import { and, eq, gt } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import BackToSite from "@/components/admin/BackToSite";
import Flash from "@/components/admin/Flash";
import PasswordInput from "@/components/admin/PasswordInput";
import SubmitButton from "@/components/admin/SubmitButton";
import Logo from "@/components/Logo";
import { hashToken } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { PASSWORD_MIN } from "@/lib/validation";
import { completePasswordReset } from "../../admin/auth-actions";
import "../../admin/admin.css";

export const metadata: Metadata = { title: "Nouveau mot de passe", robots: { index: false } };

type Props = { params: Promise<{ token: string }>; searchParams: Promise<{ error?: string }> };

export default async function ResetPasswordPage({ params, searchParams }: Props) {
  const { token } = await params;
  const { error } = await searchParams;
  const [row] = await db
    .select({ email: schema.admins.email })
    .from(schema.passwordResets)
    .innerJoin(schema.admins, eq(schema.admins.id, schema.passwordResets.adminId))
    .where(
      and(
        eq(schema.passwordResets.tokenHash, hashToken(token)),
        eq(schema.passwordResets.status, "acceptee"),
        gt(schema.passwordResets.expiresAt, new Date()),
      ),
    )
    .limit(1);

  return (
    <div className="auth">
      <BackToSite />
      <div className="auth__card">
        <Logo />
        <h1>Nouveau mot de passe</h1>
        {!row ? (
          <>
            <Flash error="Ce lien a expiré ou a déjà été utilisé. Faites une nouvelle demande depuis la page de connexion." />
            <Link href="/admin/mot-de-passe-oublie" className="abtn abtn--ghost">
              Nouvelle demande
            </Link>
          </>
        ) : (
          <>
            <Flash error={error} />
            <form action={completePasswordReset} className="aform">
              <input type="hidden" name="token" value={token} />
              <div className="afield">
                <label>E-mail</label>
                <input value={row.email} disabled />
              </div>
              <div className="afield">
                <label htmlFor="password">Nouveau mot de passe</label>
                <PasswordInput id="password" name="password" autoComplete="new-password" required minLength={PASSWORD_MIN} autoFocus />
                <small>{PASSWORD_MIN} caractères minimum, évitez les mots de passe courants.</small>
              </div>
              <div className="afield">
                <label htmlFor="confirm">Confirmer le mot de passe</label>
                <PasswordInput id="confirm" name="confirm" autoComplete="new-password" required minLength={PASSWORD_MIN} />
              </div>
              <SubmitButton>Enregistrer le mot de passe</SubmitButton>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
