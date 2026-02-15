<script lang="ts">
  // 1. Imports
  import { onDestroy } from 'svelte';
  import { copyToClipboard } from '../lib/clipboard';

  // 2. Props
  interface Props {
    value: string;
    formatLabel: string;
    variant?: 'default' | 'hero';
  }
  let { value, formatLabel, variant = 'default' }: Props = $props();

  // 3. State
  let copied = $state(false);
  let timeoutId: ReturnType<typeof setTimeout> | null = null; // Not reactive — internal bookkeeping only

  // 4. Derived
  let isHero = $derived(variant === 'hero');

  // 5. Effects — none

  // 6. Lifecycle cleanup
  onDestroy(() => {
    if (timeoutId) clearTimeout(timeoutId);
  });

  // 7. Handlers
  async function handleCopy() {
    const success = await copyToClipboard(value);
    if (!success) return;

    // Clear any existing timeout (rapid re-clicks)
    if (timeoutId) clearTimeout(timeoutId);

    copied = true;
    timeoutId = setTimeout(() => {
      copied = false;
      timeoutId = null;
    }, 1500);
  }
</script>

<button
  type="button"
  onclick={handleCopy}
  aria-label="Copy {formatLabel} value"
  class="inline-flex items-center gap-1.5 rounded-md border
    min-h-11
    {isHero ? 'px-3 py-2 text-sm' : 'px-2.5 py-1.5 text-xs sm:text-sm'}
    font-medium
    motion-safe:transition-colors motion-safe:duration-150 motion-reduce:transition-none
    focus:outline-none focus:ring-2 focus:ring-orange-500
    {copied
      ? 'border-green-600 dark:border-green-500 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400'
      : 'border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:border-orange-300 dark:hover:border-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950/30 hover:text-orange-600 dark:hover:text-orange-300'
    }"
>
  {#if copied}
    <!-- Checkmark icon -->
    <svg class="{isHero ? 'w-4 h-4' : 'w-3.5 h-3.5'}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
    Copied!
  {:else}
    <!-- Clipboard icon -->
    <svg class="{isHero ? 'w-4 h-4' : 'w-3.5 h-3.5'}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
    </svg>
    Copy
  {/if}
</button>

<!-- Screen reader: announce copy action -->
<div class="sr-only" aria-live="assertive" aria-atomic="true">
  {copied ? 'Copied to clipboard' : ''}
</div>
