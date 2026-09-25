import { tm, ts } from './format.js';

export const BREST = { lat: 48.38, lon: -4.5 };
export const BREST_SHIFT = 50;
export const COEF_K = 16.85;

export function seaSeries(d) {
  const m = d?.minutely_15;
  if (m?.sea_level_height_msl?.some((v) => v != null)) {
    return { T: m.time.map(tm), V: m.sea_level_height_msl, step: 15 };
  }
  const h = d?.hourly;
  if (h?.sea_level_height_msl?.some((v) => v != null)) {
    return { T: h.time.map(tm), V: h.sea_level_height_msl, step: 60 };
  }
  return null;
}

export function extremes(S) {
  const W = Math.max(1, Math.round(100 / S.step));
  const V = S.V;
  const out = [];
  for (let i = 1; i < V.length - 1; i++) {
    const v = V[i];
    if (v == null || V[i - 1] == null || V[i + 1] == null) continue;
    let isMax = true;
    let isMin = true;
    for (let j = Math.max(0, i - W); j <= Math.min(V.length - 1, i + W); j++) {
      if (j === i || V[j] == null) continue;
      if (V[j] > v) isMax = false;
      if (V[j] < v) isMin = false;
    }
    if (!isMax && !isMin) continue;
    if (V[i - 1] === v) continue;
    const a = V[i - 1];
    const c = V[i + 1];
    const den = a - 2 * v + c;
    let off = den ? (0.5 * (a - c)) / den : 0;
    off = Math.max(-1, Math.min(1, off));
    const peak = v - 0.25 * (a - c) * off;
    const type = isMax ? 'PM' : 'BM';
    const prev = out[out.length - 1];
    if (prev && prev.type === type && S.T[i] - prev.t < 180) {
      if ((type === 'PM') === peak > prev.v) out[out.length - 1] = { type, t: S.T[i] + off * S.step, v: peak };
      continue;
    }
    out.push({ type, t: S.T[i] + off * S.step, v: peak });
  }
  return out;
}

/** @returns {Record<string, {c:number, t:number}[]>} coefficients keyed by local day */
export function brestCoefs(d) {
  const S = seaSeries(d);
  if (!S) return {};
  const ex = extremes(S);
  const out = {};
  ex.forEach((e, i) => {
    if (e.type !== 'PM') return;
    const lows = [ex[i - 1], ex[i + 1]].filter((x) => x && x.type === 'BM');
    if (!lows.length) return;
    const range = e.v - lows.reduce((a, b) => a + b.v, 0) / lows.length;
    const c = Math.max(20, Math.min(120, Math.round(COEF_K * range)));
    const t = e.t + BREST_SHIFT;
    (out[ts(t).slice(0, 10)] ||= []).push({ c, t });
  });
  return out;
}

export const coefClass = (c) => (c >= 95 ? 'gm' : c >= 70 ? 've' : c < 45 ? 'me' : '');
export const coefLabel = (c) => (c >= 95 ? 'grande marée' : c >= 70 ? 'vive-eau' : c < 45 ? 'morte-eau' : 'marée moyenne');

export function levelAt(S, t) {
  if (!S) return null;
  const i = Math.floor((t - S.T[0]) / S.step);
  if (i < 0 || i >= S.V.length - 1) return null;
  const a = S.V[i];
  const b = S.V[i + 1];
  if (a == null || b == null) return null;
  return a + (b - a) * ((t - S.T[i]) / S.step);
}

export function tidePhase(ex, t) {
  let prev = null;
  let next = null;
  for (const e of ex) {
    if (e.t <= t) prev = e;
    else {
      next = e;
      break;
    }
  }
  if (!prev || !next) return null;
  const rising = next.type === 'PM';
  const dPM = Math.min(...[prev, next].filter((e) => e.type === 'PM').map((e) => Math.abs(e.t - t)));
  const dBM = Math.min(...[prev, next].filter((e) => e.type === 'BM').map((e) => Math.abs(e.t - t)));
  return { rising, nearHigh: dPM <= 120, nearLow: dBM <= 120, mid: dPM > 120 && dBM > 120, prev, next };
}

export function tideOk(pref, ph) {
  if (!ph || !pref || pref === 'all') return true;
  if (pref === 'high') return ph.nearHigh;
  if (pref === 'low') return ph.nearLow;
  if (pref === 'mid') return ph.mid;
  if (pref === 'rising') return ph.rising;
  return !ph.rising;
}

export function nearestCoef(list, t) {
  let best = null;
  for (const x of list) if (!best || Math.abs(x.t - t) < Math.abs(best.t - t)) best = x;
  return best && Math.abs(best.t - t) <= 12 * 60 ? best : null;
}
