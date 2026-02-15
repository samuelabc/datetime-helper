<script lang="ts">
  // 1. Svelte framework imports
  import { onMount } from 'svelte';

  // 2. Wasm bridge imports
  import { init, calculate } from '../lib/wasmBridge';

  // 3. Type imports
  import type { FormattedResult } from '../lib/types';

  // 4. Component imports
  import HeroResultRow from './HeroResultRow.svelte';
  import ResultRow from './ResultRow.svelte';

  // 2. Props (none for Calculator — root component)

  // 3. State
  let wasmReady = $state(false);
  let error = $state<string | null>(null);
  let result = $state<FormattedResult | null>(null);
  let isLive = $state(true);

  // 4. Derived values (none yet)

  // 5. Effects / Lifecycle
  onMount(async () => {
    try {
      await init();
      wasmReady = true;
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to initialize engine';
      console.error('Wasm init failed:', e);
    }
  });

  // Live-tick effect — separate from onMount init
  $effect(() => {
    if (!isLive || !wasmReady) return;

    // Check prefers-reduced-motion
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const tick = () => {
      try {
        const now = new Date().toISOString();
        result = calculate(now, []);
      } catch (e) {
        error = e instanceof Error ? e.message : 'Calculation failed';
        console.error('Live tick failed:', e);
      }
    };

    // Always compute at least once
    tick();

    // If reduced motion, don't set up interval — static display
    if (reducedMotion.matches) return;

    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  });

  // 6. Event handlers (none yet)
</script>

<div class="flex flex-col md:flex-row gap-6">
  <!-- Input Zone -->
  <section aria-label="Input" class="md:w-2/5 bg-gray-50 dark:bg-slate-800 rounded-md p-4 md:p-6">
    <p class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">Input</p>
    <div class="space-y-4">
      <div>
        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Start Date</label>
        <div class="bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-md p-3 text-gray-400 dark:text-gray-500 text-sm">
          Coming in Story 2.1...
        </div>
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Operations</label>
        <div class="bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-md p-3 text-gray-400 dark:text-gray-500 text-sm">
          Coming in Story 2.2...
        </div>
      </div>
    </div>
  </section>

  <!-- Output Zone -->
  <section aria-label="Results" class="md:w-3/5 space-y-3">
    <!-- Hero: Unix Timestamp -->
    {#if wasmReady && result}
      <HeroResultRow value={result.unixTimestamp} isLive={isLive} />
    {:else}
      <div class="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-md p-4">
        <span class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Unix Timestamp</span>
        <p class="font-mono text-[2rem] leading-tight font-semibold text-gray-300 dark:text-gray-600 mt-1">---</p>
      </div>
    {/if}

    <!-- ISO 8601 -->
    {#if wasmReady && result}
      <ResultRow formatLabel="ISO 8601" value={result.iso8601} />
    {:else}
      <div class="bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-md p-3">
        <span class="text-xs font-medium text-gray-500 dark:text-gray-400">ISO 8601</span>
        <p class="font-mono text-lg text-gray-300 dark:text-gray-600 mt-1">---</p>
      </div>
    {/if}

    <!-- RFC 2822 -->
    {#if wasmReady && result}
      <ResultRow formatLabel="RFC 2822" value={result.rfc2822} />
    {:else}
      <div class="bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-md p-3">
        <span class="text-xs font-medium text-gray-500 dark:text-gray-400">RFC 2822</span>
        <p class="font-mono text-lg text-gray-300 dark:text-gray-600 mt-1">---</p>
      </div>
    {/if}

    <!-- Local Time -->
    {#if wasmReady && result}
      <ResultRow formatLabel="Local Time" value={result.localHuman} />
    {:else}
      <div class="bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-md p-3">
        <span class="text-xs font-medium text-gray-500 dark:text-gray-400">Local Time</span>
        <p class="font-mono text-lg text-gray-300 dark:text-gray-600 mt-1">---</p>
      </div>
    {/if}

    <!-- Error state -->
    {#if error}
      <p class="text-sm text-red-500 dark:text-red-400 mt-2">Engine error: {error}</p>
    {/if}
  </section>
</div>
