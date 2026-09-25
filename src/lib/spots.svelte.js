import { SPORT_DEFAULTS } from './forecast.js';
import { upsertCloudSpots, deleteCloudSpot } from './supabase.js';

const KEY = 'etale.spots';
const CUR_KEY = 'etale.current';

const EXAMPLES = [
  {
    id: 'torche',
    name: 'La Torche',
    lat: 47.838,
    lon: -4.35,
    tideCorr: 0,
    defaultSport: 'kite',
    example: true,
    sports: {
      kite: { wmin: 12, wmax: 30, sectors: [9, 10, 11, 12, 13, 14], tidePref: 'all' },
      wing: { wmin: 14, wmax: 30, sectors: [9, 10, 11, 12, 13, 14], tidePref: 'all' },
      surf: { waveMin: 0.8, periodMin: 9, windMax: 15, sectors: [2, 3, 4, 5, 6], tidePref: 'all' },
    },
  },
  {
    id: 'penthievre',
    name: 'Penthièvre',
    lat: 47.535,
    lon: -3.15,
    tideCorr: 0,
    defaultSport: 'surf',
    example: true,
    sports: {
      kite: { wmin: 12, wmax: 30, sectors: [9, 10, 11, 12, 13, 14], tidePref: 'all' },
      wing: { wmin: 14, wmax: 30, sectors: [9, 10, 11, 12, 13, 14], tidePref: 'all' },
      surf: { waveMin: 0.8, periodMin: 9, windMax: 15, sectors: [1, 2, 3, 4, 5], tidePref: 'mid' },
    },
  },
];

function read(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

const initial = read(KEY, null) || structuredClone(EXAMPLES);

export const store = $state({
  spots: initial,
  currentId: read(CUR_KEY, initial[0]?.id ?? null),
  userId: null,
  syncError: '',
});

export const currentSpot = () => store.spots.find((s) => s.id === store.currentId) || store.spots[0] || null;

export const sportFor = (spot) => spot?.defaultSport || 'kite';

function saveLocal() {
  write(KEY, $state.snapshot(store.spots));
}

async function cloud(fn) {
  if (!store.userId) return;
  try {
    await fn(store.userId);
    store.syncError = '';
  } catch (e) {
    store.syncError = e.message || String(e);
  }
}

function pushSpots(spots) {
  const items = spots
    .filter((s) => !s.example)
    .map((s) => ({ spot: $state.snapshot(s), position: store.spots.indexOf(s) }));
  return cloud((uid) => upsertCloudSpots(uid, items));
}

export function selectSpot(id) {
  store.currentId = id;
  write(CUR_KEY, id);
}

export function setSport(spotId, sport) {
  const s = store.spots.find((x) => x.id === spotId);
  if (!s || s.defaultSport === sport) return;
  s.defaultSport = sport;
  saveLocal();
  pushSpots([s]);
}

export function newSpot({ name = '', lat = null, lon = null } = {}) {
  return {
    id: 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name,
    lat,
    lon,
    tideCorr: 0,
    defaultSport: 'kite',
    sports: structuredClone(SPORT_DEFAULTS),
  };
}

export function saveSpot(spot) {
  const clean = { ...structuredClone(spot), example: false };
  const i = store.spots.findIndex((s) => s.id === clean.id);
  if (i >= 0) {
    const old = store.spots[i];
    if (old.lat !== clean.lat || old.lon !== clean.lon) delete clean.marineOffset;
    store.spots[i] = clean;
  } else {
    store.spots.push(clean);
  }
  selectSpot(clean.id);
  saveLocal();
  return pushSpots([store.spots.find((s) => s.id === clean.id)]);
}

export function setMarineOffset(id, offset) {
  const s = store.spots.find((x) => x.id === id);
  if (!s || (s.marineOffset?.[0] === offset?.[0] && s.marineOffset?.[1] === offset?.[1])) return;
  s.marineOffset = offset;
  saveLocal();
  pushSpots([s]);
}

export function removeSpot(id) {
  store.spots = store.spots.filter((s) => s.id !== id);
  if (store.currentId === id) selectSpot(store.spots[0]?.id ?? null);
  saveLocal();
  return cloud((uid) => deleteCloudSpot(uid, id));
}

export function moveSpot(from, to) {
  if (from === to || to < 0 || to >= store.spots.length) return;
  const [s] = store.spots.splice(from, 1);
  store.spots.splice(to, 0, s);
  saveLocal();
}

export function commitOrder() {
  return pushSpots(store.spots);
}

export function mergeCloudSpots(cloudSpots) {
  const ids = new Set(cloudSpots.map((s) => s.id));
  const extra = store.spots.filter((s) => !s.example && !ids.has(s.id)).map((s) => $state.snapshot(s));
  const merged = [...cloudSpots, ...extra];
  if (merged.length) store.spots = merged;
  if (!store.spots.some((s) => s.id === store.currentId)) selectSpot(store.spots[0]?.id ?? null);
  saveLocal();
  return extra.length ? pushSpots(store.spots) : Promise.resolve();
}
