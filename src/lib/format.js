export const DIRS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'];

export const tm = (s) => Date.parse(s.slice(0, 16) + ':00Z') / 60000;
export const ts = (m) => new Date(m * 60000).toISOString().slice(0, 16);
export const hhmm = (m) => ts(m).slice(11, 16).replace(':', 'h');
export const sector = (d) => Math.round((((d % 360) + 360) % 360) / 22.5) % 16;
export const dirName = (d) => (d == null ? '' : DIRS[sector(d)]);

export const r0 = (v) => (v == null ? '–' : String(Math.round(v)));
export const r1 = (v) => (v == null ? '–' : (Math.round(v * 10) / 10).toFixed(1));
export const signed = (v) => (v == null ? '–' : (v > 0 ? '+' : v < 0 ? '−' : '') + r1(Math.abs(v)));

const noon = (d) => new Date(d + 'T12:00:00Z');
export const dayName = (d) =>
  noon(d).toLocaleDateString('fr-FR', { weekday: 'short', timeZone: 'UTC' }).replace('.', '');
export const dayShort = (d) => `${dayName(d)} ${+d.slice(8)}`;
export const dayLong = (d) =>
  noon(d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });

const WSTOPS = [
  [0, [232, 241, 246]], [6, [190, 224, 240]], [10, [134, 212, 196]], [14, [150, 214, 105]],
  [18, [236, 217, 76]], [22, [243, 168, 62]], [27, [232, 96, 58]], [33, [196, 58, 120]], [42, [122, 63, 160]],
];

/** @returns {[string, string]} background and text colour for a wind speed in knots */
export function wcolor(v) {
  if (v == null) return ['transparent', 'inherit'];
  let i = 0;
  while (i < WSTOPS.length - 2 && v > WSTOPS[i + 1][0]) i++;
  const [a, ca] = WSTOPS[i];
  const [b, cb] = WSTOPS[i + 1];
  const t = Math.max(0, Math.min(1, (v - a) / (b - a)));
  const c = ca.map((x, j) => Math.round(x + (cb[j] - x) * t));
  return [`rgb(${c})`, v >= 27 ? '#fff' : '#10222c'];
}
