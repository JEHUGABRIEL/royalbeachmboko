import type { Metadata } from "next";
import Link from "next/link";
import BackToSite from "@/components/admin/BackToSite";
import Flash from "@/components/admin/Flash";
import SubmitButton from "@/components/admin/SubmitButton";
import Logo from "@/components/Logo";
import type { PageProps } from "@/lib/admin";
import { requestPasswordReset } from "../auth-actions";
import "../admin.css";

export const metadata: Metadata = { title: "Mot de passe oublié", robots: { index: false } };

export default async function ForgotPasswordPage({ searchParams }: PageProps) {
  const { ok, error } = await searchParams;
  return (
    <div className="auth">
      <BackToSite />
      <div className="auth__card">
        <Logo />
        <h1>Mot de passe oublié</h1>
        <Flash ok={ok} error={error} />
        {!ok && (
          <>
            <p className="auth__text">
              Indiquez l&apos;adresse e-mail de votre compte. Votre demande sera transmise aux administrateurs : dès
              qu&apos;elle sera validée, vous recevrez un e-mail pour choisir un nouveau mot de passe.
            </p>
            <form action={requestPasswordReset} className="aform">
              <div className="afield">
                <label htmlFor="email">E-mail</label>
                <input id="email" name="email" type="email" autoComplete="email" required autoFocus />
              </div>
              <SubmitButton>Envoyer la demande</SubmitButton>
            </form>
          </>
        )}
        <p className="auth__foot">
          <Link href="/admin/login" className="auth__link">
            ← Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  );
}
