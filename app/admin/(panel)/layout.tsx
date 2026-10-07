import { asc, count, eq } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import AdminFrame from "@/components/admin/AdminFrame";
import AdminNav from "@/components/admin/AdminNav";
import Avatar from "@/components/admin/Avatar";
import ConfirmAction from "@/components/admin/ConfirmAction";
import NotificationBell from "@/components/admin/NotificationBell";
import Logo from "@/components/Logo";
import { requireAdmin } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { unreadCount } from "@/lib/notifications";
import { logout } from "../auth-actions";
import "../admin.css";

export const metadata: Metadata = { title: { default: "Back-office", template: "%s · Back-office" }, robots: { index: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const [[res], [msg], [resets], categories, unread] = await Promise.all([
    db.select({ n: count() }).from(schema.reservations).where(eq(schema.reservations.status, "en_attente")),
    db.select({ n: count() }).from(schema.messages).where(eq(schema.messages.read, false)),
    db.select({ n: count() }).from(schema.passwordResets).where(eq(schema.passwordResets.status, "en_attente")),
    db
      .select({ slug: schema.menuCategories.slug, label: schema.menuCategories.label })
      .from(schema.menuCategories)
      .orderBy(asc(schema.menuCategories.position), asc(schema.menuCategories.id)),
    unreadCount(admin.id),
  ]);

  const sidebar = (
    <>
      <Logo />
      <AdminNav badges={{ reservations: res.n, messages: msg.n, admins: resets.n }} categories={categories} />
      <div className="admin-side__foot">
        <Link href="/admin/compte" className="admin-user">
          <Avatar name={admin.name} src={admin.avatar} />
          <span>
            <strong>{admin.name}</strong>
            <span className="muted">{admin.role === "superadmin" ? "Superadmin" : admin.email}</span>
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
    </>
  );

  const topRight = (
    <>
      <NotificationBell initialUnread={unread} />
      <Link href="/admin/compte" className="admin-topbar__me" aria-label="Mon compte">
        <Avatar name={admin.name} src={admin.avatar} size={34} />
      </Link>
    </>
  );

  return (
    <AdminFrame sidebar={sidebar} brand={<Logo />} topRight={topRight}>
      {children}
    </AdminFrame>
  );
}
