<script>
  import Arrow from './Arrow.svelte';
  import WeatherIcon from './WeatherIcon.svelte';
  import { weather } from '../lib/weather.js';
  import { nowKey, nowMinutes, dayHours, bestWindow, windowLabel, agreeCls, agreeLabel, weekPeak, SPORTS } from '../lib/forecast.js';
  import { coefClass, coefLabel } from '../lib/tide.js';
  import { wcolor, r0, r1, hhmm, dirName, dayShort, signed } from '../lib/format.js';

  let { spot, data, hours, sport, now, onedit } = $props();

  const n = $derived(hours.find((o) => o.key === nowKey(data, now)) || hours[0]);
  const today = $derived(n.day);
  const coefs = $derived(data.coefs[today] || []);
  const peak = $derived(weekPeak(data));
  const win = $derived(bestWindow(dayHours(hours, today)));
  const tideNext = $derived(data.ex.find((e) => e.t > nowMinutes(data, now)) || null);
  const rising = $derived(tideNext ? tideNext.type === 'PM' : null);
  const colors = $derived(wcolor(n.w));
  const ag = $derived(agreeCls(n.spread));
</script>

<section class="card now" aria-label="Maintenant">
  <div class="head">
    <div>
      <div class="label">Maintenant · {hhmm(n.t)}</div>
      <h2>{spot.name}</h2>
    </div>
    <div class="sky">
      <div class="temp">
        <WeatherIcon code={n.code} isDay={n.isDay} size={34} />
        {r0(n.temp)}°
      </div>
      {#if n.code != null}<div class="small muted">{weather(n.code).label}</div>{/if}
    </div>
    <button class="icon-btn gear" type="button" aria-label="Réglages du spot" onclick={onedit}>
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <path d="M4 7h10M18 7h2M4 17h4M12 17h8M16 5v4M10 15v4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
    </button>
  </div>

  <div class="wind" style:background={colors[0]} style:color={colors[1]}>
    <div class="speed">
      <span class="v">{r0(n.w)}</span><span class="u">nd</span>
    </div>
    <div class="dir">
      <Arrow deg={n.d} size={34} />
      <span>{dirName(n.d)}</span>
    </div>
    <div class="meta">
      <div>Rafales <b>{r0(n.g)} nd</b></div>
      {#if n.spread != null}
        <div class="pill"><span class="agree {ag}"></span>Accord {agreeLabel(n.spread)} · {n.n} modèles</div>
      {/if}
    </div>
  </div>

  <div class="grid">
    <div class="cell">
      <div class="label">Coefficient</div>
      <div class="coefs">
        {#each coefs as x (x.t)}
          <span class="big-coef {coefClass(x.c)}">{x.c}</span>
        {:else}
          <span class="muted">–</span>
        {/each}
      </div>
      <div class="small muted">
        {#if coefs.length}{coefLabel(Math.max(...coefs.map((x) => x.c)))}{/if}
        {#if peak}<br />Pic {peak.c} · {dayShort(peak.day)}{/if}
      </div>
    </div>

    <div class="cell">
      <div class="label">Vagues</div>
      <div class="val">{r1(n.wave)}<small>m</small> {#if n.per != null}<small>{r0(n.per)} s</small>{/if}</div>
      <div class="small muted row tight">
        Houle {r1(n.swell)} m · {r0(n.sper)} s <Arrow deg={n.sdir} size={13} />{dirName(n.sdir)}
      </div>
    </div>

    <div class="cell">
      <div class="label">Marée</div>
      {#if tideNext}
        <div class="val">{rising ? 'Montante' : 'Descendante'}</div>
        <div class="small muted">
          {tideNext.type === 'PM' ? 'Pleine mer' : 'Basse mer'} à <b class="ink">{hhmm(tideNext.t)}</b> · {signed(tideNext.v)} m
        </div>
      {:else}
        <div class="val muted">–</div>
        <div class="small muted">Données indisponibles</div>
      {/if}
    </div>

    <div class="cell" class:ok={win}>
      <div class="label">Créneau {SPORTS[sport].toLowerCase()}</div>
      <div class="val">{windowLabel(win) ?? 'Aucun'}</div>
      <div class="small muted">aujourd'hui, selon tes réglages</div>
    </div>
  </div>
</section>

<style>
  .now {
    display: grid;
    gap: 14px;
  }

  .head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 8px;
    margin: -4px -8px 0 0;
  }

  .head > div:first-child {
    flex: 1;
    min-width: 0;
  }

  h2 {
    font-size: 26px;
    overflow-wrap: anywhere;
  }

  .sky {
    display: grid;
    justify-items: end;
    text-align: right;
    padding-top: 2px;
  }

  .temp {
    display: flex;
    align-items: center;
    gap: 6px;
    font: 700 26px/1 var(--cond);
    font-variant-numeric: tabular-nums;
  }

  .gear {
    margin-top: -4px;
  }

  .wind {
    border-radius: 12px;
    padding: 12px 14px;
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-areas: 'speed dir' 'meta meta';
    gap: 6px 14px;
    align-items: center;
  }

  .speed {
    grid-area: speed;
    display: flex;
    align-items: baseline;
    gap: 4px;
    font-family: var(--cond);
    font-weight: 700;
  }

  .speed .v {
    font-size: 72px;
    line-height: 0.9;
    font-variant-numeric: tabular-nums;
  }

  .speed .u {
    font-size: 22px;
  }

  .dir {
    grid-area: dir;
    display: flex;
    align-items: center;
    gap: 8px;
    font: 700 28px/1 var(--cond);
  }

  .meta {
    grid-area: meta;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    font-size: 15px;
  }

  .pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(255, 255, 255, 0.72);
    color: #10222c;
    border-radius: 999px;
    padding: 3px 10px 3px 8px;
    font-size: 13px;
    font-weight: 600;
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .cell {
    background: var(--card2);
    border: 1px solid var(--line);
    border-radius: 12px;
    padding: 10px 12px;
    display: grid;
    gap: 4px;
    align-content: start;
    min-width: 0;
  }

  .cell.ok {
    background: var(--ok-soft);
    border-color: transparent;
  }

  .cell.ok .val {
    color: var(--ok-ink);
  }

  .val {
    font: 700 26px/1.05 var(--cond);
    font-variant-numeric: tabular-nums;
  }

  .val small {
    font-size: 16px;
    color: var(--muted);
    margin-left: 2px;
  }

  .coefs {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }

  .big-coef {
    font: 700 38px/1 var(--cond);
    font-variant-numeric: tabular-nums;
  }

  .big-coef.gm {
    background: var(--gm);
    color: var(--gm-ink);
    border-radius: 8px;
    padding: 0 6px;
  }

  .big-coef.ve {
    color: var(--accent);
  }

  .big-coef.me {
    color: var(--muted);
  }

  .tight {
    gap: 4px;
  }

  .ink {
    color: var(--ink);
  }
</style>
