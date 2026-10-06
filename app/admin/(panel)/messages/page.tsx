import { count, desc } from "drizzle-orm";
import type { Metadata } from "next";
import ConfirmAction from "@/components/admin/ConfirmAction";
import Flash from "@/components/admin/Flash";
import IconButton from "@/components/admin/IconButton";
import Pagination from "@/components/admin/Pagination";
import { pageParam, type PageProps } from "@/lib/admin";
import { db, schema } from "@/lib/db";
import { deleteMessage, toggleMessageRead } from "./actions";

export const metadata: Metadata = { title: "Messages" };

const PER_PAGE = 10;

export default async function MessagesPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = pageParam(sp.page);
  const [[{ total }], rows] = await Promise.all([
    db.select({ total: count() }).from(schema.messages),
    db
      .select()
      .from(schema.messages)
      .orderBy(desc(schema.messages.createdAt))
      .limit(PER_PAGE)
      .offset((page - 1) * PER_PAGE),
  ]);
  const back = page > 1 ? `/admin/messages?page=${page}` : "/admin/messages";

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
          <div className={`acard message${m.read ? " message--read" : ""}`} key={m.id}>
            <div className="message__head">
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
                  <input type="hidden" name="back" value={back} />
                  <IconButton icon={m.read ? "mail" : "mailOpen"} label={m.read ? "Marquer non lu" : "Marquer lu"} />
                </form>
                <ConfirmAction
                  action={deleteMessage}
                  fields={{ id: m.id, back }}
                  label="Supprimer"
                  title="Supprimer le message ?"
                  message={
                    <>
                      Le message de <strong>{m.name}</strong> sera définitivement supprimé.
                    </>
                  }
                  confirmLabel="Supprimer"
                />
              </div>
            </div>
            <p className="message__body">{m.message}</p>
          </div>
        );
      })}
      <Pagination page={page} total={total} perPage={PER_PAGE} path="/admin/messages" />
    </>
  );
}
