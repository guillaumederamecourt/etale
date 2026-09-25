<script>
  import HourRow from './HourRow.svelte';
  import HourColumns from './HourColumns.svelte';
  import ScoreLegend from './ScoreLegend.svelte';
  import { MODELS, tideNear } from '../lib/forecast.js';
  import { r0 } from '../lib/format.js';

  let { hours, sport, ex } = $props();

  let showModels = $state(false);
</script>

<section aria-labelledby="hours-title">
  <div class="head">
    <h3 id="hours-title">Heure par heure</h3>
    <button class="btn" type="button" aria-expanded={showModels} onclick={() => (showModels = !showModels)}>
      {showModels ? 'Masquer' : 'Détail'} 5 modèles
    </button>
  </div>

  <HourColumns />
  <div class="card rows">
    {#each hours as o (o.key)}
      <HourRow {o} {sport} tide={tideNear(ex, o.t, 30)} id="h-{o.hour}">
        {#if showModels}
          <div class="models">
            {#each MODELS as m (m.id)}
              {@const v = o.models[m.id]}
              <span class="m">
                <span class="ml">{m.label}</span>
                <span class="mv">{v.w == null ? '–' : `${r0(v.w)}/${r0(v.g)}`}</span>
              </span>
            {/each}
          </div>
        {/if}
      </HourRow>
    {/each}
  </div>
  <ScoreLegend />
  <div class="small muted">Vent / rafales en nœuds, médiane des 5 modèles. Détail des modèles : vent/rafales.</div>
</section>

<style>
  section {
    display: grid;
    gap: 8px;
  }

  .head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
  }

  h3 {
    font-size: 20px;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .rows {
    padding: 0;
    overflow: hidden;
  }

  .models {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 4px;
    padding: 0 12px 8px 16px;
  }

  .m {
    display: grid;
    justify-items: center;
    background: var(--card2);
    border-radius: 6px;
    padding: 3px 0;
  }

  .ml {
    font-size: 10.5px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--muted);
  }

  .mv {
    font: 600 15px/1.2 var(--cond);
    font-variant-numeric: tabular-nums;
  }
</style>
