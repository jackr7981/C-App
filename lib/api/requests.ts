import { supabase } from '../supabase';
import type { Request } from '../../types';

export async function getRequests(): Promise<Request[]> {
  const { data, error } = await supabase
    .from('requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return [];
  return (data ?? []).map((r) => ({
    request_id: r.request_id,
    user_id: r.user_id,
    menu_id: r.menu_id,
    type: r.type,
    status: r.status,
    detail: r.detail,
    timestamp: r.created_at,
  }));
}

export async function getRequestsForUser(userId: string): Promise<Request[]> {
  const { data, error } = await supabase
    .from('requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return [];
  return (data ?? []).map((r) => ({
    request_id: r.request_id,
    user_id: r.user_id,
    menu_id: r.menu_id,
    type: r.type,
    status: r.status,
    detail: r.detail,
    timestamp: r.created_at,
  }));
}

export async function createRequest(request: Omit<Request, 'request_id' | 'timestamp'>): Promise<Request | null> {
  const { data, error } = await supabase
    .from('requests')
    .insert({
      user_id: request.user_id,
      menu_id: request.menu_id,
      type: request.type,
      status: request.status,
      detail: request.detail,
    })
    .select()
    .single();

  if (error || !data) return null;
  return {
    request_id: data.request_id,
    user_id: data.user_id,
    menu_id: data.menu_id,
    type: data.type,
    status: data.status,
    detail: data.detail,
    timestamp: data.created_at,
  };
}

export async function updateRequestStatus(
  requestId: string,
  status: 'approved' | 'denied'
): Promise<Request | null> {
  const { data, error } = await supabase
    .from('requests')
    .update({ status })
    .eq('request_id', requestId)
    .select()
    .single();

  if (error || !data) return null;
  return {
    request_id: data.request_id,
    user_id: data.user_id,
    menu_id: data.menu_id,
    type: data.type,
    status: data.status,
    detail: data.detail,
    timestamp: data.created_at,
  };
}
