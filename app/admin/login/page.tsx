import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import BackToSite from "@/components/admin/BackToSite";
import Flash from "@/components/admin/Flash";
import PasswordInput from "@/components/admin/PasswordInput";
import SubmitButton from "@/components/admin/SubmitButton";
import Logo from "@/components/Logo";
import { getCurrentAdmin } from "@/lib/auth";
import type { PageProps } from "@/lib/admin";
import { login } from "../auth-actions";
import "../admin.css";

export const metadata: Metadata = { title: "Connexion", robots: { index: false } };

export default async function LoginPage({ searchParams }: PageProps) {
  if (await getCurrentAdmin()) redirect("/admin");
  const { error, ok } = await searchParams;
  return (
    <div className="auth">
      <BackToSite />
      <div className="auth__card">
        <Logo />
        <h1>Back-office</h1>
        <Flash ok={ok} error={error} />
        <form action={login} className="aform">
          <div className="afield">
            <label htmlFor="email">E-mail</label>
            <input id="email" name="email" type="email" autoComplete="email" required autoFocus />
          </div>
          <div className="afield">
            <div className="afield__row">
              <label htmlFor="password">Mot de passe</label>
              <Link href="/admin/mot-de-passe-oublie" className="auth__link">
                Mot de passe oublié ?
              </Link>
            </div>
            <PasswordInput id="password" name="password" autoComplete="current-password" required />
          </div>
          <SubmitButton>Se connecter</SubmitButton>
        </form>
      </div>
    </div>
  );
}
