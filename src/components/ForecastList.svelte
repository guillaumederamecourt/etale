<script>
  import HourRow from './HourRow.svelte';
  import HourColumns from './HourColumns.svelte';
  import ScoreLegend from './ScoreLegend.svelte';
  import { stepHours, dayHours, bestWindow, windowLabel, tideNear } from '../lib/forecast.js';
  import { coefClass } from '../lib/tide.js';
  import { dayShort } from '../lib/format.js';

  let { data, hours, sport, nowHour, onopen } = $props();

  const days = $derived(
    data.days.map((d, i) => ({
      d,
      coefs: data.coefs[d] || [],
      window: bestWindow(dayHours(hours, d)),
      rows: stepHours(hours, d, i === 0 ? nowHour - 2 : 0),
    })),
  );
</script>

<section class="list" aria-labelledby="fc-title">
  <h3 id="fc-title">Prévisions</h3>
  <HourColumns />
  {#each days as x (x.d)}
    <section class="card day" aria-label={dayShort(x.d)}>
      <button class="head" type="button" onclick={() => onopen(x.d)}>
        <b>{dayShort(x.d)}</b>
        <span class="coefs">
          {#each x.coefs as c (c.t)}<span class="coef {coefClass(c.c)}">{c.c}</span>{/each}
        </span>
        {#if x.window}
          <span class="win">{windowLabel(x.window)}</span>
        {:else}
          <span class="nowin">Pas de créneau</span>
        {/if}
        <svg class="chev" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="m9 5 7 7-7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
      </button>
      {#each x.rows as o (o.key)}
        <HourRow {o} {sport} tide={tideNear(data.ex, o.t, 90)} onclick={() => onopen(x.d, o.hour)} />
      {/each}
    </section>
  {/each}
  <ScoreLegend />
</section>

<style>
  .list {
    display: grid;
    gap: 8px;
  }

  h3 {
    font-size: 20px;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .day {
    padding: 0;
    overflow: hidden;
  }

  .head {
    width: 100%;
    min-height: 46px;
    border: 0;
    border-bottom: 1px solid var(--line);
    background: var(--card2);
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    text-align: left;
  }

  .head b {
    font: 700 19px/1 var(--cond);
    min-width: 60px;
    text-transform: capitalize;
  }

  .coefs {
    display: flex;
    gap: 4px;
    flex: 1;
  }

  .coefs .coef {
    font-size: 15px;
  }

  .win {
    background: var(--ok-soft);
    color: var(--ok-ink);
    border-radius: 999px;
    padding: 1px 9px;
    font: 700 14px/1.3 var(--cond);
  }

  .nowin {
    font-size: 12px;
    color: var(--muted);
  }

  .chev {
    color: var(--muted);
    flex: none;
  }
</style>
