<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1QflxMZdCjnh6XDGbogieoTa1lQ-DF9Gf

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Supabase backend (optional)

The app can use Supabase as the backend for auth, menus, crew, ratings, requests, notifications, and waste logs.

1. Create a project at [supabase.com](https://supabase.com) and get your project URL and anon key from **Settings → API**.
2. Copy [.env.example](.env.example) to `.env` and set:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. In the Supabase **SQL Editor**, run the migration:
   - Open `supabase/migrations/20250214000000_initial_schema.sql` and run its contents.
   - Optionally run `supabase/seed.sql` for default waste config.
4. Create Auth users for login (Supabase Dashboard → **Authentication → Users**):
   - **Crew:** Email `A12345678@crewmeal.app`, password `123456` (or your choice).
   - **Officer / Galley / Admin:** Email `u_officer@crewmeal.app`, `u_galley@crewmeal.app`, `u_admin@crewmeal.app` with password `admin`.
   Then create matching **profiles** in the `profiles` table (or use the app’s crew-import to create profiles and create the Auth users manually with the same email pattern `<user_id>@crewmeal.app`).
5. Link Auth to profiles: after creating each Auth user, set `profiles.auth_id` to that user’s UUID for the corresponding `user_id`.

If `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are not set, the app runs with in-memory mock data only.
