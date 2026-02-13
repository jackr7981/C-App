-- Optional seed data. Run after initial_schema.sql.
-- Insert default waste config so galley can use it immediately.
INSERT INTO public.waste_config (id, container_volume_m3, container_weight_kg)
VALUES ('default', 0.05, 25)
ON CONFLICT (id) DO NOTHING;

-- To enable Crew Login with Supabase Auth:
-- 1. In Supabase Dashboard > Authentication > Users, create a user for each crew/officer/admin/galley:
--    Email: <user_id>@crewmeal.app  (e.g. A12345678@crewmeal.app, u_officer@crewmeal.app)
--    Password: (your chosen default, e.g. 123456 or admin)
-- 2. After creating the auth user, copy their UUID and run:
--    UPDATE public.profiles SET auth_id = '<auth_uuid>' WHERE user_id = '<user_id>';
-- Or use the Sign Up flow from the app (if you add one) to create auth users and then link profiles.
