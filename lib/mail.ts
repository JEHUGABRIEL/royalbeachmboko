import "server-only";
import nodemailer from "nodemailer";

/**
 * Envoie un e-mail via SMTP (Gmail, Resend, Brevo…). Renvoie false si SMTP
 * n'est pas configuré ou si l'envoi échoue : l'appelant propose alors le lien
 * à copier manuellement.
 */
export async function sendMail(to: string, subject: string, html: string, text: string): Promise<boolean> {
  const host = process.env.SMTP_HOST;
  if (!host) return false;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const transport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined,
  });
  try {
    await transport.sendMail({
      from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
      to,
      subject,
      html,
      text,
    });
    return true;
  } catch (err) {
    console.error("[mail] échec d'envoi", err);
    return false;
  }
}

export function invitationEmail(link: string, inviter: string) {
  const subject = "Invitation au back-office Royal Beach Mbocko";
  const text = `${inviter} vous invite à administrer le site Royal Beach Mbocko.\n\nCréez votre compte (nom et mot de passe) ici : ${link}\n\nCe lien est valable 7 jours.`;
  const html = `
  <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:32px;background:#f7f4ee;color:#333">
    <p style="font-family:Georgia,serif;font-size:26px;color:#a87f45;margin:0 0 4px">Royal Beach</p>
    <p style="letter-spacing:4px;font-size:10px;text-transform:uppercase;margin:0 0 28px;color:#888">Mbocko · back-office</p>
    <p><strong>${escapeHtml(inviter)}</strong> vous invite à administrer le site Royal Beach Mbocko.</p>
    <p>Cliquez sur le bouton ci-dessous pour choisir votre nom et votre mot de passe.</p>
    <p style="text-align:center;margin:32px 0">
      <a href="${link}" style="background:#1c1c1c;color:#fff;padding:14px 30px;border-radius:30px;text-decoration:none;font-size:12px;letter-spacing:2px;text-transform:uppercase">Créer mon compte</a>
    </p>
    <p style="font-size:12px;color:#888">Ce lien est valable 7 jours. Si vous n'attendiez pas cette invitation, ignorez cet e-mail.</p>
  </div>`;
  return { subject, text, html };
}

export const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
