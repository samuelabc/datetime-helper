<script lang="ts">
  // 1. Imports
  import { untrack } from 'svelte';
  import CopyButton from './CopyButton.svelte';

  // 2. Props
  interface Props {
    value: number;
    isLive: boolean;
  }
  let { value, isLive }: Props = $props();

  // 3. State — for screen reader throttle
  let lastAnnouncedValue = $state(0);

  // 4. Derived values
  // Whether to show the live indicator (respects prefers-reduced-motion)
  let showLiveIndicator = $derived.by(() => {
    if (typeof window === 'undefined') return isLive;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    return isLive && !reducedMotion.matches;
  });

  // 5. Effects
  // Throttle screen reader announcements to every 10 seconds (NFR11).
  // CRITICAL: Read `value` via untrack() so this effect does NOT re-run every
  // second when the parent ticks. Only `isLive` is a reactive dependency.
  $effect(() => {
    // Set initial announced value without creating a dependency on `value`
    lastAnnouncedValue = untrack(() => value);

    if (!isLive) return;

    const interval = setInterval(() => {
      // Reads value inside async callback — not tracked by $effect
      lastAnnouncedValue = value;
    }, 10000);

    return () => clearInterval(interval);
  });
</script>

<div class="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-md p-4">
  <div class="flex items-center justify-between">
    <span class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Unix Timestamp</span>
    {#if showLiveIndicator}
      <span class="flex items-center gap-1 text-xs font-medium text-orange-500 dark:text-orange-400">
        <span class="inline-block w-2 h-2 rounded-full bg-orange-500 dark:bg-orange-400"></span>
        live
      </span>
    {/if}
  </div>
  <div class="flex items-center justify-between gap-3 mt-1">
    <p class="font-mono text-[2rem] leading-tight font-semibold text-gray-900 dark:text-gray-100 select-text">{value}</p>
    <CopyButton value={String(value)} formatLabel="Unix Timestamp" variant="hero" />
  </div>
  <!-- Screen reader live region — throttled to max once per 10 seconds -->
  <div class="sr-only" aria-live="polite" aria-atomic="true">
    Unix Timestamp: {lastAnnouncedValue}
  </div>
</div>
