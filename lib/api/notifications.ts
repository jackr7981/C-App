import { supabase } from '../supabase';
import type { Notification } from '../../types';

export async function getNotificationsForUser(userId: string): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return [];
  return (data ?? []).map((r) => ({
    id: r.id,
    title: r.title,
    message: r.message,
    timestamp: r.created_at,
    read: r.read,
    type: r.type,
  }));
}

export async function markNotificationRead(notificationId: string): Promise<boolean> {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId);
  return !error;
}

export async function addNotification(
  userId: string,
  title: string,
  message: string,
  type: Notification['type'] = 'info'
): Promise<Notification | null> {
  const { data, error } = await supabase
    .from('notifications')
    .insert({ user_id: userId, title, message, type, read: false })
    .select()
    .single();

  if (error || !data) return null;
  return {
    id: data.id,
    title: data.title,
    message: data.message,
    timestamp: data.created_at,
    read: data.read,
    type: data.type,
  };
}

export async function clearNotificationsForUser(userId: string): Promise<boolean> {
  const { error } = await supabase.from('notifications').delete().eq('user_id', userId);
  return !error;
}
