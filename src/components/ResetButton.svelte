<script lang="ts">
  interface Props {
    onClick: () => void;
  }

  let { onClick }: Props = $props();
</script>

<button
  type="button"
  aria-label="Reset calculator"
  onclick={onClick}
  class="h-9 rounded-md px-3 text-xs font-medium text-gray-600 dark:text-gray-200 border border-gray-300 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
>
  Reset
</button>
