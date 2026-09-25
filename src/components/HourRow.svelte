<script>
  import Arrow from './Arrow.svelte';
  import WeatherIcon from './WeatherIcon.svelte';
  import { agreeCls } from '../lib/forecast.js';
  import { wcolor, r0, r1, dirName, hhmm, signed } from '../lib/format.js';

  let { o, sport, tide = null, onclick = null, id = undefined, children = undefined } = $props();

  const wc = $derived(wcolor(o.w));
  const gc = $derived(wcolor(o.g));
</script>

{#snippet line()}
  <span class="h">{o.hour}h</span>
  <WeatherIcon code={o.code} isDay={o.isDay} />
  <span class="t">{r0(o.temp)}°</span>
  <span class="wind">
    <span class="wv" style:background={wc[0]} style:color={wc[1]}>{r0(o.w)}</span>
    <span class="wg" style:background={gc[0]} style:color={gc[1]}>{r0(o.g)}</span>
  </span>
  {#if tide}
    {@const high = tide.type === 'PM'}
    <span class="dir tide" class:high title="{high ? 'Pleine mer' : 'Basse mer'} à {hhmm(tide.t)}, {signed(tide.v)} m">
      <svg viewBox="0 0 24 24" width="18" height="18" role="img" aria-label={high ? 'Pleine mer' : 'Basse mer'}>
        <path d="M2 19c2.5-2 5-2 7.5 0s5 2 7.5 0 3.5-1.6 5-1" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        <path d={high ? 'M12 14V3M8 7l4-4 4 4' : 'M12 3v11M8 10l4 4 4-4'} fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <span class="dn">{hhmm(tide.t)}</span>
    </span>
  {:else}
    <span class="dir">
      <Arrow deg={o.d} size={15} />
      <span class="dn">{dirName(o.d)}</span>
      <span class="agree {agreeCls(o.spread)}" title="Écart entre modèles {r0(o.spread)} nd"></span>
    </span>
  {/if}
  <span class="wave">{r1(o.wave)}<small> m</small> <span class="muted">{r0(o.per)}<small> s</small></span></span>
{/snippet}

<div class="hour s{o.score}" class:night={!o.daylight} class:surf={sport === 'surf'} {id}>
  {#if onclick}
    <button class="line" type="button" aria-label="{o.hour}h, note {o.score} sur 3, voir le détail du jour" {onclick}>{@render line()}</button>
  {:else}
    <div class="line" title="Note {o.score}/3">{@render line()}</div>
  {/if}
  {@render children?.()}
</div>

<style>
  .hour {
    position: relative;
    border-bottom: 1px solid var(--line);
    scroll-margin-block: 80px;
  }

  .hour:last-child {
    border-bottom: 0;
  }

  .hour::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 5px;
  }

  .hour.s1::before {
    background: var(--s1);
  }

  .hour.s2::before {
    background: var(--s2);
  }

  .hour.s3::before {
    background: var(--s3);
  }

  .hour.night {
    background: var(--card2);
  }

  .hour.night .line {
    opacity: 0.55;
  }

  .line {
    width: 100%;
    display: grid;
    grid-template-columns: 32px 24px 30px 72px 1fr 60px;
    gap: 6px;
    align-items: center;
    min-height: 44px;
    padding: 6px 12px 6px 16px;
    border: 0;
    background: transparent;
    text-align: left;
  }

  .h {
    font: 700 17px/1 var(--cond);
    font-variant-numeric: tabular-nums;
  }

  .t {
    font: 600 16px/1 var(--cond);
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  .wind {
    display: flex;
    gap: 3px;
  }

  .wv,
  .wg {
    min-width: 33px;
    text-align: center;
    border-radius: 6px;
    font: 700 16px/1.55 var(--cond);
    font-variant-numeric: tabular-nums;
  }

  .wg {
    font-size: 13.5px;
    font-weight: 600;
  }

  .dir {
    display: flex;
    align-items: center;
    gap: 4px;
    min-width: 0;
  }

  .tide {
    color: var(--muted);
    gap: 3px;
  }

  .tide.high {
    color: var(--accent);
  }

  .tide .dn {
    color: var(--ink);
    font-weight: 700;
  }

  .dn {
    font: 600 15px/1 var(--cond);
  }

  .wave {
    font: 600 15px/1 var(--cond);
    text-align: right;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }

  .wave small {
    font-size: 11px;
  }

  .surf .wave {
    font-weight: 700;
    font-size: 16.5px;
  }

  .surf .wind {
    opacity: 0.8;
  }
</style>
