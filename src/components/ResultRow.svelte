<script lang="ts">
  // 1. Imports
  import CopyButton from './CopyButton.svelte';

  // 2. Props
  interface Props {
    formatLabel: string;
    value: string;
  }
  let { formatLabel, value }: Props = $props();
  let labelSlug = $derived(formatLabel.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
  let labelId = $derived(`${labelSlug}-label`);
  let valueId = $derived(`${labelSlug}-value`);
</script>

<div
  role="group"
  aria-labelledby={labelId}
  aria-describedby={valueId}
  class="bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-md p-3 min-w-0"
>
  <span id={labelId} class="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">{formatLabel}</span>
  <div class="flex flex-wrap sm:flex-nowrap items-start sm:items-center justify-between gap-3 mt-1 min-w-0">
    <p id={valueId} class="min-w-0 break-words font-mono text-base sm:text-lg text-gray-900 dark:text-gray-100 select-text">{value}</p>
    <CopyButton {value} {formatLabel} />
  </div>
</div>
