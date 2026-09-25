<script>
  import { untrack } from 'svelte';
  import Compass from './Compass.svelte';
  import SportPicker from './SportPicker.svelte';
  import { SPORTS, SPORT_DEFAULTS, TIDEPREF } from '../lib/forecast.js';
  import { saveSpot, removeSpot, store } from '../lib/spots.svelte.js';

  let { draft, isNew, onclose, onsaved } = $props();

  const withDefaults = (s) => ({
    ...s,
    sports: Object.fromEntries(Object.keys(SPORTS).map((k) => [k, { ...structuredClone(SPORT_DEFAULTS[k]), ...(s.sports?.[k] || {}) }])),
  });

  const initial = untrack(() => draft);
  let spot = $state(withDefaults(initial));
  let tab = $state(initial.defaultSport || 'kite');
  let lat = $state(initial.lat ?? '');
  let lon = $state(initial.lon ?? '');
  let error = $state('');
  let confirmDelete = $state(false);

  const num = (v) => parseFloat(String(v).replace(',', '.'));

  function save() {
    const la = num(lat);
    const lo = num(lon);
    spot.name = spot.name.trim();
    if (!spot.name) return (error = 'Donne un nom au spot.');
    if (!isFinite(la) || !isFinite(lo) || Math.abs(la) > 90 || Math.abs(lo) > 180) {
      return (error = 'Coordonnées invalides (ex. 47.84 et -4.35).');
    }
    for (const k of ['kite', 'wing']) {
      if (+spot.sports[k].wmin >= +spot.sports[k].wmax) return (error = `${SPORTS[k]} : le vent mini doit être inférieur au vent maxi.`);
    }
    spot.lat = la;
    spot.lon = lo;
    spot.tideCorr = +spot.tideCorr || 0;
    for (const c of Object.values(spot.sports)) for (const f of ['wmin', 'wmax', 'waveMin', 'periodMin', 'windMax']) if (f in c) c[f] = +c[f] || 0;
    error = '';
    saveSpot($state.snapshot(spot));
    onsaved();
  }

  function remove() {
    if (!confirmDelete) return (confirmDelete = true);
    removeSpot(spot.id);
    onsaved();
  }
</script>

<div class="bar">
  <button class="btn ghost back" type="button" onclick={onclose}>
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="m15 5-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
    Retour
  </button>
</div>

<h2 class="title">{isNew ? 'Nouveau spot' : 'Réglages du spot'}</h2>

<form class="form" onsubmit={(e) => (e.preventDefault(), save())}>
  <section class="card fields">
    <label class="field full">
      <span class="label">Nom</span>
      <input class="input" bind:value={spot.name} autocomplete="off" />
    </label>
    <label class="field">
      <span class="label">Latitude</span>
      <input class="input" inputmode="decimal" bind:value={lat} placeholder="47.838" />
    </label>
    <label class="field">
      <span class="label">Longitude</span>
      <input class="input" inputmode="decimal" bind:value={lon} placeholder="-4.350" />
    </label>
    <label class="field">
      <span class="label">Sport par défaut</span>
      <select class="input" bind:value={spot.defaultSport}>
        {#each Object.entries(SPORTS) as [k, v] (k)}<option value={k}>{v}</option>{/each}
      </select>
    </label>
    <label class="field">
      <span class="label">Correction marée (min)</span>
      <input class="input" type="number" step="5" min="-360" max="360" bind:value={spot.tideCorr} />
    </label>
    <p class="small muted full hint">
      Correction horaire : compare une fois l'heure de pleine mer affichée avec l'annuaire (maree.shom.fr) et saisis l'écart en minutes.
    </p>
  </section>

  <SportPicker value={tab} onchange={(v) => (tab = v)} label="Réglages par sport" />

  <section class="card fields">
    {#if tab === 'surf'}
      <label class="field">
        <span class="label">Vagues mini (m)</span>
        <input class="input" type="number" step="0.1" min="0" max="10" bind:value={spot.sports[tab].waveMin} />
      </label>
      <label class="field">
        <span class="label">Période mini (s)</span>
        <input class="input" type="number" step="1" min="0" max="25" bind:value={spot.sports[tab].periodMin} />
      </label>
      <label class="field">
        <span class="label">Vent offshore maxi (nd)</span>
        <input class="input" type="number" step="1" min="0" max="60" bind:value={spot.sports[tab].windMax} />
      </label>
    {:else}
      <label class="field">
        <span class="label">Vent mini (nd)</span>
        <input class="input" type="number" step="1" min="0" max="60" bind:value={spot.sports[tab].wmin} />
      </label>
      <label class="field">
        <span class="label">Vent maxi (nd)</span>
        <input class="input" type="number" step="1" min="0" max="70" bind:value={spot.sports[tab].wmax} />
      </label>
    {/if}
    <label class="field">
      <span class="label">Marée idéale</span>
      <select class="input" bind:value={spot.sports[tab].tidePref}>
        {#each Object.entries(TIDEPREF) as [k, v] (k)}<option value={k}>{v}</option>{/each}
      </select>
    </label>

    <div class="full">
      <span class="label">{tab === 'surf' ? 'Vents offshore (favorables)' : 'Directions de vent navigables'} · {SPORTS[tab]}</span>
      {#key tab}
        <Compass bind:sectors={spot.sports[tab].sectors} label="Secteurs de vent pour le {SPORTS[tab].toLowerCase()}" />
      {/key}
    </div>
  </section>

  {#if error}<div class="msg err" role="alert">{error}</div>{/if}

  <div class="actions">
    <button class="btn primary" type="submit">Enregistrer</button>
    <button class="btn" type="button" onclick={onclose}>Annuler</button>
  </div>

  {#if !isNew && store.spots.some((s) => s.id === spot.id)}
    <div class="danger">
      {#if confirmDelete}
        <p class="small">Supprimer « {spot.name} » définitivement ?</p>
        <div class="actions">
          <button class="btn solid-danger" type="button" onclick={remove}>Oui, supprimer</button>
          <button class="btn" type="button" onclick={() => (confirmDelete = false)}>Non</button>
        </div>
      {:else}
        <button class="btn danger" type="button" onclick={remove}>Supprimer ce spot</button>
      {/if}
    </div>
  {/if}
</form>

<style>
  .bar {
    margin: -6px 0 -10px -12px;
  }

  .back {
    padding: 0 12px;
    color: var(--accent);
  }

  .title {
    font-size: 28px;
  }

  .form {
    display: grid;
    gap: 14px;
  }

  .fields {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .field {
    display: grid;
    gap: 4px;
    min-width: 0;
  }

  .full {
    grid-column: 1 / -1;
  }

  .hint {
    margin: -4px 0 0;
  }

  .actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .danger {
    border-top: 1px solid var(--line);
    padding-top: 14px;
    display: grid;
    gap: 8px;
  }

  .danger p {
    margin: 0;
  }
</style>
