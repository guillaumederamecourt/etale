<script>
  import { SPORTS } from '../lib/forecast.js';

  let { value, onchange, label = 'Sport' } = $props();
</script>

<div class="seg" role="radiogroup" aria-label={label}>
  {#each Object.entries(SPORTS) as [id, name] (id)}
    <button type="button" role="radio" aria-checked={value === id} onclick={() => onchange(id)}>{name}</button>
  {/each}
</div>

<style>
  .seg {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    background: var(--card2);
    border: 1px solid var(--line);
    border-radius: 12px;
    padding: 3px;
    gap: 3px;
  }

  button {
    min-height: 44px;
    border: 0;
    border-radius: 9px;
    background: transparent;
    font: 700 17px/1 var(--cond);
    letter-spacing: 0.02em;
    color: var(--muted);
  }

  button[aria-checked='true'] {
    background: var(--card);
    color: var(--ink);
    box-shadow: 0 1px 3px rgba(15, 36, 48, 0.14);
  }
</style>
