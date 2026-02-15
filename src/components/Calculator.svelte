<script lang="ts">
  // 1. Svelte framework imports
  import { onMount } from 'svelte';

  // 2. Wasm bridge imports
  import { init, calculate, validateDate } from '../lib/wasmBridge';

  // 3. Type imports
  import type { FormattedResult, Operation } from '../lib/types';

  // 4. Component imports
  import HeroResultRow from './HeroResultRow.svelte';
  import ResultRow from './ResultRow.svelte';
  import StartDateInput from './StartDateInput.svelte';
  import OperationRow from './OperationRow.svelte';
  import AddOperationButton from './AddOperationButton.svelte';
  import ResetButton from './ResetButton.svelte';

  // 2. Props (none for Calculator — root component)

  // 3. State
  type OperationDirection = 'add' | 'subtract';
  type OperationUnit = 'days' | 'months' | 'years';
  interface OperationRowState {
    id: number;
    direction: OperationDirection;
    amount: number;
    unit: OperationUnit;
  }

  const createDefaultOperation = (id: number): OperationRowState => ({
    id,
    direction: 'subtract',
    amount: 0,
    unit: 'days',
  });

  let wasmReady = $state(false);
  let error = $state<string | null>(null);
  let result = $state<FormattedResult | null>(null);
  let startDateInput = $state('now');
  let explicitStartDate = $state<string | null>(null);
  let isNowMode = $state(true);
  let startDateError = $state<string | null>(null);
  let nextOperationId = $state(2);
  let operations = $state<OperationRowState[]>([createDefaultOperation(1)]);

  let hasNonZeroOperation = $derived(operations.some((operation) => operation.amount > 0));
  let isLive = $derived(isNowMode && !hasNonZeroOperation);
  let showReset = $derived.by(() => {
    const firstOperation = operations[0];
    if (!firstOperation) return true;
    return (
      !isNowMode ||
      operations.length > 1 ||
      firstOperation.direction !== 'subtract' ||
      firstOperation.amount !== 0 ||
      firstOperation.unit !== 'days'
    );
  });

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

  const toWasmOperations = (rows: OperationRowState[]): Operation[] =>
    rows.map((row) => ({
      type: row.direction,
      value: row.amount,
      unit: row.unit,
    }));

  const canCalculate = () => isNowMode || (!startDateError && explicitStartDate !== null);

  const recalculate = () => {
    if (!wasmReady || !canCalculate()) return;

    try {
      const startDate = isNowMode ? new Date().toISOString() : (explicitStartDate as string);
      result = calculate(startDate, toWasmOperations(operations));
      error = null;
    } catch (e) {
      error = e instanceof Error ? e.message : 'Calculation failed';
      console.error('Calculation failed:', e);
    }
  };

  // Live-tick effect — separate from onMount init
  $effect(() => {
    if (!isLive || !wasmReady) return;

    // Check prefers-reduced-motion
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const tick = () => {
      try {
        result = calculate(new Date().toISOString(), toWasmOperations(operations));
        error = null;
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

  // 6. Event handlers
  const handleStartDateInput = (value: string) => {
    startDateInput = value;
    const trimmed = value.trim();

    if (trimmed.length === 0) {
      isNowMode = false;
      startDateError = null;
      explicitStartDate = null;
      return;
    }

    if (!wasmReady) return;

    let validation;
    try {
      validation = validateDate(trimmed);
    } catch (e) {
      isNowMode = false;
      startDateError = e instanceof Error ? e.message : 'Date validation unavailable';
      return;
    }
    if (!validation.valid) {
      isNowMode = false;
      startDateError = validation.error ?? 'Invalid date';
      return;
    }

    isNowMode = false;
    startDateError = null;
    explicitStartDate = validation.normalized ?? trimmed;
    recalculate();
  };

  const handleStartDateBlur = () => {
    if (startDateInput.trim().length > 0) return;

    startDateInput = 'now';
    explicitStartDate = null;
    startDateError = null;
    isNowMode = true;
    recalculate();
  };

  const updateOperation = (id: number, updater: (operation: OperationRowState) => OperationRowState) => {
    operations = operations.map((operation) => (operation.id === id ? updater(operation) : operation));
    recalculate();
  };

  const handleAddOperation = async () => {
    const newId = nextOperationId;
    nextOperationId += 1;
    operations = [...operations, createDefaultOperation(newId)];
    recalculate();
    await Promise.resolve();
    document.querySelector<HTMLSelectElement>(`[data-direction-id="${newId}"]`)?.focus();
  };

  const handleRemoveOperation = (id: number) => {
    if (operations.length <= 1) return;
    operations = operations.filter((operation) => operation.id !== id);
    recalculate();
  };

  const handleReset = () => {
    isNowMode = true;
    startDateInput = 'now';
    explicitStartDate = null;
    startDateError = null;
    const resetId = nextOperationId;
    nextOperationId += 1;
    operations = [createDefaultOperation(resetId)];
    recalculate();
  };
</script>

<div class="flex flex-col md:flex-row gap-6">
  <!-- Input Zone -->
  <section aria-label="Input" class="md:w-2/5 bg-gray-50 dark:bg-slate-800 rounded-md p-4 md:p-6">
    <p class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">Input</p>
    <div class="space-y-4">
      <div>
        <p class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Start Date</p>
        <StartDateInput
          value={startDateInput}
          error={startDateError}
          isNow={isNowMode}
          onInput={handleStartDateInput}
          onBlur={handleStartDateBlur}
        />
      </div>
      <div>
        <p class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Operations</p>
        <div class="space-y-2">
          {#each operations as operation (operation.id)}
            <OperationRow
              rowId={operation.id}
              direction={operation.direction}
              amount={operation.amount}
              unit={operation.unit}
              showRemove={operations.length > 1}
              onDirectionChange={(value) => updateOperation(operation.id, (op) => ({ ...op, direction: value }))}
              onAmountChange={(value) => updateOperation(operation.id, (op) => ({ ...op, amount: value }))}
              onUnitChange={(value) => updateOperation(operation.id, (op) => ({ ...op, unit: value }))}
              onRemove={() => handleRemoveOperation(operation.id)}
            />
          {/each}
          <div class="flex items-center justify-between">
            <AddOperationButton onClick={handleAddOperation} />
            {#if showReset}
              <ResetButton onClick={handleReset} />
            {/if}
          </div>
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
