import { asc, count, eq } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import AdminNav from "@/components/admin/AdminNav";
import ConfirmAction from "@/components/admin/ConfirmAction";
import Icon from "@/components/admin/icons";
import Logo from "@/components/Logo";
import { requireAdmin } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { logout } from "../auth-actions";
import "../admin.css";

export const metadata: Metadata = { title: { default: "Back-office", template: "%s · Back-office" }, robots: { index: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const [[res], [msg], categories] = await Promise.all([
    db.select({ n: count() }).from(schema.reservations).where(eq(schema.reservations.status, "en_attente")),
    db.select({ n: count() }).from(schema.messages).where(eq(schema.messages.read, false)),
    db
      .select({ slug: schema.menuCategories.slug, label: schema.menuCategories.label })
      .from(schema.menuCategories)
      .orderBy(asc(schema.menuCategories.position), asc(schema.menuCategories.id)),
  ]);

  return (
    <div className="admin">
      <aside className="admin-side">
        <Logo />
        <AdminNav badges={{ reservations: res.n, messages: msg.n }} categories={categories} />
        <div className="admin-side__foot">
          <Link href="/admin/compte" className="admin-user">
            <span className="admin-user__avatar">
              <Icon name="user" size={16} />
            </span>
            <span>
              <strong>{admin.name}</strong>
              <span className="muted">{admin.email}</span>
            </span>
          </Link>
          <ConfirmAction
            action={logout}
            as="button"
            icon="logout"
            label="Déconnexion"
            title="Se déconnecter ?"
            message="Vous devrez saisir à nouveau votre e-mail et votre mot de passe pour accéder au back-office."
            confirmLabel="Se déconnecter"
          />
        </div>
      </aside>
      <div className="admin-main">{children}</div>
    </div>
  );
}
