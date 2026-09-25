<script>
  import { onMount } from 'svelte';
  import TabBar from './components/TabBar.svelte';
  import WeatherDefs from './components/WeatherDefs.svelte';
  import ForecastView from './components/ForecastView.svelte';
  import SpotsView from './components/SpotsView.svelte';
  import SpotSettings from './components/SpotSettings.svelte';
  import AccountView from './components/AccountView.svelte';
  import { initAccount } from './lib/account.svelte.js';
  import { startClock } from './lib/forecasts.svelte.js';
  import { startUpdateCheck } from './lib/update.js';

  let tab = $state('forecast');
  let editing = $state(null);
  let focusSearch = $state(false);

  onMount(() => {
    initAccount();
    const stopClock = startClock();
    const stopUpdates = startUpdateCheck(() => !editing && tab !== 'account');
    return () => {
      stopClock();
      stopUpdates();
    };
  });

  function go(next) {
    editing = null;
    tab = next;
    window.scrollTo(0, 0);
  }

  function edit(spot, isNew = false) {
    editing = { spot: structuredClone($state.snapshot(spot)), isNew };
    window.scrollTo(0, 0);
  }

  function addSpot() {
    focusSearch = true;
    go('spots');
  }
</script>

<main class="app">
  {#if editing}
    {#key editing}
      <SpotSettings
        draft={editing.spot}
        isNew={editing.isNew}
        onclose={() => (editing = null)}
        onsaved={() => go('forecast')}
      />
    {/key}
  {:else if tab === 'forecast'}
    <ForecastView onadd={addSpot} onedit={(s) => edit(s)} />
  {:else if tab === 'spots'}
    <SpotsView
      bind:focusSearch
      onedit={(s) => edit(s)}
      oncreate={(s) => edit(s, true)}
      onopen={() => go('forecast')}
    />
  {:else}
    <AccountView />
  {/if}
</main>

<TabBar {tab} onchange={go} />
<WeatherDefs />

<style>
  .app {
    max-width: 560px;
    margin: 0 auto;
    padding: calc(env(safe-area-inset-top, 0px) + 12px) 16px calc(var(--tabbar) + env(safe-area-inset-bottom, 0px) + 24px);
    display: grid;
    gap: 14px;
    min-width: 0;
  }
</style>
