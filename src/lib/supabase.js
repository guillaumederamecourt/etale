import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = url && key
  ? createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } })
  : null;

export async function fetchCloudSpots() {
  const { data, error } = await supabase.from('spots').select('id,data,position').order('position');
  if (error) throw error;
  return data.map((r) => ({ ...r.data, id: r.id }));
}

/** @param {string} userId @param {{spot: object, position: number}[]} items */
export async function upsertCloudSpots(userId, items) {
  if (!items.length) return;
  const now = new Date().toISOString();
  const rows = items.map(({ spot, position }) => ({ user_id: userId, id: spot.id, data: spot, position, updated_at: now }));
  const { error } = await supabase.from('spots').upsert(rows, { onConflict: 'user_id,id' });
  if (error) throw error;
}

export async function deleteCloudSpot(userId, id) {
  const { error } = await supabase.from('spots').delete().eq('user_id', userId).eq('id', id);
  if (error) throw error;
}
