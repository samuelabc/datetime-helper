<script lang="ts">
  interface Props {
    onClick: () => void;
  }

  let { onClick }: Props = $props();
</script>

<button
  type="button"
  aria-label="Add operation"
  onclick={onClick}
  class="h-11 rounded-md px-3 text-sm font-medium text-orange-800 dark:text-orange-300 border border-orange-300 dark:border-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/30 focus:outline-none focus:ring-2 focus:ring-orange-500"
>
  + Add operation
</button>
