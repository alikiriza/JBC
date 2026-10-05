# Publishing JBC to GitHub and Vercel

Do this once, after Phase 1. It takes about 15 minutes and needs no coding.

---

## Part 1 — Put the code on GitHub

### Step 1. Create the repository

1. Go to **github.com** and sign in.
2. Click the **+** in the top right, then **New repository**.
3. Name it `jbc-skin-cream-app`.
4. Set visibility to **Private** (recommended while the app still has no login).
5. **Do not** tick "Add a README", ".gitignore", or a licence. We already have
   those files and GitHub would refuse the push.
6. Click **Create repository**.

### Step 2. Connect this folder to it

GitHub will show a page of commands. Copy the two commands under
**"push an existing repository"**. They start with `git remote add ...`.

Open **Git Bash** in this folder (right-click in the folder, "Open Git Bash
here") and paste them, one at a time, pressing Enter after each.

### Step 3. Save and push

```bash
git add -A
git commit -m "Phase 1: landing page"
git push -u origin main
```

**A quick check that secrets are safe:** `.env.local` is the only file holding
real keys, and it is excluded from git. To confirm it was never pushed, run
`git status` and check `.env.local` does **not** appear in the list. Only
`.env.example` (the blank version) should be listed.

---

## Part 2 — Publish to Vercel

### Step 1. Create the account

Go to **vercel.com** and sign up using your GitHub account. Choose the free
Hobby plan when asked.

### Step 2. Import the project

1. Click **Add New** → **Project**.
2. Find `jbc-skin-cream-app` in the list and click **Import**.

Vercel detects Next.js on its own. **Leave every field exactly as it is** and
click **Deploy**. The site builds and goes live at a free address like
`jbc-skin-cream-app.vercel.app`.

### Step 3: Add the settings

1. Click **Settings** → **Environment Variables**.
2. Add each key below. Paste the same values you use in `.env.local`. See
   `NEON-SETUP.md` for where each value comes from.

| Name | Value |
|---|---|
| `DATABASE_URL` | the pooled Neon connection string |
| `BETTER_AUTH_SECRET` | the same random secret as `.env.local` |
| `BETTER_AUTH_URL` | `https://your-vercel-address.vercel.app` |
| `GOOGLE_CLIENT_ID` | from Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | from Google Cloud Console |
| `ADMIN_EMAILS` | your real email address |

`BETTER_AUTH_URL` must be the real Vercel address, not localhost. Sign-in will
fail on the live site if it still says `http://localhost:3000`.

3. Click **Save**, then **Redeploy** so the new values take effect.
4. Add the live Google redirect URI as described in `NEON-SETUP.md` → Part 3.

### Step 4. Confirm it worked

Reload the project page. The landing page should look exactly like it does on
your computer.

---

## Part 3 — Every later change

Once GitHub and Vercel are connected, updating the site is three steps:

```bash
git add -A
git commit -m "describe the change"
git push
```

Vercel notices the push, rebuilds automatically, and updates the live site in
about a minute. There is nothing else to click.

---

## If something goes wrong

**Vercel says the build failed.** The most common cause is a typo in a
`.env.local` value, or missing values on Vercel. Check the **Logs** tab on the
deploy page for the exact error.

**"Repository not found" when pushing.** The remote link is wrong or the
repository is not private to your account. Re-copy the command from GitHub.

**The site looks different from your computer.** Check that `NEXT_PUBLIC_APP_URL`
matches the real Vercel address. A wrong value breaks fonts and links.

**You want a proper web address** such as `jbccream.com`. Buy the domain, then
in Vercel go to **Settings** → **Domains** and add it. Vercel handles the
connection and the secure certificate automatically.