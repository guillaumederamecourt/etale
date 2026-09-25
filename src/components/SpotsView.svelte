<script>
  import { tick } from 'svelte';
  import { store, selectSpot, sportFor, newSpot, moveSpot, commitOrder } from '../lib/spots.svelte.js';
  import { forecasts, ensureForecast } from '../lib/forecasts.svelte.js';
  import { scoreHours, daySummary, windowLabel, dayMaxCoef, SPORTS } from '../lib/forecast.js';
  import { searchPlaces } from '../lib/api.js';
  import { coefClass } from '../lib/tide.js';
  import { r0, r1, dirName, wcolor } from '../lib/format.js';

  let { focusSearch = $bindable(false), onedit, oncreate, onopen } = $props();

  let query = $state('');
  let results = $state(null);
  let searching = $state(false);
  let searchError = $state('');
  let input;
  let dragId = $state(null);

  $effect(() => {
    if (focusSearch) {
      tick().then(() => input?.focus());
      focusSearch = false;
    }
  });

  $effect(() => {
    forecasts.now;
    for (const s of store.spots) if (s.lat != null && s.lon != null) ensureForecast(s);
  });

  function summary(spot) {
    const data = forecasts.get(spot.id)?.data;
    if (!data) return null;
    const sport = sportFor(spot);
    const day = data.days[0];
    const s = daySummary(scoreHours(data, spot, sport), day);
    return { sport, ...s, coef: dayMaxCoef(data, day) };
  }

  async function search(e) {
    e.preventDefault();
    const q = query.trim();
    if (q.length < 2) return;
    searching = true;
    searchError = '';
    try {
      results = await searchPlaces(q);
    } catch (err) {
      searchError = err.message || String(err);
      results = null;
    } finally {
      searching = false;
    }
  }

  function create(r) {
    oncreate(newSpot({ name: r.name, lat: +r.latitude.toFixed(4), lon: +r.longitude.toFixed(4) }));
  }

  function open(id) {
    selectSpot(id);
    onopen();
  }

  function dragStart(e, id) {
    e.preventDefault();
    dragId = id;
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function dragMove(e) {
    if (!dragId) return;
    const row = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-index]');
    if (!row) return;
    const from = store.spots.findIndex((s) => s.id === dragId);
    moveSpot(from, +row.dataset.index);
  }

  function dragEnd() {
    if (!dragId) return;
    dragId = null;
    commitOrder();
  }

  function keyMove(e, i) {
    const to = e.key === 'ArrowUp' ? i - 1 : e.key === 'ArrowDown' ? i + 1 : null;
    if (to == null) return;
    e.preventDefault();
    moveSpot(i, to);
    commitOrder();
    tick().then(() => document.querySelector(`[data-index="${to}"] .handle`)?.focus());
  }
</script>

<h2 class="title">Mes spots</h2>

