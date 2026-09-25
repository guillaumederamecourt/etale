<script>
  import TideCard from './TideCard.svelte';
  import HourList from './HourList.svelte';
  import { daySummary, windowLabel, SPORTS } from '../lib/forecast.js';
  import { dayLong, dayShort } from '../lib/format.js';

  let { spot, data, hours, sport, day, onback, onday } = $props();

  const SWIPE_MIN = 60;

  const summary = $derived(daySummary(hours, day));
  const idx = $derived(data.days.indexOf(day));
  const prev = $derived(data.days[idx - 1] ?? null);
  const next = $derived(data.days[idx + 1] ?? null);

  let touch = null;

  function touchStart(e) {
    touch = e.touches.length === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null;
  }

  function touchEnd(e) {
    if (!touch) return;
    const dx = e.changedTouches[0].clientX - touch.x;
    const dy = e.changedTouches[0].clientY - touch.y;
    touch = null;
    if (Math.abs(dx) < SWIPE_MIN || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    const target = dx < 0 ? next : prev;
    if (target) onday(target);
  }
</script>

<div class="detail" ontouchstart={touchStart} ontouchend={touchEnd} ontouchcancel={() => (touch = null)}>
  <div class="bar">
    <button class="btn ghost back" type="button" onclick={onback}>
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="m15 5-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
      7 jours
    </button>
  </div>

  <header class="head">
    <button class="icon-btn" type="button" disabled={!prev} aria-label={prev ? `Jour précédent, ${dayShort(prev)}` : 'Jour précédent'} onclick={() => onday(prev)}>
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="m15 5-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
    </button>
    {#key day}
      <div class="title">
        <h2>{dayLong(day)}</h2>
        <div class="small muted">
          {spot.name} ·
          {#if summary.window}
            créneau {SPORTS[sport].toLowerCase()} <b class="ok">{windowLabel(summary.window)}</b>
          {:else}
            pas de créneau {SPORTS[sport].toLowerCase()}
          {/if}
        </div>
      </div>
    {/key}
    <button class="icon-btn" type="button" disabled={!next} aria-label={next ? `Jour suivant, ${dayShort(next)}` : 'Jour suivant'} onclick={() => onday(next)}>
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="m9 5 7 7-7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
    </button>
  </header>

  <TideCard {spot} {data} {day} />
  <HourList hours={summary.hs} />
</div>

<style>
  .detail {
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
    animation: fade 0.18s ease-out;
  }

  h2 {
    font-size: 26px;
  }

  h2::first-letter {
    text-transform: uppercase;
  }

  .ok {
    color: var(--ok);
  }

  @keyframes fade {
    from {
      opacity: 0.2;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .title {
      animation: none;
    }
  }
</style>
