import { untrack } from 'svelte';
import { loadForecast } from './api.js';
import { setMarineOffset } from './spots.svelte.js';

const REFRESH_MS = 30 * 60000;

class Forecasts {
  map = $state.raw({});
  now = $state(Date.now());

  get(id) {
    return this.map[id];
  }

  set(id, entry) {
    this.map = { ...this.map, [id]: entry };
  }
}

export const forecasts = new Forecasts();

export const keyOf = (s) => `${s.lat},${s.lon},${+s.tideCorr || 0}`;

export function ensureForecast(spot, force = false) {
  untrack(() => load(spot, force));
}

function load(spot, force) {
  if (!spot || spot.lat == null || spot.lon == null) return;
  const key = keyOf(spot);
  const cur = forecasts.get(spot.id);
  const fresh = cur && cur.key === key && Date.now() - cur.at < REFRESH_MS;
  if (!force && fresh && cur.status !== 'error') return;
  if (!force && cur?.key === key && cur.status === 'loading') return;

  const at = Date.now();
  forecasts.set(spot.id, { key, at, status: 'loading', data: cur?.key === key ? cur.data : null, error: null });
  loadForecast($state.snapshot(spot), force).then(
    ({ data, marineOffset }) => {
      if (forecasts.get(spot.id)?.at !== at) return;
      forecasts.set(spot.id, { key, at, status: 'ok', data, error: null });
      if (marineOffset) setMarineOffset(spot.id, marineOffset);
    },
    (e) => {
      if (forecasts.get(spot.id)?.at !== at) return;
      forecasts.set(spot.id, { key, at, status: 'error', data: cur?.key === key ? cur.data : null, error: e.message || String(e) });
    },
  );
}

export function startClock() {
  const tick = () => (forecasts.now = Date.now());
  const id = setInterval(() => document.visibilityState === 'visible' && tick(), 60000);
  document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && tick());
  return () => clearInterval(id);
}
