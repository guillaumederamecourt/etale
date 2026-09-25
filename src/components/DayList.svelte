<script>
  import Arrow from './Arrow.svelte';
  import ScoreBars from './ScoreBars.svelte';
  import { daySummary, windowLabel } from '../lib/forecast.js';
  import { coefClass } from '../lib/tide.js';
  import { dayShort, r0, r1, wcolor, dirName } from '../lib/format.js';

  let { data, hours, sport, onopen } = $props();

  const days = $derived(data.days.map((d) => ({ d, ...daySummary(hours, d), coefs: data.coefs[d] || [] })));
</script>

<section aria-labelledby="days-title">
  <h3 id="days-title">7 jours</h3>
  <ul>
    {#each days as x (x.d)}
      {@const wc = wcolor(x.maxWind?.w)}
      <li>
        <button type="button" onclick={() => onopen(x.d)}>
          <div class="l1">
            <b class="day">{dayShort(x.d)}</b>
            <span class="coefs">
              {#each x.coefs as c (c.t)}<span class="coef {coefClass(c.c)}">{c.c}</span>{/each}
            </span>
            <svg class="chev" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="m9 5 7 7-7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
          </div>
          <ScoreBars hours={x.hs} />
          <div class="l3">
            {#if sport === 'surf'}
              <span class="stat">{x.maxWave ? `${r1(x.maxWave.wave)} m · ${r0(x.maxWave.per)} s` : '–'}</span>
            {:else if x.maxWind}
              <span class="stat">
                <span class="wchip" style:background={wc[0]} style:color={wc[1]}>{r0(x.maxWind.w)}</span> nd max
                <Arrow deg={x.maxWind.d} size={14} />{dirName(x.maxWind.d)}
              </span>
            {:else}
              <span class="stat">–</span>
            {/if}
            {#if x.window}
              <span class="win">{windowLabel(x.window)}</span>
            {:else}
              <span class="nowin">Pas de créneau</span>
            {/if}
          </div>
        </button>
      </li>
    {/each}
  </ul>
  <div class="legend small muted">
    <span class="sw s1"></span>1 <span class="sw s2"></span>2 <span class="sw s3"></span>3 · note par heure, 6h → 22h
  </div>
</section>

<style>
  section {
    display: grid;
    gap: 8px;
  }

  h3 {
    font-size: 20px;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 8px;
  }

  li button {
    width: 100%;
    text-align: left;
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: var(--radius);
    padding: 10px 12px 12px;
    display: grid;
    gap: 8px;
  }

  .l1 {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 26px;
  }

  .day {
    font: 700 20px/1 var(--cond);
    text-transform: capitalize;
    min-width: 64px;
  }

  .coefs {
    display: flex;
    gap: 4px;
    flex: 1;
  }

  .coefs .coef {
    font-size: 17px;
  }

  .chev {
    color: var(--muted);
    flex: none;
  }

  .l3 {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .stat {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font: 600 16px/1.2 var(--cond);
  }

  .wchip {
    border-radius: 5px;
    padding: 0 6px;
    font-weight: 700;
    font-size: 17px;
    font-variant-numeric: tabular-nums;
  }

  .win {
    background: var(--ok-soft);
    color: var(--ok-ink);
    border-radius: 999px;
    padding: 2px 10px;
    font: 700 15px/1.3 var(--cond);
  }

  .nowin {
    font-size: 13px;
    color: var(--muted);
  }

  .legend {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .sw {
    width: 14px;
    height: 8px;
    border-radius: 2px;
    display: inline-block;
    margin-left: 4px;
  }

  .sw.s1 {
    background: var(--s1);
  }

  .sw.s2 {
    background: var(--s2);
  }

  .sw.s3 {
    background: var(--s3);
  }
</style>
