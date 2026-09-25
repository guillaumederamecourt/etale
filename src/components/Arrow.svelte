<script>
  let { deg, size = 16 } = $props();
</script>

{#if deg != null}
  <svg class="arrow" viewBox="0 0 24 24" width={size} height={size} style:transform="rotate({Math.round(deg + 180)}deg)" aria-hidden="true">
    <path d="M12 2 5 20l7-4 7 4z" fill="currentColor" />
  </svg>
{/if}

<style>
  .arrow {
    flex: none;
    display: inline-block;
    vertical-align: middle;
  }
</style>
