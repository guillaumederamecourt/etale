<script>
  let { hours } = $props();
</script>

<div class="bars" aria-hidden="true">
  {#each hours as o (o.key)}
    <i class="s{o.score}" class:night={!o.daylight}></i>
  {/each}
</div>

<style>
  .bars {
    display: grid;
    grid-template-columns: repeat(17, 1fr);
    gap: 2px;
    height: 10px;
  }

  i {
    border-radius: 2px;
    background: var(--line);
  }

  .s1 {
    background: var(--s1);
  }

  .s2 {
    background: var(--s2);
  }

  .s3 {
    background: var(--s3);
  }

  .night {
    opacity: 0.35;
  }
</style>
