# Setting up sign-in (Neon + Google) — about 30 minutes

VibeKit signs people in with **Better Auth** and stores data in **Neon
PostgreSQL**. That means two accounts to set up: Neon for the database, and
Google for the sign-in button. Neither needs any coding.

Do the steps in order. At the end you will put four values into `.env.local` and
I can test the whole flow.

**Which file holds the real values?** `.env.local`. It is excluded from git and
never published. `.env.example` is only the blank template.

**Never paste these values into our chat.** Type them into the file.

---

## Part 1 — Create the Neon database

1. Go to **neon.tech** and click **Sign up**. Signing in with GitHub is fastest.
2. Create a project. Name it `jbc-skin-cream`. Pick the region closest to you
   (for Nigeria, **Europe (Frankfurt)** is usually the lowest latency).
3. On the project page, find **Connection Details**.
4. Make sure the toggle says **Pooled connection** — this matters. A serverless
   host like Vercel opens and closes connections constantly, and the direct
   (non-pooled) string runs out of connections.
5. Copy the whole `postgresql://...` string. It looks like:

   ```
   postgresql://jbc:AbC123@ep-cool-name-123456-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```

6. Paste it into `.env.local` as `DATABASE_URL`.

### Create the tables

The database is empty — it needs the tables first. In this project folder run:

```bash
npx prisma db push
```

That reads `prisma/schema.prisma` and creates every table. You should see
`Your database is now in sync with your Prisma schema.`

You only ever do this again if the schema changes.

Want sample data to look at while building the admin page? Run:

```bash
pnpm db:seed
```

That adds 12 sample clients and 52 sample requests. They are **not** sign-in
accounts — nobody can log in as them.

---

## Part 2 — Create the Google sign-in keys

This is the fiddliest part, but it is all clicking.

### Step 1. Create a Google Cloud project

1. Go to **console.cloud.google.com** and sign in with a Google account.
2. Top-left, click the project dropdown → **New Project**.
3. Name it `JBC Skin Cream` and click **Create**.
4. Make sure the new project is selected in the dropdown before continuing.

### Step 2. Configure the consent screen

1. In the search bar at the top, type **OAuth consent screen** and open it.
2. Choose **External**, then **Create**.
3. Fill in:
   - **App name:** `JBC Skin Cream`
   - **User support email:** your email
   - **Developer contact email:** your email
4. Save and continue through **Scopes** and **Test users** without changing
   anything.
5. Back on the OAuth consent screen page, click **Publish app**. Confirm.

   If you leave it in "Testing", only Google accounts you add by hand can sign
   in, and their sessions expire every 7 days. Publishing avoids that. Google may
   show an "unverified app" warning until you submit for verification — that
   warning is normal for a new app and safe for your own use.

### Step 3. Create the credentials

1. Search for **Credentials** and open it.
2. **+ Create Credentials** → **OAuth client ID**.
3. **Application type:** Web application.
4. **Name:** `JBC Web`.
5. Under **Authorized redirect URIs**, click **Add URI** and add this one for
   local development:

   ```
   http://localhost:3000/api/auth/callback/google
   ```

   You will add the live Vercel address here later (see Part 3).

6. Click **Create**. Google shows a **Client ID** and **Client Secret**.

7. Copy them into `.env.local`:

   ```
   GOOGLE_CLIENT_ID="...apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="..."
   ```

> **Careful with the redirect URI.** Better Auth's callback path is
> `/api/auth/callback/google`. Google matches this exactly, character for
> character. `http` vs `https` and a missing or extra trailing slash both break
> it. If sign-in ever fails with `redirect_uri_mismatch`, this is why.

---

## Part 3 — When the site is live on Vercel

Add these on Vercel under **Settings → Environment Variables** (the same values
from `.env.local`, except `BETTER_AUTH_URL`):

| Name | Value |
|---|---|
| `DATABASE_URL` | the same pooled Neon string |
| `BETTER_AUTH_SECRET` | the same random secret |
| `BETTER_AUTH_URL` | `https://your-vercel-address.vercel.app` |
| `GOOGLE_CLIENT_ID` | the same Client ID |
| `GOOGLE_CLIENT_SECRET` | the same Client Secret |
| `ADMIN_EMAILS` | your real email |

Then go back to Google Cloud Console → **Credentials** → your OAuth client, and
add the live callback as a second **Authorized redirect URI**:

```
https://your-vercel-address.vercel.app/api/auth/callback/google
```

Keep the localhost one as well — you will still develop locally.

---

## Part 4 — Test it

Restart the dev server (`Ctrl+C`, then `pnpm dev`) and tell me it is done. Then:

1. Open **http://localhost:3000**.
2. Click **Sign in with Google**.
3. Choose your Google account.
4. You land on **My requests** with your name in the top bar.
5. A row appears in the `user` table in Neon (find it under **Tables** in the
   Neon console, or run `pnpm db:studio`).

Then I verify the part that matters: that one client cannot read another
client's requests.

---

## If something goes wrong

**The button still says "Sign in is being connected now."** The Google values
are not in `.env.local`, or the dev server was not restarted after you added
them. Env changes need a restart.

**`redirect_uri_mismatch` from Google.** The redirect URI in Google Cloud does
not match exactly. Compare it character by character with the one above.

**`Error: P1001: Can't reach database server`.** The `DATABASE_URL` is wrong or
the Neon project is paused. Copy it again, and make sure you took the **pooled**
string.

**Sign-in works but you land back signed out.** `BETTER_AUTH_URL` does not match
the address in the browser. Both should be `http://localhost:3000` in
development.

**`pnpm db:push` says the environment variable is missing.** `.env.local` does
not have `DATABASE_URL`, or you are running the command in the wrong folder.
