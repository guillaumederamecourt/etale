<script>
  import { tick } from 'svelte';
  import SportPicker from './SportPicker.svelte';
  import NowCard from './NowCard.svelte';
  import ForecastList from './ForecastList.svelte';
  import DayDetail from './DayDetail.svelte';
  import { store, currentSpot, selectSpot, sportFor, setSport } from '../lib/spots.svelte.js';
  import { forecasts, ensureForecast, keyOf } from '../lib/forecasts.svelte.js';
  import { scoreHours, sportConfig, nowKey, SPORTS, TIDEPREF } from '../lib/forecast.js';
  import { DIRS } from '../lib/format.js';

  let { onadd, onedit } = $props();

  let detailDay = $state(null);
  let listScroll = 0;

  const spot = $derived(currentSpot());
  const sport = $derived(sportFor(spot));
  const entry = $derived(spot ? forecasts.get(spot.id) : null);
  const data = $derived(entry?.data ?? null);
  const hours = $derived(data && spot ? scoreHours(data, spot, sport) : null);
  const cfg = $derived(spot ? sportConfig(spot, sport) : null);

  const subtitle = $derived.by(() => {
    if (!cfg) return '';
    const range = sport === 'surf' ? `vagues ≥ ${cfg.waveMin} m · ${cfg.periodMin} s` : `${cfg.wmin}–${cfg.wmax} nd`;
    const secs = cfg.sectors?.length ? cfg.sectors.map((i) => DIRS[i]).join(' ') : 'toutes directions';
    return [SPORTS[sport], range, (sport === 'surf' ? 'offshore ' : '') + secs, TIDEPREF[cfg.tidePref]].join(' · ');
  });

  const nowHour = $derived(data ? +nowKey(data, forecasts.now).slice(11, 13) : 0);

  async function openDay(day, hour = null) {
    listScroll = window.scrollY;
    detailDay = day;
    await tick();
    const row = hour != null && document.getElementById(`h-${hour}`);
    if (row) row.scrollIntoView({ block: 'center' });
    else window.scrollTo(0, 0);
  }

  async function closeDay() {
    detailDay = null;
    await tick();
    window.scrollTo(0, listScroll);
  }

  $effect(() => {
    forecasts.now;
    if (spot && keyOf(spot)) ensureForecast(spot);
  });

  function pick(id) {
    detailDay = null;
    selectSpot(id);
  }
</script>

<header class="top">
  <h1>Ét<span>a</span>le</h1>
  <button
    class="icon-btn"
    type="button"
    aria-label="Actualiser"
    disabled={entry?.status === 'loading'}
    onclick={() => ensureForecast(spot, true)}
  >
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" class:spin={entry?.status === 'loading'}>
      <path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v5h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  </button>
</header>

<nav class="spots" aria-label="Spots favoris">
  {#each store.spots as s (s.id)}
    <button type="button" class="chip" aria-pressed={s.id === spot?.id} onclick={() => pick(s.id)}>
      {s.name}{#if s.example}<small>exemple</small>{/if}
    </button>
  {/each}
  <button type="button" class="chip add" aria-label="Ajouter un spot" onclick={onadd}>+</button>
</nav>

{#if !spot}
  <div class="card empty">
    <p>Aucun spot pour l'instant.</p>
    <button class="btn primary" type="button" onclick={onadd}>Ajouter un spot</button>
  </div>
{:else}
  <div class="sport">
    <SportPicker value={sport} onchange={(v) => setSport(spot.id, v)} />
    <div class="sub muted small">{subtitle}</div>
  </div>

  {#if entry?.status === 'error' && !data}
    <div class="msg err">
      Impossible de charger les prévisions : {entry.error}. Vérifie ta connexion puis
      <button class="link" type="button" onclick={() => ensureForecast(spot, true)}>réessaie</button>.
    </div>
  {:else if !hours}
    <div class="skel" style="height:300px"></div>
    <div class="skel" style="height:420px"></div>
  {:else if detailDay && data.days.includes(detailDay)}
    <DayDetail {spot} {data} {hours} {sport} day={detailDay} onback={closeDay} onday={(d) => (detailDay = d)} />
  {:else}
    <NowCard {spot} {data} {hours} {sport} now={forecasts.now} onedit={() => onedit(spot)} />
    <ForecastList {data} {hours} {sport} {nowHour} onopen={openDay} />
  {/if}
{/if}

<style>
  .top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: -6px;
  }

  h1 {
    font-size: 28px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  h1 span {
    color: var(--accent);
  }

  .spin {
    animation: spin 0.9s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .spots {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    margin-inline: -16px;
    padding: 2px 16px 4px;
    scrollbar-width: none;
  }

  .spots::-webkit-scrollbar {
    display: none;
  }

  .chip {
    flex: none;
    min-height: 44px;
    border: 1px solid var(--line);
    background: var(--card);
    border-radius: 999px;
    padding: 0 16px;
    white-space: nowrap;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .chip small {
    font-size: 10.5px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    opacity: 0.65;
    font-weight: 500;
  }

  .chip[aria-pressed='true'] {
    background: var(--ink);
    color: var(--bg);
    border-color: var(--ink);
  }

  .chip.add {
    min-width: 44px;
    padding: 0;
    justify-content: center;
    border-style: dashed;
    color: var(--accent);
    border-color: var(--accent);
    font-size: 22px;
    font-weight: 500;
  }

  .sport {
    display: grid;
    gap: 6px;
  }

  .sub {
    text-align: center;
  }

  .empty {
    display: grid;
    gap: 8px;
    justify-items: start;
  }

  .empty p {
    margin: 0;
  }

  .link {
    border: 0;
    background: none;
    padding: 0;
    color: inherit;
    text-decoration: underline;
    font-weight: 600;
  }

  @media (prefers-reduced-motion: reduce) {
    .spin {
      animation: none;
    }
  }
</style>
