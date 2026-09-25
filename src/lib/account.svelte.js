import { supabase, fetchCloudSpots } from './supabase.js';
import { store, mergeCloudSpots } from './spots.svelte.js';

export const account = $state({
  enabled: !!supabase,
  email: null,
  syncing: false,
  syncedAt: null,
});

let syncedUser = null;

async function syncFromCloud(userId) {
  if (syncedUser === userId) return;
  syncedUser = userId;
  account.syncing = true;
  try {
    await mergeCloudSpots(await fetchCloudSpots());
    account.syncedAt = new Date();
    store.syncError = '';
  } catch (e) {
    syncedUser = null;
    store.syncError = e.message || String(e);
  } finally {
    account.syncing = false;
  }
}

export function initAccount() {
  if (!supabase) return;
  supabase.auth.onAuthStateChange((_event, session) => {
    const user = session?.user ?? null;
    account.email = user?.email ?? null;
    store.userId = user?.id ?? null;
    if (!user) {
      syncedUser = null;
      return;
    }
    setTimeout(() => syncFromCloud(user.id), 0);
  });
}

export async function sendCode(email) {
  const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
  if (error) throw error;
}

export async function verifyCode(email, token) {
  const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
  if (error) throw error;
}

export async function signOut() {
  await supabase.auth.signOut();
}
