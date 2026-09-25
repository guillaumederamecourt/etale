import { tm, sector } from './format.js';
import { seaSeries, extremes, brestCoefs, levelAt, tidePhase, tideOk, nearestCoef } from './tide.js';

export const MODELS = [
  { id: 'meteofrance_seamless', label: 'AROME', src: 'Météo-France' },
  { id: 'icon_seamless', label: 'ICON', src: 'DWD' },
  { id: 'ecmwf_ifs025', label: 'IFS', src: 'ECMWF' },
  { id: 'ukmo_seamless', label: 'UKMO', src: 'Met Office' },
  { id: 'gfs_seamless', label: 'GFS', src: 'NOAA' },
];

export const SPORTS = { kite: 'Kitesurf', wing: 'Wingfoil', surf: 'Surf' };

export const SPORT_DEFAULTS = {
  kite: { wmin: 12, wmax: 30, sectors: [], tidePref: 'all' },
  wing: { wmin: 14, wmax: 30, sectors: [], tidePref: 'all' },
  surf: { waveMin: 0.8, periodMin: 9, windMax: 15, sectors: [], tidePref: 'all' },
};

export const TIDEPREF = {
  all: 'Toutes marées',
  high: 'Autour de la pleine mer',
  low: 'Autour de la basse mer',
  mid: 'Mi-marée',
  rising: 'Marée montante',
  falling: 'Marée descendante',
};

export const H0 = 6;
export const H1 = 22;
export const STEP_HOURS = [5, 8, 11, 14, 17, 20, 23];

export function median(a) {
  const b = a.filter((v) => v != null).sort((x, y) => x - y);
  if (!b.length) return null;
  const m = b.length >> 1;
  return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2;
}

export function build(spot, wind, meteo, marine, brest) {
  const h = wind.hourly;
  const mIdx = {};
  if (marine) marine.hourly.time.forEach((t, i) => (mIdx[t] = i));
  const S = marine ? seaSeries(marine) : null;
  const corr = +spot.tideCorr || 0;
  const Sx = S ? { ...S, T: S.T.map((t) => t + corr) } : null;
  const ex = Sx ? extremes(Sx) : [];
  const sunMap = {};
  meteo.daily.time.forEach((d, i) => (sunMap[d] = [tm(meteo.daily.sunrise[i]), tm(meteo.daily.sunset[i])]));
  const meteoIdx = {};
  meteo.hourly.time.forEach((t, i) => (meteoIdx[t] = i));

  const hours = h.time.map((t, i) => {
    const models = {};
    const sp = [];
    const gu = [];
    let vx = 0;
    let vy = 0;
    for (const m of MODELS) {
      const w = h['wind_speed_10m_' + m.id]?.[i] ?? null;
      const g = h['wind_gusts_10m_' + m.id]?.[i] ?? null;
      const d = h['wind_direction_10m_' + m.id]?.[i] ?? null;
      models[m.id] = { w, g, d };
      if (w == null) continue;
      sp.push(w);
      if (g != null) gu.push(g);
      if (d != null) {
        const r = (d * Math.PI) / 180;
        vx += Math.sin(r) * Math.max(w, 1);
        vy += Math.cos(r) * Math.max(w, 1);
      }
    }
    const mi = mIdx[t];
    const mh = marine && mi != null ? marine.hourly : null;
    const T = tm(t);
    const day = t.slice(0, 10);
    const ki = meteoIdx[t];
    const sn = sunMap[day];
    return {
      t: T,
      key: t,
      day,
      hour: +t.slice(11, 13),
      models,
      w: median(sp),
      g: median(gu),
      d: sp.length ? ((Math.atan2(vx, vy) * 180) / Math.PI + 360) % 360 : null,
      spread: sp.length > 1 ? Math.max(...sp) - Math.min(...sp) : null,
      n: sp.length,
      wave: mh ? mh.wave_height[mi] : null,
      per: mh ? mh.wave_period[mi] : null,
      wdir: mh ? mh.wave_direction[mi] : null,
      swell: mh ? mh.swell_wave_height[mi] : null,
      sper: mh ? mh.swell_wave_period[mi] : null,
      sdir: mh ? mh.swell_wave_direction[mi] : null,
      lvl: levelAt(Sx, T),
      phase: tidePhase(ex, T),
      daylight: sn ? T >= sn[0] - 30 && T <= sn[1] + 30 : true,
      temp: ki != null ? meteo.hourly.temperature_2m[ki] : null,
      code: ki != null ? meteo.hourly.weather_code[ki] : null,
      isDay: ki != null ? meteo.hourly.is_day[ki] === 1 : true,
    };
  });

  const coefs = brest ? brestCoefs(brest) : {};
  const coefList = Object.values(coefs).flat().sort((a, b) => a.t - b.t);
  return {
    hours,
    ex,
    hasTide: !!Sx,
    sun: sunMap,
    days: meteo.daily.time,
    coefs,
    coefList,
    marineAt: marine?._at ?? null,
    utc: wind.utc_offset_seconds || 0,
  };
}

