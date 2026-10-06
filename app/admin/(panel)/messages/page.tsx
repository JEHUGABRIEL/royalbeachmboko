import { desc } from "drizzle-orm";
import type { Metadata } from "next";
import Flash from "@/components/admin/Flash";
import SubmitButton from "@/components/admin/SubmitButton";
import type { PageProps } from "@/lib/admin";
import { db, schema } from "@/lib/db";
import { deleteMessage, toggleMessageRead } from "./actions";

export const metadata: Metadata = { title: "Messages" };

export default async function MessagesPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const rows = await db.select().from(schema.messages).orderBy(desc(schema.messages.createdAt)).limit(200);
  return (
    <>
      <div className="admin-head">
        <div>
          <h1>Messages</h1>
          <p>Messages reçus via la page Contact.</p>
        </div>
      </div>
      <Flash ok={sp.ok} error={sp.error} />
      {rows.length === 0 && <div className="acard empty">Aucun message pour le moment.</div>}
      {rows.map((m) => {
        const isEmail = m.contact.includes("@");
        return (
          <div className="acard" key={m.id} style={m.read ? { opacity: 0.75 } : { borderLeft: "3px solid var(--gold)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <strong>{m.name}</strong> {!m.read && <span className="pill pill--en_attente">Nouveau</span>}
                <div className="muted">
                  <a href={isEmail ? `mailto:${m.contact}` : `tel:${m.contact.replace(/\s/g, "")}`}>{m.contact}</a>
                  {m.subject && ` · ${m.subject}`} · {m.createdAt.toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}
                </div>
              </div>
              <div className="row-actions">
                <form action={toggleMessageRead}>
                  <input type="hidden" name="id" value={m.id} />
                  <input type="hidden" name="read" value={m.read ? "0" : "1"} />
                  <SubmitButton small variant="ghost">
                    {m.read ? "Marquer non lu" : "Marquer lu"}
                  </SubmitButton>
                </form>
                <form action={deleteMessage}>
                  <input type="hidden" name="id" value={m.id} />
                  <SubmitButton small variant="danger" confirm="Supprimer ce message ?">
                    Supprimer
                  </SubmitButton>
                </form>
              </div>
            </div>
            <p style={{ margin: "12px 0 0", whiteSpace: "pre-wrap" }}>{m.message}</p>
          </div>
        );
      })}
    </>
  );
}
