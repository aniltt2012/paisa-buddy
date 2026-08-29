# Paisa Buddy — Multi-user Setup Guide

Your app now supports **real login with email + password**, and each person's
data is stored in the cloud — so it's the same whether they open the app on
their phone, laptop, or any other device. This uses **Supabase** (free tier),
not Firebase — no coding needed, just a few clicks and copy-pasting.

## 1. Create a free Supabase project

1. Go to https://supabase.com and sign up (free).
2. Click **New project**. Pick any name and a database password (save it
   somewhere safe, you likely won't need it again).
3. Wait ~1 minute for the project to finish setting up.

## 2. Create the database tables

1. In your Supabase project, open **SQL Editor** (left sidebar) → **New query**.
2. Open the file `supabase-setup.sql` (included in this zip), copy its
   entire contents, paste into the SQL editor, and click **Run**.
3. This creates the tables (`expenses`, `budgets`, `custom_categories`) and
   locks each row to its owner, so users can never see each other's data.

## 3. Get your project's API keys

1. In Supabase, go to **Project Settings → API**.
2. Copy the **Project URL** and the **anon public** key.

## 4. Connect the app to your Supabase project

1. In this project folder, copy `.env.example` to a new file named `.env`.
2. Paste in your values:
   ```
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
3. Save the file.

## 5. (Recommended) Turn off email confirmation for easy testing

By default Supabase sends a confirmation email before a new signup can log
in. For a personal/family app this is usually unnecessary friction:

1. In Supabase: **Authentication → Providers → Email**.
2. Turn **off** "Confirm email".
3. Save.

(You can leave it on if you'd rather have email verification — signups will
just need to click the link Supabase emails them before their first login.)

## 6. Build and deploy

1. Open a terminal in this project folder.
2. Run:
   ```
   npm install
   npm run build
   ```
3. This creates a `dist` folder with the finished site.
4. Go to https://app.netlify.com/drop and drag the **contents of `dist`**
   onto the page. You'll get a live URL instantly.

That's it — anyone can now go to your site, click **Sign up**, create their
own email + password, and their entries/budget/categories will follow them
to any device they log in from.

## 7. Payment-gated access — how approvals work

New signups can log in, but they'll see a **"waiting for approval"** screen
showing your GPay QR code until you approve them. Here's the flow:

1. A new user signs up and logs in.
2. They see your payment QR (`public/payment-qr.jpeg`) and can optionally
   type in their UPI transaction ID, then click submit.
3. **You approve them manually**: open your Supabase project →
   **Table Editor → access_requests**. You'll see their row (email +
   transaction ID if they entered one).
4. Once you've confirmed the payment in your own GPay/bank app, edit that
   row and change `status` from `pending` to `approved`, then save.
5. The user clicks "വീണ്ടും check ചെയ്യുക" (check again) on their screen
   (or just reloads the page) and they're in.

No coding needed for approvals — just editing a table in the Supabase
dashboard. Users can never approve themselves; only you (the project
owner) can change that status, since regular users only have insert/view
permission on that table, not update permission.

If you ever want to swap your GPay QR image, just replace
`public/payment-qr.jpeg` with a new image (same filename) and rebuild.

## Notes

- Each signup is a separate account with its own private data (row-level
  security in the database enforces this — not just the app's UI).
- Forgot password / password reset isn't wired up yet — if you want it,
  just ask and it can be added (Supabase supports it out of the box).
- If you ever redeploy after changing `.env`, remember to `npm run build`
  again before re-uploading — Vite bakes the keys in at build time.
