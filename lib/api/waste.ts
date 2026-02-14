import { getSupabase } from '../supabase';
import type { WasteConfig, WasteLog } from '../../types';

const WASTE_CONFIG_ID = 'default';

export async function getWasteConfig(): Promise<WasteConfig | null> {
  const { data, error } = await getSupabase()
    .from('waste_config')
    .select('*')
    .eq('id', WASTE_CONFIG_ID)
    .single();

  if (error || !data) return null;
  return {
    container_volume_m3: data.container_volume_m3,
    container_weight_kg: data.container_weight_kg,
  };
}

export async function updateWasteConfig(config: WasteConfig): Promise<WasteConfig | null> {
  const { data, error } = await getSupabase()
    .from('waste_config')
    .upsert(
      {
        id: WASTE_CONFIG_ID,
        container_volume_m3: config.container_volume_m3,
        container_weight_kg: config.container_weight_kg,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    )
    .select()
    .single();

  if (error || !data) return null;
  return {
    container_volume_m3: data.container_volume_m3,
    container_weight_kg: data.container_weight_kg,
  };
}

export async function getWasteLogs(): Promise<WasteLog[]> {
  const { data, error } = await getSupabase()
    .from('waste_logs')
    .select('*')
    .order('date', { ascending: false });

  if (error) return [];
  return (data ?? []).map((r) => ({
    log_id: r.log_id,
    date: typeof r.date === 'string' ? r.date.split('T')[0] : r.date,
    container_count: r.container_count,
    total_weight_kg: r.total_weight_kg,
    total_volume_m3: r.total_volume_m3,
    logged_by: r.logged_by,
  }));
}

export async function logWaste(
  loggedBy: string,
  containerCount: number,
  config: WasteConfig
): Promise<WasteLog | null> {
  const date = new Date().toISOString().split('T')[0];
  const total_weight_kg = containerCount * config.container_weight_kg;
  const total_volume_m3 = containerCount * config.container_volume_m3;

  const { data, error } = await getSupabase()
    .from('waste_logs')
    .insert({
      date,
      container_count: containerCount,
      total_weight_kg: total_weight_kg,
      total_volume_m3: total_volume_m3,
      logged_by: loggedBy,
    })
    .select()
    .single();

  if (error || !data) return null;
  return {
    log_id: data.log_id,
    date: typeof data.date === 'string' ? data.date.split('T')[0] : data.date,
    container_count: data.container_count,
    total_weight_kg: data.total_weight_kg,
    total_volume_m3: data.total_volume_m3,
    logged_by: data.logged_by,
  };
}
