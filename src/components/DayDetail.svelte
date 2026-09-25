<script>
  import TideCard from './TideCard.svelte';
  import HourList from './HourList.svelte';
  import { daySummary, windowLabel, SPORTS } from '../lib/forecast.js';
  import { dayLong } from '../lib/format.js';

  let { spot, data, hours, sport, day, onback } = $props();

  const summary = $derived(daySummary(hours, day));
  const idx = $derived(data.days.indexOf(day));
</script>

<div class="bar">
  <button class="btn ghost back" type="button" onclick={onback}>
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="m15 5-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
    7 jours
  </button>
</div>

<header class="head">
  <h2>{dayLong(day)}</h2>
  <div class="small muted">
    {spot.name} ·
    {#if summary.window}
      créneau {SPORTS[sport].toLowerCase()} <b class="ok">{windowLabel(summary.window)}</b>
    {:else}
      pas de créneau {SPORTS[sport].toLowerCase()}
    {/if}
  </div>
</header>

<TideCard {spot} {data} {day} />
<HourList hours={summary.hs} />

<style>
  .bar {
    margin: -6px 0 -10px -12px;
  }

  .back {
    padding: 0 12px;
    color: var(--accent);
  }

  .head {
    display: grid;
    gap: 2px;
  }

  h2 {
    font-size: 28px;
  }

  h2::first-letter {
    text-transform: uppercase;
  }

  .ok {
    color: var(--ok);
  }
</style>
