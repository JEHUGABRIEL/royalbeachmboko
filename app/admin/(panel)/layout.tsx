import { count, eq } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import AdminNav from "@/components/admin/AdminNav";
import Logo from "@/components/Logo";
import { requireAdmin } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { logout } from "../auth-actions";
import "../admin.css";

export const metadata: Metadata = { title: { default: "Back-office", template: "%s · Back-office" }, robots: { index: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const [[res], [msg]] = await Promise.all([
    db.select({ n: count() }).from(schema.reservations).where(eq(schema.reservations.status, "en_attente")),
    db.select({ n: count() }).from(schema.messages).where(eq(schema.messages.read, false)),
  ]);

  return (
    <div className="admin">
      <aside className="admin-side">
        <Logo />
        <AdminNav badges={{ reservations: res.n, messages: msg.n }} />
        <div className="admin-side__foot">
          <strong>{admin.name}</strong>
          <span className="muted">{admin.email}</span>
          <div style={{ marginTop: 10 }}>
            <Link href="/admin/compte">Mon compte</Link>
            <Link href="/" target="_blank">
              Voir le site
            </Link>
            <form action={logout} style={{ display: "inline" }}>
              <button type="submit">Déconnexion</button>
            </form>
          </div>
        </div>
      </aside>
      <div className="admin-main">{children}</div>
    </div>
  );
}
