<script lang="ts">
  // 1. Imports
  import { onMount } from 'svelte';
  import { init, calculate } from '../lib/wasmBridge';
  import type { FormattedResult } from '../lib/types';

  // 2. Props (none for Calculator — root component)

  // 3. State
  let wasmReady = $state(false);
  let error = $state<string | null>(null);
  let result = $state<FormattedResult | null>(null);

  // 4. Derived values (none yet — added in Story 1.3)

  // 5. Effects / Lifecycle
  onMount(async () => {
    try {
      await init();
      wasmReady = true;
      // Verify integration with a test calculation
      const today = new Date().toISOString().split('T')[0];
      result = calculate(today, []);
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to initialize engine';
      console.error('Wasm init failed:', e);
    }
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
    <div class="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-md p-4">
      <span class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Unix Timestamp</span>
      {#if wasmReady && result}
        <p class="font-mono text-[2rem] leading-tight font-semibold text-gray-900 dark:text-gray-100 mt-1">{result.unixTimestamp}</p>
      {:else}
        <p class="font-mono text-[2rem] leading-tight font-semibold text-gray-300 dark:text-gray-600 mt-1">---</p>
      {/if}
    </div>

    <!-- ISO 8601 -->
    <div class="bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-md p-3">
      <span class="text-xs font-medium text-gray-500 dark:text-gray-400">ISO 8601</span>
      {#if wasmReady && result}
        <p class="font-mono text-lg text-gray-900 dark:text-gray-100 mt-1">{result.iso8601}</p>
      {:else}
        <p class="font-mono text-lg text-gray-300 dark:text-gray-600 mt-1">---</p>
      {/if}
    </div>

    <!-- RFC 2822 -->
    <div class="bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-md p-3">
      <span class="text-xs font-medium text-gray-500 dark:text-gray-400">RFC 2822</span>
      {#if wasmReady && result}
        <p class="font-mono text-lg text-gray-900 dark:text-gray-100 mt-1">{result.rfc2822}</p>
      {:else}
        <p class="font-mono text-lg text-gray-300 dark:text-gray-600 mt-1">---</p>
      {/if}
    </div>

    <!-- Local Time -->
    <div class="bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-md p-3">
      <span class="text-xs font-medium text-gray-500 dark:text-gray-400">Local Time</span>
      {#if wasmReady && result}
        <p class="font-mono text-lg text-gray-900 dark:text-gray-100 mt-1">{result.localHuman}</p>
      {:else}
        <p class="font-mono text-lg text-gray-300 dark:text-gray-600 mt-1">---</p>
      {/if}
    </div>

    <!-- Error state -->
    {#if error}
      <p class="text-sm text-red-500 dark:text-red-400 mt-2">Engine error: {error}</p>
    {/if}
  </section>
</div>
