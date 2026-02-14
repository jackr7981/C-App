import { getSupabase } from '../supabase';
import type { User, DietaryProfile } from '../../types';
import type { Database } from '../database.types';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export function profileFromRow(row: ProfileRow): User {
  return {
    user_id: row.user_id,
    name: row.name,
    rank: row.rank,
    role: row.role,
    onboarding_completed: row.onboarding_completed,
    password_changed: row.password_changed,
    dietary_profile: row.dietary_profile as DietaryProfile,
  };
}

export async function getProfileByUserId(userId: string): Promise<User | null> {
  const { data, error } = await getSupabase()
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;
  return profileFromRow(data as ProfileRow);
}

export async function getProfileByAuthId(authId: string): Promise<User | null> {
  const { data, error } = await getSupabase()
    .from('profiles')
    .select('*')
    .eq('auth_id', authId)
    .single();

  if (error || !data) return null;
  return profileFromRow(data as ProfileRow);
}

export async function listCrew(): Promise<User[]> {
  const { data, error } = await getSupabase()
    .from('profiles')
    .select('*')
    .order('name');

  if (error) return [];
  return (data ?? []).map((row) => profileFromRow(row as ProfileRow));
}

export async function updateProfile(
  userId: string,
  updates: Partial<Pick<User, 'name' | 'rank' | 'role' | 'onboarding_completed' | 'dietary_profile' | 'password_changed'>>
): Promise<User | null> {
  const row: Record<string, unknown> = {};
  if (updates.name !== undefined) row.name = updates.name;
  if (updates.rank !== undefined) row.rank = updates.rank;
  if (updates.role !== undefined) row.role = updates.role;
  if (updates.onboarding_completed !== undefined) row.onboarding_completed = updates.onboarding_completed;
  if (updates.dietary_profile !== undefined) row.dietary_profile = updates.dietary_profile;
  if (updates.password_changed !== undefined) row.password_changed = updates.password_changed;

  const { data, error } = await getSupabase()
    .from('profiles')
    .update(row)
    .eq('user_id', userId)
    .select()
    .single();

  if (error || !data) return null;
  return profileFromRow(data as ProfileRow);
}

export async function createProfile(profile: {
  user_id: string;
  auth_id?: string | null;
  name: string;
  rank: string;
  role: 'crew' | 'admin' | 'galley' | 'officer';
  onboarding_completed?: boolean;
  password_changed?: boolean;
  dietary_profile?: DietaryProfile;
}): Promise<User | null> {
  const { data, error } = await getSupabase()
    .from('profiles')
    .insert({
      auth_id: profile.auth_id ?? null,
      user_id: profile.user_id,
      name: profile.name,
      rank: profile.rank,
      role: profile.role,
      onboarding_completed: profile.onboarding_completed ?? false,
      password_changed: profile.password_changed ?? false,
      dietary_profile: profile.dietary_profile ?? {
        food_allergies: [],
        religious_restrictions: { religion: 'none', avoid_items: [], requires_halal: false, requires_kosher: false },
        medical_restrictions: [],
        lifestyle_preferences: [],
        dislikes: [],
      },
    })
    .select()
    .single();

  if (error || !data) return null;
  return profileFromRow(data as ProfileRow);
}
