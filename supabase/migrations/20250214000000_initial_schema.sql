-- CrewMeal initial schema for Supabase
-- Run this in SQL Editor in Supabase Dashboard, or via: supabase db push

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles (crew/users). Links to auth.users via auth_id when using Supabase Auth.
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  rank TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL CHECK (role IN ('crew', 'admin', 'galley', 'officer')) DEFAULT 'crew',
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  password_changed BOOLEAN NOT NULL DEFAULT false,
  dietary_profile JSONB NOT NULL DEFAULT '{
    "food_allergies": [],
    "religious_restrictions": {"religion": "none", "avoid_items": [], "requires_halal": false, "requires_kosher": false},
    "medical_restrictions": [],
    "lifestyle_preferences": [],
    "dislikes": []
  }'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_auth_id ON public.profiles(auth_id);

-- Menu items (reusable across menus)
CREATE TABLE IF NOT EXISTS public.menu_items (
  item_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('main', 'side', 'dessert', 'beverage', 'fruit')),
  estimated_calories INT NOT NULL DEFAULT 0,
  dietary_flags JSONB NOT NULL DEFAULT '{
    "contains_pork": false, "contains_beef": false, "contains_shellfish": false,
    "vegetarian": false, "halal_compliant": true
  }'::jsonb,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Menus (one per date + meal_type)
CREATE TABLE IF NOT EXISTS public.menus (
  menu_id TEXT PRIMARY KEY,
  date DATE NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('Breakfast', 'Lunch', 'Dinner')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_menus_date ON public.menus(date);

-- Menu <-> Menu items (many-to-many). is_alternative = false for main items, true for alternatives
CREATE TABLE IF NOT EXISTS public.menu_menu_items (
  menu_id TEXT NOT NULL REFERENCES public.menus(menu_id) ON DELETE CASCADE,
  item_id TEXT NOT NULL REFERENCES public.menu_items(item_id) ON DELETE CASCADE,
  is_alternative BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (menu_id, item_id, is_alternative)
);

-- Ratings
CREATE TABLE IF NOT EXISTS public.ratings (
  rating_id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  item_id TEXT NOT NULL REFERENCES public.menu_items(item_id) ON DELETE CASCADE,
  menu_id TEXT NOT NULL REFERENCES public.menus(menu_id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  stars INT NOT NULL CHECK (stars >= 1 AND stars <= 5),
  emoji TEXT NOT NULL CHECK (emoji IN ('delicious', 'average', 'bad')),
  comment TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON public.ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_menu_id ON public.ratings(menu_id);

-- Requests (substitution / absence)
CREATE TABLE IF NOT EXISTS public.requests (
  request_id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  user_id TEXT NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  menu_id TEXT NOT NULL REFERENCES public.menus(menu_id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('substitution', 'absence')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'denied')) DEFAULT 'pending',
  detail TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_requests_user_id ON public.requests(user_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON public.requests(status);

-- Meal attendance
CREATE TABLE IF NOT EXISTS public.meal_attendance (
  menu_id TEXT NOT NULL REFERENCES public.menus(menu_id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('standard', 'late_plate', 'served', 'skipped')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (menu_id, user_id)
);

-- Notifications (per user)
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  user_id TEXT NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'alert', 'success')) DEFAULT 'info',
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

-- Waste config (singleton or per-vessel; we use one row)
CREATE TABLE IF NOT EXISTS public.waste_config (
  id TEXT PRIMARY KEY DEFAULT 'default',
  container_volume_m3 NUMERIC NOT NULL DEFAULT 0.05,
  container_weight_kg NUMERIC NOT NULL DEFAULT 25,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Waste logs
CREATE TABLE IF NOT EXISTS public.waste_logs (
  log_id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  date DATE NOT NULL,
  container_count INT NOT NULL,
  total_weight_kg NUMERIC NOT NULL,
  total_volume_m3 NUMERIC NOT NULL,
  logged_by TEXT NOT NULL REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_waste_logs_date ON public.waste_logs(date);

-- RLS: enable and allow service role / anon as needed. For development we allow all; tighten in production.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_logs ENABLE ROW LEVEL SECURITY;

-- Policies: allow read for authenticated, write for own profile / appropriate roles.
-- Simple policy: allow all for anon key (app uses anon key with auth). Restrict in production.
CREATE POLICY "Allow read all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update profiles" ON public.profiles FOR UPDATE USING (true);

CREATE POLICY "Allow all menu_items" ON public.menu_items FOR ALL USING (true);
CREATE POLICY "Allow all menus" ON public.menus FOR ALL USING (true);
CREATE POLICY "Allow all menu_menu_items" ON public.menu_menu_items FOR ALL USING (true);

CREATE POLICY "Allow all ratings" ON public.ratings FOR ALL USING (true);
CREATE POLICY "Allow all requests" ON public.requests FOR ALL USING (true);
CREATE POLICY "Allow all meal_attendance" ON public.meal_attendance FOR ALL USING (true);
CREATE POLICY "Allow all notifications" ON public.notifications FOR ALL USING (true);
CREATE POLICY "Allow all waste_config" ON public.waste_config FOR ALL USING (true);
CREATE POLICY "Allow all waste_logs" ON public.waste_logs FOR ALL USING (true);

-- Trigger to update updated_at on profiles
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
