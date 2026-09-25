<script>
  import Arrow from './Arrow.svelte';
  import { MODELS, agreeCls } from '../lib/forecast.js';
  import { wcolor, r0, r1, dirName } from '../lib/format.js';

  let { hours } = $props();

  let showModels = $state(false);
</script>

<section aria-labelledby="hours-title">
  <div class="head">
    <h3 id="hours-title">Heure par heure</h3>
    <button class="btn" type="button" aria-expanded={showModels} onclick={() => (showModels = !showModels)}>
      {showModels ? 'Masquer' : 'Détail'} 5 modèles
    </button>
  </div>

  <ol class="card">
    {#each hours as o (o.key)}
      {@const wc = wcolor(o.w)}
      {@const gc = wcolor(o.g)}
      <li class:night={!o.daylight}>
        <div class="line">
          <span class="h">{o.hour}h</span>
          <span class="dots" title="Note {o.score}/3" aria-label="Note {o.score} sur 3">
            {#each [1, 2, 3] as k (k)}<i class:on={o.score >= k}></i>{/each}
          </span>
          <span class="wind">
            <span class="wv" style:background={wc[0]} style:color={wc[1]}>{r0(o.w)}</span>
            <span class="wg" style:background={gc[0]} style:color={gc[1]}>{r0(o.g)}</span>
          </span>
          <span class="dir">
            <Arrow deg={o.d} size={16} />
            <span class="dn">{dirName(o.d)}</span>
            <span class="agree {agreeCls(o.spread)}" title="Écart entre modèles {r0(o.spread)} nd"></span>
          </span>
          <span class="wave">{r1(o.wave)}<small> m</small> <span class="muted">{r0(o.per)}<small> s</small></span></span>
        </div>
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
      </li>
    {/each}
  </ol>
  <div class="small muted">Vent / rafales en nœuds (médiane des modèles) · pastille : accord des modèles (vert ≤ 4 nd, jaune ≤ 8 nd, rouge au-delà)</div>
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

  ol {
    list-style: none;
    margin: 0;
    padding: 4px 12px;
  }

  li {
    border-bottom: 1px solid var(--line);
    padding: 8px 0;
  }

  li:last-child {
    border-bottom: 0;
  }

  li.night {
    opacity: 0.5;
  }

  .line {
    display: grid;
    grid-template-columns: 34px 30px 76px 1fr auto;
    align-items: center;
    gap: 6px;
    min-height: 30px;
  }

  .h {
    font: 700 18px/1 var(--cond);
    font-variant-numeric: tabular-nums;
  }

  .dots {
    display: inline-flex;
    gap: 2px;
  }

  .dots i {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--line);
  }

  .dots i.on {
    background: var(--s3);
  }

  .wind {
    display: flex;
    gap: 3px;
  }

  .wv,
  .wg {
    min-width: 34px;
    text-align: center;
    border-radius: 6px;
    font: 700 17px/1.6 var(--cond);
    font-variant-numeric: tabular-nums;
  }

  .wg {
    font-size: 14px;
    font-weight: 600;
    opacity: 0.9;
  }

  .dir {
    display: flex;
    align-items: center;
    gap: 4px;
    min-width: 0;
  }

  .dn {
    font: 600 16px/1 var(--cond);
    min-width: 30px;
  }

  .wave {
    font: 600 16px/1 var(--cond);
    font-variant-numeric: tabular-nums;
    text-align: right;
    white-space: nowrap;
  }

  .wave small {
    font-size: 12px;
  }

  .models {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 4px;
    margin-top: 6px;
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
