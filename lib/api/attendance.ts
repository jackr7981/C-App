import { supabase } from '../supabase';
import type { MealAttendance } from '../../types';

export async function getAttendance(): Promise<MealAttendance[]> {
  const { data, error } = await supabase
    .from('meal_attendance')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return [];
  return (data ?? []).map((r) => ({
    menu_id: r.menu_id,
    user_id: r.user_id,
    status: r.status,
    timestamp: r.created_at,
  }));
}

export async function getAttendanceForUser(userId: string): Promise<MealAttendance[]> {
  const { data, error } = await supabase
    .from('meal_attendance')
    .select('*')
    .eq('user_id', userId);

  if (error) return [];
  return (data ?? []).map((r) => ({
    menu_id: r.menu_id,
    user_id: r.user_id,
    status: r.status,
    timestamp: r.created_at,
  }));
}

export async function setAttendance(
  menuId: string,
  userId: string,
  status: MealAttendance['status']
): Promise<MealAttendance | null> {
  const { data, error } = await supabase
    .from('meal_attendance')
    .upsert(
      { menu_id: menuId, user_id: userId, status },
      { onConflict: 'menu_id,user_id' }
    )
    .select()
    .single();

  if (error || !data) return null;
  return {
    menu_id: data.menu_id,
    user_id: data.user_id,
    status: data.status,
    timestamp: data.created_at,
  };
}

export async function removeAttendance(menuId: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('meal_attendance')
    .delete()
    .eq('menu_id', menuId)
    .eq('user_id', userId);
  return !error;
}
