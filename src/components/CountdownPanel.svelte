<script lang="ts">
  import type { CountdownValue } from "../lib/countdown";

  interface Props {
    value: CountdownValue | null;
  }

  let { value }: Props = $props();
</script>

{#if value}
  <section class="rounded-md border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 p-3" aria-live="polite" aria-atomic="true">
    <p class="text-xs font-medium text-gray-700 dark:text-gray-200">
      {value.mode === "until" ? "Time until target" : "Time since target"}
    </p>
    <p class="font-mono text-sm text-gray-800 dark:text-gray-100 mt-1">{value.label}</p>
  </section>
{/if}
