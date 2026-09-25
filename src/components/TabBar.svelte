<script>
  let { tab, onchange } = $props();

  const TABS = [
    { id: 'forecast', label: 'Prévisions', d: 'M3 8h11a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h7' },
    { id: 'spots', label: 'Mes spots', d: 'M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z' },
    { id: 'account', label: 'Compte', d: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0' },
  ];
</script>

<nav aria-label="Navigation principale">
  {#each TABS as t (t.id)}
    <button type="button" aria-current={tab === t.id ? 'page' : undefined} onclick={() => onchange(t.id)}>
      <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
        <path d={t.d} fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <span>{t.label}</span>
    </button>
  {/each}
</nav>

<style>
  nav {
    position: fixed;
    inset: auto 0 0 0;
    z-index: 10;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    background: var(--card);
    border-top: 1px solid var(--line);
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }

  button {
    height: var(--tabbar);
    border: 0;
    background: transparent;
    display: grid;
    place-items: center;
    align-content: center;
    gap: 2px;
    color: var(--muted);
    font-size: 12px;
    font-weight: 600;
  }

  button[aria-current='page'] {
    color: var(--accent);
  }
</style>
