<script lang="ts">
  // 1. Imports
  import CopyButton from './CopyButton.svelte';

  // 2. Props
  interface Props {
    formatLabel: string;
    value: string;
  }
  let { formatLabel, value }: Props = $props();
</script>

<div class="bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-md p-3">
  <span class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{formatLabel}</span>
  <div class="flex items-center justify-between gap-3 mt-1">
    <p class="font-mono text-lg text-gray-900 dark:text-gray-100 select-text">{value}</p>
    <CopyButton {value} {formatLabel} />
  </div>
</div>
