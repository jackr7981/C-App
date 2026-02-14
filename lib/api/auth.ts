import { getSupabase } from '../supabase';
import type { User } from '../../types';
import { profileFromRow } from './profiles';

const CREW_EMAIL_SUFFIX = '@crewmeal.app';

/** Convert passport (user_id) to Supabase Auth email */
export function passportToEmail(passport: string): string {
  return `${passport.trim().toLowerCase()}${CREW_EMAIL_SUFFIX}`;
}

/**
 * Sign in with passport number and password.
 * Assumes Auth users are created with email = passport@crewmeal.app (e.g. when adding crew).
 */
export async function signInWithPassport(
  passport: string,
  password: string
): Promise<{ user: User; error: string | null }> {
  const email = passportToEmail(passport);
  const { data: authData, error: authError } = await getSupabase().auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    if (authError.message.includes('Invalid login')) {
      return { user: null as unknown as User, error: 'Invalid password or passport number.' };
    }
    return { user: null as unknown as User, error: authError.message };
  }

  if (!authData.user?.id) {
    return { user: null as unknown as User, error: 'Login failed.' };
  }

  const { data: profile, error: profileError } = await getSupabase()
    .from('profiles')
    .select('*')
    .eq('auth_id', authData.user.id)
    .single();

  if (profileError || !profile) {
    return { user: null as unknown as User, error: 'Profile not found. Please contact admin.' };
  }

  const user = profileFromRow(profile);
  return { user, error: null };
}

/**
 * Sign in for roles that use a shared account (officer, galley, admin).
 * These can use the same email format: role@crewmeal.app or we look up profile by user_id.
 */
export async function signInAsRole(
  roleUserId: string,
  password: string
): Promise<{ user: User; error: string | null }> {
  const { data: profile, error: profileError } = await getSupabase()
    .from('profiles')
    .select('*')
    .eq('user_id', roleUserId)
    .single();

  if (profileError || !profile) {
    return { user: null as unknown as User, error: 'Account not found.' };
  }

  const email = passportToEmail(roleUserId);
  const { error: authError } = await getSupabase().auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    return { user: null as unknown as User, error: 'Invalid password.' };
  }

  const user = profileFromRow(profile);
  return { user, error: null };
}

/** Get current session */
export async function getSession() {
  const { data: { session } } = await getSupabase().auth.getSession();
  return session;
}

/** Get current user profile from session (after login) */
export async function getCurrentUser(): Promise<User | null> {
  const { data: { user: authUser } } = await getSupabase().auth.getUser();
  if (!authUser?.id) return null;

  const { data: profile } = await getSupabase()
    .from('profiles')
    .select('*')
    .eq('auth_id', authUser.id)
    .single();

  if (!profile) return null;
  return profileFromRow(profile);
}

/** Sign out */
export async function signOut() {
  await getSupabase().auth.signOut();
}
