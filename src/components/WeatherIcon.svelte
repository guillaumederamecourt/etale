<script>
  import { weather } from '../lib/weather.js';

  let { code, isDay = true, size = 24 } = $props();

  const w = $derived(weather(code));
  const orb = $derived(isDay ? '#wx-sun' : '#wx-moon');
</script>

{#if code != null}
  <svg class="wx" viewBox="0 0 24 24" width={size} height={size} role="img" aria-label={w.label}>
    <title>{w.label}</title>
    {#if w.kind === 'clear'}
      <use href={orb} />
    {:else if w.kind === 'mostly'}
      <use href={orb} transform="translate(-1 -1) scale(.9)" />
      <use href="#wx-cloud" transform="translate(9 10) scale(.55)" />
    {:else if w.kind === 'partly'}
      <use href={orb} transform="translate(1 1) scale(.62)" />
      <use href="#wx-cloud" transform="translate(1.5 1.5) scale(.92)" />
    {:else if w.kind === 'cloudy'}
      <use href="#wx-cloud" transform="translate(-4 -2) scale(.7)" opacity=".7" />
      <use href="#wx-cloud" transform="translate(1 1)" />
    {:else if w.kind === 'fog'}
      <use href="#wx-cloud" transform="translate(0 -3.5)" />
      <path d="M4 19h16M7 22h11" stroke="var(--cloud-edge)" stroke-width="1.8" stroke-linecap="round" />
    {:else}
      {#if w.kind === 'showers'}<use href={orb} transform="translate(-1 -1) scale(.55)" />{/if}
      <use href="#wx-cloud" transform="translate(0 -3.2)" />
      {#if w.kind === 'snow'}
        <g fill="var(--rain)"><circle cx="7.5" cy="20.5" r="1.3" /><circle cx="12" cy="20.5" r="1.3" /><circle cx="16.5" cy="20.5" r="1.3" /></g>
      {:else if w.kind === 'storm'}
        <path d="M12.5 15.5 9.5 20h3l-1.5 3.5" fill="none" stroke="var(--sun)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
      {:else}
        <path
          d={w.kind === 'showers' ? 'M8 18.5l-1.2 3.5M12 18.5l-1.2 3.5' : 'M8 18.5l-1.2 3.5M12 18.5l-1.2 3.5M16 18.5l-1.2 3.5'}
          stroke="var(--rain)"
          stroke-width="1.7"
          stroke-linecap="round"
          stroke-dasharray={w.kind === 'drizzle' ? '1 2.6' : undefined}
        />
      {/if}
    {/if}
  </svg>
{:else}
  <span class="wx-empty" style:width="{size}px"></span>
{/if}

<style>
  .wx {
    flex: none;
    display: block;
  }

  .wx-empty {
    display: block;
  }
</style>
