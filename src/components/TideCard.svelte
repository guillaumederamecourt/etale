<script>
  import { dayHighTides, dayMaxCoef, weekPeak } from '../lib/forecast.js';
  import { coefClass, coefLabel } from '../lib/tide.js';
  import { hhmm, signed, r1, dayName } from '../lib/format.js';

  let { spot, data, day } = $props();

  const G0 = 20;
  const G1 = 120;
  const pct = (c) => ((Math.max(G0, Math.min(G1, c)) - G0) / (G1 - G0)) * 100;

  const tides = $derived(dayHighTides(data, day));
  const coefs = $derived(tides.highs.map((h) => h.c).filter((c) => c != null));
  const peak = $derived(weekPeak(data));
  const week = $derived(data.days.map((d) => ({ d, c: dayMaxCoef(data, d) })));
</script>

<section class="card tide" aria-labelledby="tide-title">
  <h3 id="tide-title">Marée et coefficient</h3>

  {#if tides.highs.length}
    <div class="highs">
      {#each tides.highs as h (h.t)}
        <div class="high">
          <span class="c {h.c != null ? coefClass(h.c) : ''}">{h.c ?? '–'}</span>
          <div>
            <div class="label">Pleine mer{h.brest ? ' (Brest)' : ''}</div>
            <div class="when">{hhmm(h.t)}</div>
            {#if h.v != null}<div class="small muted">{signed(h.v)} m</div>{/if}
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <div class="msg">Pas de données de marée pour ce jour.</div>
  {/if}

  {#if coefs.length}
    <div class="gauge-wrap">
      <div class="gauge" role="img" aria-label="Coefficient {Math.max(...coefs)}, {coefLabel(Math.max(...coefs))}">
        <i class="z me" style:width="{pct(45)}%"></i>
        <i class="z mo" style:width="{pct(70) - pct(45)}%"></i>
        <i class="z ve" style:width="{pct(95) - pct(70)}%"></i>
        <i class="z gm" style:width="{100 - pct(95)}%"></i>
        {#each coefs as c, i (i)}
          <span class="mark" style:left="{pct(c)}%"></span>
        {/each}
      </div>
      <div class="scale small muted">
        <span>morte-eau</span><span>vive-eau</span><span>grande marée</span>
      </div>
      <div class="small"><b>{coefLabel(Math.max(...coefs))}</b></div>
    </div>
  {/if}

  <dl class="facts">
    {#if tides.lows.length}
      <div>
        <dt class="label">Basse mer</dt>
        <dd>
          {#each tides.lows as l, i (l.t)}{i ? ' · ' : ''}<b>{hhmm(l.t)}</b> <span class="muted">{signed(l.v)} m</span>{/each}
        </dd>
      </div>
    {/if}
    {#if tides.range != null}
      <div>
        <dt class="label">Marnage</dt>
        <dd><b>≈ {r1(tides.range)} m</b></dd>
      </div>
    {/if}
  </dl>

  <div class="week">
    <div class="label">Coefficients de la semaine</div>
    <div class="wk">
      {#each week as w (w.d)}
        <div class="wd" class:sel={w.d === day} class:peak={peak && w.d === peak.day}>
          <span class="dn">{dayName(w.d)}</span>
          <span class="coef {w.c != null ? coefClass(w.c) : ''}">{w.c ?? '–'}</span>
        </div>
      {/each}
    </div>
    {#if peak}<div class="small muted">Pic de la semaine : <b class="ink">{peak.c}</b> le {dayName(peak.day)} {+peak.day.slice(8)}</div>{/if}
  </div>

  <p class="note small muted">
    Hauteurs par rapport au niveau moyen{#if data.marineAt}{' · '}point modèle {data.marineAt.map((v) => v.toFixed(2)).join(', ')}{/if}{#if +spot.tideCorr}{' · '}correction horaire {spot.tideCorr > 0 ? '+' : ''}{spot.tideCorr} min{/if}.
    Coefficient calculé à Brest.
  </p>
</section>

<style>
  .tide {
    display: grid;
    gap: 14px;
  }

  h3 {
    font-size: 20px;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .highs {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 10px;
  }

  .high {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .c {
    font: 700 52px/1 var(--cond);
    font-variant-numeric: tabular-nums;
    min-width: 64px;
    text-align: center;
    border-radius: 10px;
    padding: 2px 6px;
  }

  .c.gm {
    background: var(--gm);
    color: var(--gm-ink);
  }

  .c.ve {
    color: var(--accent);
  }

  .c.me {
    color: var(--muted);
  }

  .when {
    font: 700 22px/1.1 var(--cond);
  }

  .gauge-wrap {
    display: grid;
    gap: 4px;
  }

  .gauge {
    position: relative;
    display: flex;
    height: 12px;
    border-radius: 6px;
    overflow: visible;
  }

  .z {
    height: 100%;
  }

  .z.me {
    background: var(--line);
    border-radius: 6px 0 0 6px;
  }

  .z.mo {
    background: var(--s1);
  }

  .z.ve {
    background: var(--accent);
    opacity: 0.55;
  }

  .z.gm {
    background: var(--gm);
    border-radius: 0 6px 6px 0;
  }

  .mark {
    position: absolute;
    top: -4px;
    width: 4px;
    height: 20px;
    margin-left: -2px;
    background: var(--ink);
    border-radius: 2px;
    box-shadow: 0 0 0 2px var(--card);
  }

  .scale {
    display: flex;
    justify-content: space-between;
  }

  .facts {
    margin: 0;
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 10px;
  }

  .facts dd {
    margin: 2px 0 0;
  }

  .week {
    display: grid;
    gap: 6px;
  }

  .wk {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
  }

  .wd {
    display: grid;
    justify-items: center;
    gap: 3px;
    padding: 5px 0;
    border-radius: 8px;
    border: 1px solid transparent;
  }

  .wd.sel {
    background: var(--accent-soft);
  }

  .wd.peak {
    border-color: var(--gm);
  }

  .dn {
    font-size: 12px;
    color: var(--muted);
    text-transform: capitalize;
  }

  .wd .coef {
    min-width: 0;
    padding: 1px 4px;
  }

  .ink {
    color: var(--ink);
  }

  .note {
    margin: 0;
  }
</style>
