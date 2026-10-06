# Royal Beach Mbocko

Site du restaurant (Next.js 16) avec back-office sur `/admin`.

## Variables d'environnement

| Variable | Rôle |
| --- | --- |
| `DATABASE_URL` | Postgres (Neon en production, fourni par l'intégration Vercel) |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Stockage des photos uploadées (dossier `royalbeach/` sur Cloudinary). Sans ces variables, en local, les images vont dans `public/uploads`. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` | Envoi des e-mails d'invitation. Sans SMTP, le lien d'invitation s'affiche dans le back-office pour être copié. |
| `APP_URL` (optionnel) | URL publique utilisée dans les liens d'invitation (sinon le domaine courant) |

## Base de données

- `npm run build` applique les migrations (`drizzle/`) et remplit une base vide avec le contenu initial (`scripts/seed-data.ts`).
- Après une modification de `lib/db/schema.ts` : `npm run db:generate`.

## Premier administrateur

```bash
npx tsx --env-file=.env.local scripts/invite-admin.ts vous@exemple.com https://royalbeachmboko.vercel.app
```

Ouvrez le lien affiché pour choisir votre nom et votre mot de passe. Les administrateurs suivants s'invitent depuis **Back-office → Administrateurs**.

## Développement local

```bash
docker run -d --name royalbeach_pg -e POSTGRES_PASSWORD=royal -e POSTGRES_DB=royalbeach -p 5440:5432 postgres:16-alpine
npm run db:migrate
npm run dev
```