export function sportConfig(spot, sport) {
  return { ...SPORT_DEFAULTS[sport], ...(spot?.sports?.[sport] || {}) };
}

export function score(cfg, sport, o) {
  if (!o.daylight || o.w == null) return 0;
  const inSectors = !cfg.sectors?.length || o.d == null || cfg.sectors.includes(sector(o.d));
  let sc;
  if (sport === 'surf') {
    if (o.wave == null || o.wave < (+cfg.waveMin || 0)) return 0;
    sc = 1;
    if ((o.per || 0) >= (+cfg.periodMin || 0)) sc++;
    if (o.w <= 8 || (inSectors && o.w <= (+cfg.windMax || 15))) sc++;
    else if (!inSectors && o.w > 15) sc--;
  } else {
    if (o.w < cfg.wmin || o.w > cfg.wmax || !inSectors) return 0;
    sc = 1;
    if (o.w >= cfg.wmin + 3 && o.w <= cfg.wmax - 3) sc++;
    if (o.g == null || o.g - o.w <= 10) sc++;
  }
  if (!tideOk(cfg.tidePref, o.phase)) sc--;
  return Math.max(0, Math.min(3, sc));
}

export function scoreHours(data, spot, sport) {
  const cfg = sportConfig(spot, sport);
  return data.hours.map((o) => ({ ...o, score: score(cfg, sport, o) }));
}

export function bestWindow(hs) {
  let best = null;
  let run = null;
  for (const o of hs) {
    if (o.score >= 2) {
      run ||= { a: o.hour, b: o.hour, sum: 0 };
      run.b = o.hour;
      run.sum += o.score;
    } else if (run) {
      if (!best || run.sum > best.sum) best = run;
      run = null;
    }
  }
  if (run && (!best || run.sum > best.sum)) best = run;
  return best;
}

export const windowLabel = (bw) => (bw ? `${bw.a}h–${bw.b + 1}h` : null);

export const agreeCls = (sp) => (sp == null ? '' : sp <= 4 ? 'hi' : sp <= 8 ? 'mid' : 'lo');
export const agreeLabel = (sp) => ({ hi: 'bon', mid: 'moyen', lo: 'faible' })[agreeCls(sp)] || '';

export const dayHours = (hours, day) => hours.filter((o) => o.day === day && o.hour >= H0 && o.hour <= H1);

export function daySummary(hours, day) {
  const hs = dayHours(hours, day);
  const lit = hs.filter((o) => o.daylight);
  const maxWind = lit.reduce((a, o) => (o.w != null && (!a || o.w > a.w) ? o : a), null);
  const maxWave = lit.reduce((a, o) => (o.wave != null && (!a || o.wave > a.wave) ? o : a), null);
  return { hs, maxWind, maxWave, window: bestWindow(hs) };
}

export const stepHours = (hours, day, fromHour = 0) =>
  hours.filter((o) => o.day === day && STEP_HOURS.includes(o.hour) && o.hour >= fromHour);

export function nowKey(data, now = Date.now()) {
  return new Date(now + data.utc * 1000).toISOString().slice(0, 13) + ':00';
}

export function nowMinutes(data, now = Date.now()) {
  return Math.floor((now + data.utc * 1000) / 60000);
}

export function weekPeak(data) {
  let peak = null;
  for (const d of data.days) for (const x of data.coefs[d] || []) if (!peak || x.c > peak.c) peak = { ...x, day: d };
  return peak;
}

export function dayMaxCoef(data, day) {
  const cf = data.coefs[day] || [];
  return cf.length ? Math.max(...cf.map((x) => x.c)) : null;
}

export function dayHighTides(data, day) {
  const t0 = tm(day + 'T00:00');
  const inDay = (e) => e.t >= t0 && e.t < t0 + 1440;
  const pms = data.ex.filter((e) => e.type === 'PM' && inDay(e));
  const bms = data.ex.filter((e) => e.type === 'BM' && inDay(e));
  const highs = pms.length
    ? pms.map((e) => ({ c: nearestCoef(data.coefList, e.t)?.c ?? null, t: e.t, v: e.v, brest: false }))
    : (data.coefs[day] || []).map((x) => ({ c: x.c, t: x.t, v: null, brest: true }));
  const range = pms.length && bms.length ? Math.max(...pms.map((e) => e.v)) - Math.min(...bms.map((e) => e.v)) : null;
  return { highs, lows: bms, range };
}
