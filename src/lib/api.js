import { MODELS, build } from './forecast.js';
import { BREST } from './tide.js';

const API = 'https://api.open-meteo.com/v1/forecast';
const MARINE = 'https://marine-api.open-meteo.com/v1/marine';
const GEO = 'https://geocoding-api.open-meteo.com/v1/search';
const PREFIX = 'etale.c:';

const MARINE_OFFSETS = [
  [0, 0], [0, -0.05], [-0.05, 0], [0.05, 0], [0, 0.05], [-0.05, -0.05], [0.05, -0.05],
  [0, -0.1], [-0.1, 0], [0.1, 0], [0, 0.1], [-0.1, -0.1], [0.1, -0.1], [-0.1, 0.1], [0.1, 0.1],
  [0, -0.2], [-0.2, 0], [0.2, 0], [0, 0.2],
];

function cacheGet(url) {
  try {
    return JSON.parse(localStorage.getItem(PREFIX + url));
  } catch {
    return null;
  }
}

function cacheSet(url, d) {
  try {
    localStorage.setItem(PREFIX + url, JSON.stringify({ t: Date.now(), d }));
  } catch {
    pruneCache(0);
  }
}

function pruneCache(maxAge = 3 * 3600e3) {
  try {
    const now = Date.now();
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (!k?.startsWith(PREFIX)) continue;
      const v = JSON.parse(localStorage.getItem(k));
      if (!v || now - v.t >= maxAge) localStorage.removeItem(k);
    }
  } catch {}
}

pruneCache();

async function getJSON(url, ttlMin = 30, force = false) {
  const c = cacheGet(url);
  if (!force && c && Date.now() - c.t < ttlMin * 60000) return c.d;
  const r = await fetch(url);
  let d;
  try {
    d = await r.json();
  } catch {
    throw new Error(`Réponse illisible (${r.status})`);
  }
  if (!r.ok || d.error) throw new Error(d.reason || `Erreur ${r.status}`);
  cacheSet(url, d);
  return d;
}

const loadWind = (s, force) =>
  getJSON(
    `${API}?latitude=${s.lat}&longitude=${s.lon}&hourly=wind_speed_10m,wind_gusts_10m,wind_direction_10m` +
      `&models=${MODELS.map((m) => m.id).join(',')}&wind_speed_unit=kn&forecast_days=7&timezone=auto`,
    30,
    force,
  );

const loadSun = (s, force) =>
  getJSON(`${API}?latitude=${s.lat}&longitude=${s.lon}&daily=sunrise,sunset&forecast_days=7&timezone=auto`, 360, force);

async function loadMarine(s, force) {
  const list = s.marineOffset ? [s.marineOffset, ...MARINE_OFFSETS] : MARINE_OFFSETS;
  for (const [dy, dx] of list) {
    const lat = (s.lat + dy).toFixed(3);
    const lon = (s.lon + dx).toFixed(3);
    const d = await getJSON(
      `${MARINE}?latitude=${lat}&longitude=${lon}` +
        `&hourly=wave_height,wave_period,wave_direction,swell_wave_height,swell_wave_period,swell_wave_direction,sea_level_height_msl` +
        `&minutely_15=sea_level_height_msl&timezone=auto&past_days=1&forecast_days=7`,
      60,
      force,
    );
    if (d.hourly?.wave_height?.some((v) => v != null)) return { data: { ...d, _at: [+lat, +lon] }, offset: [dy, dx] };
  }
  return { data: null, offset: null };
}

const loadBrest = (force) =>
  getJSON(
    `${MARINE}?latitude=${BREST.lat}&longitude=${BREST.lon}&minutely_15=sea_level_height_msl&hourly=sea_level_height_msl` +
      `&timezone=Europe/Paris&past_days=1&forecast_days=8`,
    60,
    force,
  );

export async function loadForecast(spot, force = false) {
  const [wind, sun, marine, brest] = await Promise.all([
    loadWind(spot, force),
    loadSun(spot, force),
    loadMarine(spot, force).catch(() => ({ data: null, offset: null })),
    loadBrest(force).catch(() => null),
  ]);
  return { data: build(spot, wind, sun, marine.data, brest), marineOffset: marine.offset };
}

export async function searchPlaces(q) {
  const d = await getJSON(`${GEO}?name=${encodeURIComponent(q)}&count=8&language=fr`, 1440);
  return d.results || [];
}
