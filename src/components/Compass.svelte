<script>
  import { DIRS } from '../lib/format.js';

  let { sectors = $bindable([]), label } = $props();

  const SIZE = 300;
  const R = 122;

  function toggle(i) {
    sectors = sectors.includes(i) ? sectors.filter((x) => x !== i) : [...sectors, i].sort((a, b) => a - b);
  }
</script>

<div class="compass" role="group" aria-label={label}>
  <svg class="rose" viewBox="0 0 {SIZE} {SIZE}" aria-hidden="true">
    {#each DIRS as _, i (i)}
      {@const a0 = ((i * 22.5 - 11.25 - 90) * Math.PI) / 180}
      {@const a1 = ((i * 22.5 + 11.25 - 90) * Math.PI) / 180}
      {#if sectors.includes(i)}
        <path
          class="wedge"
          d="M150 150 L{150 + 98 * Math.cos(a0)} {150 + 98 * Math.sin(a0)} A98 98 0 0 1 {150 + 98 * Math.cos(a1)} {150 + 98 * Math.sin(a1)}Z"
        />
      {/if}
    {/each}
    <circle cx="150" cy="150" r="98" class="ring" />
  </svg>
  {#each DIRS as d, i (d)}
    {@const a = ((i * 22.5 - 90) * Math.PI) / 180}
    <button
      type="button"
      aria-pressed={sectors.includes(i)}
      style:left="{((SIZE / 2 + R * Math.cos(a)) / SIZE) * 100}%"
      style:top="{((SIZE / 2 + R * Math.sin(a)) / SIZE) * 100}%"
      onclick={() => toggle(i)}>{d}</button
    >
  {/each}
  <div class="center small muted">
    {sectors.length ? `${sectors.length} secteur${sectors.length > 1 ? 's' : ''}` : 'Aucun = toutes directions'}
  </div>
</div>

<style>
  .compass {
    position: relative;
    width: min(300px, 100%);
    aspect-ratio: 1;
    margin: 4px auto;
  }

  .rose {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .ring {
    fill: none;
    stroke: var(--line);
    stroke-dasharray: 4 5;
  }

  .wedge {
    fill: var(--s3);
    opacity: 0.22;
  }

  button {
    position: absolute;
    width: 44px;
    height: 44px;
    margin: -22px 0 0 -22px;
    border-radius: 50%;
    border: 1px solid var(--line);
    background: var(--card2);
    font: 700 14px/1 var(--cond);
    padding: 0;
  }

  button[aria-pressed='true'] {
    background: var(--s3);
    border-color: var(--s3);
    color: #fff;
  }

  .center {
    position: absolute;
    inset: 32%;
    display: grid;
    place-items: center;
    text-align: center;
    pointer-events: none;
  }
</style>
