<script>
  import { tm, hhmm, r1 } from '../lib/format.js';

  let { data, day, nowT } = $props();

  const W = 360;
  const H = 210;
  const PL = 30;
  const PR = 10;
  const PT = 30;
  const PB = 24;

  const t0 = $derived(tm(day + 'T00:00'));
  const t1 = $derived(t0 + 1440);
  const S = $derived(data.tide);

  const range = $derived.by(() => {
    const v = S.V.filter((x) => x != null);
    return { lo: Math.min(...v), hi: Math.max(...v) };
  });

  const x = (t) => PL + ((t - t0) / 1440) * (W - PL - PR);
  const y = (v) => PT + ((range.hi - v) / (range.hi - range.lo || 1)) * (H - PT - PB);

  const pts = $derived.by(() => {
    const out = [];
    for (let i = 0; i < S.T.length; i++) {
      if (S.T[i] < t0 - 15 || S.T[i] > t1 + 15 || S.V[i] == null) continue;
      out.push([x(Math.max(t0, Math.min(t1, S.T[i]))), y(S.V[i])]);
    }
    return out;
  });

  const line = $derived(pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(''));
  const area = $derived(pts.length ? `${line}L${pts.at(-1)[0].toFixed(1)} ${H - PB}L${pts[0][0].toFixed(1)} ${H - PB}Z` : '');
  const sun = $derived(data.sun[day]);
  const marks = $derived(data.ex.filter((e) => e.t >= t0 && e.t < t1));
  const ticks = [0, 3, 6, 9, 12, 15, 18, 21, 24];
  const labelX = (X) => Math.min(W - PR - 26, Math.max(PL + 26, X));
</script>

<svg class="curve" viewBox="0 0 {W} {H}" role="img" aria-label="Courbe de marée du jour">
  {#if sun}
    <rect class="night" x={x(t0)} y={PT - 8} width={Math.max(0, x(sun[0]) - x(t0))} height={H - PB - PT + 8} />
    <rect class="night" x={x(sun[1])} y={PT - 8} width={Math.max(0, x(t1) - x(sun[1]))} height={H - PB - PT + 8} />
  {/if}
  {#each ticks as h (h)}
    <line class="grid" x1={x(t0 + h * 60)} x2={x(t0 + h * 60)} y1={PT - 8} y2={H - PB} />
    <text class="ax" x={x(t0 + h * 60)} y={H - 7} text-anchor="middle">{h}h</text>
  {/each}
  <line class="grid zero" x1={PL} x2={W - PR} y1={y(0)} y2={y(0)} />
  <text class="ax" x={PL - 4} y={y(range.hi) + 4} text-anchor="end">{r1(range.hi)}</text>
  <text class="ax" x={PL - 4} y={y(0) + 4} text-anchor="end">0</text>
  <text class="ax" x={PL - 4} y={y(range.lo) + 4} text-anchor="end">{r1(range.lo)}</text>
  <path class="area" d={area} />
  <path class="line" d={line} />
  {#if nowT >= t0 && nowT < t1}
    <line class="now" x1={x(nowT)} x2={x(nowT)} y1={PT - 8} y2={H - PB} />
  {/if}
  {#each marks as e (e.t)}
    {@const X = x(e.t)}
    {@const Y = y(e.v)}
    <circle class="pt" cx={X} cy={Y} r="4" />
    <text class="lbl" x={labelX(X)} y={e.type === 'PM' ? Y - 9 : Math.min(Y + 18, H - PB - 4)} text-anchor="middle">
      {e.type} {hhmm(e.t)}
    </text>
  {/each}
</svg>

<style>
  .curve {
    width: 100%;
    height: auto;
    display: block;
  }

  .night {
    fill: var(--ink);
    opacity: 0.06;
  }

  .grid {
    stroke: var(--line);
  }

  .zero {
    stroke-dasharray: 3 4;
  }

  .ax {
    fill: var(--muted);
    font: 500 11px var(--cond);
  }

  .area {
    fill: var(--accent);
    opacity: 0.14;
  }

  .line {
    fill: none;
    stroke: var(--accent);
    stroke-width: 2.2;
  }

  .now {
    stroke: var(--gm);
    stroke-width: 2;
  }

  .pt {
    fill: var(--card);
    stroke: var(--accent);
    stroke-width: 2;
  }

  .lbl {
    fill: var(--ink);
    font: 700 13px var(--cond);
  }
</style>
