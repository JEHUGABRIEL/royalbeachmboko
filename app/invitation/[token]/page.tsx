import { and, eq, gt, isNull } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import BackToSite from "@/components/admin/BackToSite";
import Flash from "@/components/admin/Flash";
import PasswordInput from "@/components/admin/PasswordInput";
import SubmitButton from "@/components/admin/SubmitButton";
import Logo from "@/components/Logo";
import { hashToken } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { acceptInvitation } from "../../admin/auth-actions";
import "../../admin/admin.css";

export const metadata: Metadata = { title: "Invitation", robots: { index: false } };

type Props = { params: Promise<{ token: string }>; searchParams: Promise<{ error?: string }> };

export default async function InvitationPage({ params, searchParams }: Props) {
  const { token } = await params;
  const { error } = await searchParams;
  const [inv] = await db
    .select({ email: schema.invitations.email })
    .from(schema.invitations)
    .where(
      and(
        eq(schema.invitations.tokenHash, hashToken(token)),
        isNull(schema.invitations.acceptedAt),
        gt(schema.invitations.expiresAt, new Date()),
      ),
    )
    .limit(1);

  return (
    <div className="auth">
      <BackToSite />
      <div className="auth__card">
        <Logo />
        <h1>Créer mon compte</h1>
        {!inv ? (
          <>
            <Flash error="Cette invitation a expiré ou a déjà été utilisée. Demandez une nouvelle invitation à un administrateur." />
            <Link href="/admin/login" className="abtn abtn--ghost">
              Aller à la connexion
            </Link>
          </>
        ) : (
          <>
            <Flash error={error} />
            <form action={acceptInvitation} className="aform">
              <input type="hidden" name="token" value={token} />
              <div className="afield">
                <label>E-mail</label>
                <input value={inv.email} disabled />
              </div>
              <div className="afield">
                <label htmlFor="name">Nom complet</label>
                <input id="name" name="name" autoComplete="name" required minLength={2} autoFocus />
              </div>
              <div className="afield">
                <label htmlFor="password">Mot de passe</label>
                <PasswordInput id="password" name="password" autoComplete="new-password" required minLength={12} />
                <small>12 caractères minimum, évitez les mots de passe courants.</small>
              </div>
              <div className="afield">
                <label htmlFor="confirm">Confirmer le mot de passe</label>
                <PasswordInput id="confirm" name="confirm" autoComplete="new-password" required minLength={12} />
              </div>
              <SubmitButton>Créer mon compte</SubmitButton>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