<form class="search" role="search" onsubmit={search}>
  <label class="label" for="q">Ajouter un spot</label>
  <div class="bar">
    <input id="q" class="input" type="search" bind:this={input} bind:value={query} placeholder="Wissant, Quiberon, Leucate…" autocomplete="off" enterkeyhint="search" />
    <button class="btn primary" type="submit" disabled={searching}>{searching ? '…' : 'Chercher'}</button>
  </div>
  {#if searchError}
    <div class="msg err">Recherche impossible : {searchError}</div>
  {:else if results}
    <ul class="results">
      {#each results as r (r.id)}
        <li>
          <button type="button" onclick={() => create(r)}>
            <b>{r.name}</b>
            <span class="small muted">{[r.admin2, r.admin1, r.country].filter(Boolean).join(', ')} · {r.latitude.toFixed(3)}, {r.longitude.toFixed(3)}</span>
          </button>
        </li>
      {:else}
        <li class="small muted">Aucun résultat. Essaie un autre nom.</li>
      {/each}
    </ul>
    <button class="btn ghost small" type="button" onclick={() => oncreate(newSpot({ name: query.trim() }))}>Saisir les coordonnées à la main</button>
  {/if}
</form>

<ul class="list" class:dragging={dragId}>
  {#each store.spots as spot, i (spot.id)}
    {@const sum = summary(spot)}
    <li class="card spot" data-index={i} class:lifted={dragId === spot.id}>
      <button
        class="handle"
        type="button"
        aria-label="Déplacer {spot.name} (flèches haut et bas)"
        onpointerdown={(e) => dragStart(e, spot.id)}
        onpointermove={dragMove}
        onpointerup={dragEnd}
        onpointercancel={dragEnd}
        onkeydown={(e) => keyMove(e, i)}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M5 8h14M5 12h14M5 16h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
      </button>
      <button class="main" type="button" onclick={() => open(spot.id)}>
        <span class="name">{spot.name}{#if spot.example}<small>exemple</small>{/if}</span>
        <span class="sum small">
          {#if sum}
            <span class="muted">{SPORTS[sum.sport]} ·</span>
            {#if sum.sport === 'surf'}
              {sum.maxWave ? `${r1(sum.maxWave.wave)} m · ${r0(sum.maxWave.per)} s` : '–'}
            {:else if sum.maxWind}
              {@const wc = wcolor(sum.maxWind.w)}
              <span class="w" style:background={wc[0]} style:color={wc[1]}>{r0(sum.maxWind.w)}</span> nd {dirName(sum.maxWind.d)}
            {/if}
            {#if sum.coef}<span class="coef {coefClass(sum.coef)}">{sum.coef}</span>{/if}
            {#if sum.window}<span class="win">{windowLabel(sum.window)}</span>{/if}
          {:else}
            <span class="muted">Chargement…</span>
          {/if}
        </span>
      </button>
      <button class="icon-btn" type="button" aria-label="Réglages de {spot.name}" onclick={() => onedit(spot)}>
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <path d="M4 7h10M18 7h2M4 17h4M12 17h8M16 5v4M10 15v4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
      </button>
    </li>
  {:else}
    <li class="msg">Aucun spot. Cherche un lieu ci-dessus pour en ajouter un.</li>
  {/each}
</ul>
{#if store.spots.length > 1}<p class="small muted hint">Glisse la poignée pour réordonner. Résumé : aujourd'hui, sport par défaut.</p>{/if}

<style>
  .title {
    font-size: 28px;
  }

  .search {
    display: grid;
    gap: 8px;
  }

  .bar {
    display: flex;
    gap: 8px;
  }

  .bar .input {
    flex: 1;
    min-width: 0;
  }

  .results {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 6px;
  }

  .results button {
    width: 100%;
    min-height: 44px;
    text-align: left;
    border: 1px solid var(--line);
    background: var(--card);
    border-radius: 10px;
    padding: 8px 12px;
    display: grid;
    gap: 2px;
  }

  .list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 8px;
  }

  .dragging {
    user-select: none;
    -webkit-user-select: none;
  }

  .spot {
    display: grid;
    grid-template-columns: 44px 1fr 44px;
    align-items: center;
    padding: 4px;
    transition: box-shadow 0.15s;
  }

  .lifted {
    box-shadow: 0 6px 18px rgba(15, 36, 48, 0.18);
    border-color: var(--accent);
  }

  .handle {
    min-height: 44px;
    border: 0;
    background: transparent;
    color: var(--muted);
    touch-action: none;
    cursor: grab;
    display: grid;
    place-items: center;
  }

  .main {
    min-height: 56px;
    border: 0;
    background: transparent;
    text-align: left;
    display: grid;
    gap: 3px;
    padding: 6px 4px;
    min-width: 0;
  }

  .name {
    font: 700 20px/1.1 var(--cond);
    overflow-wrap: anywhere;
  }

  .name small {
    margin-left: 6px;
    font: 500 11px Barlow, sans-serif;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--muted);
  }

  .sum {
    display: flex;
    align-items: center;
    gap: 5px;
    flex-wrap: wrap;
  }

  .w {
    border-radius: 5px;
    padding: 0 5px;
    font: 700 15px/1.3 var(--cond);
  }

  .sum .coef {
    font-size: 14px;
  }

  .win {
    background: var(--ok-soft);
    color: var(--ok-ink);
    border-radius: 999px;
    padding: 0 8px;
    font: 700 14px/1.4 var(--cond);
  }

  .hint {
    margin: 0;
  }
</style>
