<script>
  import TideCurve from './TideCurve.svelte';
  import TideCard from './TideCard.svelte';
  import { nowMinutes } from '../lib/forecast.js';
  import { dayLong, dayShort, hhmm, signed } from '../lib/format.js';
  import { swipe } from '../lib/swipe.js';

  let { spot, data, day, now, onback, onday } = $props();

  const idx = $derived(data.days.indexOf(day));
  const prev = $derived(data.days[idx - 1] ?? null);
  const next = $derived(data.days[idx + 1] ?? null);
  const nowT = $derived(nowMinutes(data, now));
  const upcoming = $derived(data.ex.find((e) => e.t > nowT) ?? null);
  const isToday = $derived(idx === 0);
</script>

<div class="tide-view" use:swipe={{ onnext: () => next && onday(next), onprev: () => prev && onday(prev) }}>
  <div class="bar">
    <button class="btn ghost back" type="button" onclick={onback}>
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="m15 5-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
      Retour
    </button>
  </div>

  <header class="head">
    <button class="icon-btn" type="button" disabled={!prev} aria-label={prev ? `Jour précédent, ${dayShort(prev)}` : 'Jour précédent'} onclick={() => onday(prev)}>
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="m15 5-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
    </button>
    <div class="title">
      <div class="label">Marée · {spot.name}</div>
      <h2>{dayLong(day)}</h2>
    </div>
    <button class="icon-btn" type="button" disabled={!next} aria-label={next ? `Jour suivant, ${dayShort(next)}` : 'Jour suivant'} onclick={() => onday(next)}>
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="m9 5 7 7-7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
    </button>
  </header>

  {#if data.tide}
    <section class="card curve-card">
      {#if isToday && upcoming}
        <div class="small">
          Marée <b>{upcoming.type === 'PM' ? 'montante' : 'descendante'}</b> · {upcoming.type === 'PM' ? 'pleine mer' : 'basse mer'} à
          <b>{hhmm(upcoming.t)}</b> ({signed(upcoming.v)} m)
        </div>
      {/if}
      <TideCurve {data} {day} {nowT} />
      <div class="legend small muted">
        <span><i class="sw now"></i>maintenant</span>
        <span><i class="sw night"></i>nuit</span>
        <span>hauteurs en m / niveau moyen</span>
      </div>
    </section>
  {:else}
    <div class="msg">Pas de données de niveau d'eau pour ce spot. Déplace légèrement ses coordonnées vers la mer.</div>
  {/if}

  <TideCard {spot} {data} {day} />
</div>

<style>
  .tide-view {
    display: grid;
    gap: 14px;
    touch-action: pan-y;
  }

  .bar {
    margin: -6px 0 -10px -12px;
  }

  .back {
    padding: 0 12px;
    color: var(--accent);
  }

  .head {
    display: grid;
    grid-template-columns: 44px 1fr 44px;
    align-items: center;
    margin-inline: -8px;
  }

  .head .icon-btn {
    color: var(--accent);
  }

  .head .icon-btn:disabled {
    color: var(--line);
  }

  .title {
    display: grid;
    gap: 2px;
    text-align: center;
  }

  h2 {
    font-size: 26px;
  }

  h2::first-letter {
    text-transform: uppercase;
  }

  .curve-card {
    display: grid;
    gap: 8px;
    padding: 12px 10px 10px;
  }

  .curve-card > .small {
    padding-inline: 4px;
  }

  .legend {
    display: flex;
    gap: 4px 12px;
    flex-wrap: wrap;
    padding-inline: 4px;
  }

  .sw {
    display: inline-block;
    width: 12px;
    height: 10px;
    border-radius: 2px;
    margin-right: 4px;
    vertical-align: middle;
  }

  .sw.now {
    width: 3px;
    background: var(--gm);
  }

  .sw.night {
    background: var(--ink);
    opacity: 0.12;
  }
</style>
