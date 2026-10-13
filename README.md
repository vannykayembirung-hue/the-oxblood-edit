# The Oxblood Edit — Next.js + Neon + Vercel Blob

A starter scaffold based on the supplied specification. It includes the brand landing page, journal listing/article route, product guide page, admin login/dashboard skeleton, Neon SQL seed, and protected upload endpoint.

## Important status

This is a **starter scaffold, not a fully finished CMS**. The original brief refers to earlier JSX files that were not included in the supplied text. Article/product/affiliate CRUD screens, a complete content editor, tests, and final production QA still need to be built. Do not treat it as production-ready without testing and a security review.

## Local setup

1. Install Node.js 20+.
2. Copy `.env.example` to `.env.local` and fill in the real Neon connection string, Auth secret and Vercel Blob token.
3. In Neon SQL Editor, run `neon.sql`. Replace `__GUMROAD_URL__` with your real Gumroad URL after seeding, or update the product record later.
4. Run:

   ```bash
   npm install
   npm run dev
   ```

5. Open http://localhost:3000.

## Create an admin account

Generate a bcrypt hash locally:

```bash
node -e "console.log(require('bcryptjs').hashSync('CHOOSE_A_STRONG_PASSWORD', 12))"
```

Then insert the account in Neon SQL Editor, replacing the email and hash:

```sql
insert into users (email, password)
values ('admin@your-domain.com', 'PASTE_BCRYPT_HASH_HERE');
```

Do not use a sample password on a public deployment. Keep `.env.local` out of Git.

## Deploy

1. Push the project to a private GitHub repository.
2. Import it into Vercel.
3. Add `DATABASE_URL`, `AUTH_SECRET`, `BLOB_READ_WRITE_TOKEN`, `NEXT_PUBLIC_SITE_URL`, and `NEXTAUTH_URL` to Vercel Environment Variables.
4. Deploy and test login, upload, database reads, and mobile layouts before sharing publicly.

## ZIP backup

From the directory containing `the-oxblood-edit`:

```bash
zip -r the-oxblood-edit-neon.zip the-oxblood-edit \
  -x "the-oxblood-edit/node_modules/*" \
     "the-oxblood-edit/.git/*" \
     "the-oxblood-edit/.next/*" \
     "the-oxblood-edit/.env*"
```

Never include real secrets in the ZIP.
