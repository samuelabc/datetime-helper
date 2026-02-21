<script lang="ts">
  import CustomSelect from './CustomSelect.svelte';
  import type { OperationDirection, OperationUnit, SnapUnit } from '../lib/types';

  type RowUnit = OperationUnit | SnapUnit;

  interface Props {
    rowId: number;
    rowIndex: number;
    direction: OperationDirection;
    amount: number;
    unit: RowUnit;
    showRemove?: boolean;
    onDirectionChange: (value: OperationDirection) => void;
    onAmountChange: (value: number) => void;
    onUnitChange: (value: RowUnit) => void;
    onRemove?: () => void;
  }

  let {
    rowId,
    rowIndex,
    direction,
    amount,
    unit,
    showRemove = false,
    onDirectionChange,
    onAmountChange,
    onUnitChange,
    onRemove,
  }: Props = $props();

  const directionOptions = [
    { value: 'subtract', label: 'Subtract' },
    { value: 'add', label: 'Add' },
    { value: 'snap', label: 'Snap' },
  ] as const;

  const timedUnitOptions = [
    { value: 'days', label: 'Days' },
    { value: 'months', label: 'Months' },
    { value: 'years', label: 'Years' },
    { value: 'hours', label: 'Hours' },
    { value: 'minutes', label: 'Minutes' },
    { value: 'seconds', label: 'Seconds' },
  ] as const;

  const snapUnitOptions = [
    { value: 'startOfDay', label: 'Start of day' },
    { value: 'endOfDay', label: 'End of day' },
    { value: 'startOfMonth', label: 'Start of month' },
    { value: 'endOfMonth', label: 'End of month' },
  ] as const;

  const handleAmountChange = (event: Event) => {
    const target = event.currentTarget as HTMLInputElement;
    const raw = target.value.trim();

    if (raw === '') {
      onAmountChange(0);
      return;
    }

    if (!/^\d+$/.test(raw)) {
      target.value = String(amount);
      return;
    }

    onAmountChange(Number.parseInt(raw, 10));
  };

  const handleUnitChange = (value: string) => {
    const nextValue = value as RowUnit;
    onUnitChange(nextValue);
  };

  const unitOptions = $derived(
    direction === 'snap'
      ? [...snapUnitOptions]
      : [...timedUnitOptions],
  );

  const handleDirectionUnitConsistency = (nextDirection: OperationDirection) => {
    const nextUnitOptions = nextDirection === 'snap' ? snapUnitOptions : timedUnitOptions;
    if (!nextUnitOptions.some((option) => option.value === unit)) {
      const fallbackUnit = nextUnitOptions[0]?.value;
      if (fallbackUnit) {
        onUnitChange(fallbackUnit as RowUnit);
      }
    }
  };

  const handleDirectionSelection = (value: string) => {
    if (value !== 'add' && value !== 'subtract' && value !== 'snap') {
      const fallbackDirection: OperationDirection = 'subtract';
      onDirectionChange(fallbackDirection);
      handleDirectionUnitConsistency(fallbackDirection);
      return;
    }

    onDirectionChange(value);
    handleDirectionUnitConsistency(value);
  };

  const directionId = $derived(`operation-${rowId}-direction`);
  const amountId = $derived(`operation-${rowId}-amount`);
  const unitId = $derived(`operation-${rowId}-unit`);
</script>

<div class="py-1">
  <div class="grid grid-cols-1 sm:grid-cols-[auto,minmax(0,2fr),minmax(0,1fr),minmax(0,2fr),auto] gap-1.5 items-center">
    <span
      class="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-gray-100 dark:bg-slate-600 px-2 text-xs font-semibold text-gray-700 dark:text-gray-100"
      aria-label={`Step ${rowIndex + 1}`}
    >
      {rowIndex + 1}
    </span>

    <label class="sr-only" for={directionId}>Direction</label>
    <div class="ui-select-shell">
      <CustomSelect
        id={directionId}
        ariaLabel="Direction"
        dataDirectionId={rowId}
        value={direction}
        sizeClass="ui-select-sm"
        heightClass="h-9"
        options={directionOptions.map((option) => ({ ...option }))}
        onChange={handleDirectionSelection}
      />
    </div>

    <label class="sr-only" for={amountId}>Amount</label>
    {#if direction !== 'snap'}
      <input
        id={amountId}
        aria-label="Amount"
        type="text"
        inputmode="numeric"
        pattern="[0-9]*"
        value={String(amount)}
        oninput={handleAmountChange}
        onchange={handleAmountChange}
        class="ui-input ui-input-sm h-9 min-w-0"
      />
    {:else}
      <div
        id={amountId}
        aria-label="Amount not applicable for snap"
        class="inline-flex h-9 items-center rounded-md border border-gray-200 dark:border-slate-600 bg-gray-100 dark:bg-slate-800 px-2 text-xs font-medium text-gray-500 dark:text-gray-400"
      >
        N/A
      </div>
    {/if}

    <label class="sr-only" for={unitId}>Unit</label>
    <div class="ui-select-shell">
      <CustomSelect
        id={unitId}
        ariaLabel="Unit"
        value={unit}
        sizeClass="ui-select-sm"
        heightClass="h-9"
        options={unitOptions.map((option) => ({ ...option }))}
        onChange={handleUnitChange}
      />
    </div>

    {#if showRemove}
      <button
        type="button"
        aria-label="Remove operation"
        onclick={() => onRemove?.()}
        class="inline-flex h-9 w-9 items-center justify-center rounded-md text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
        title={`Remove step ${rowIndex + 1}`}
      >
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" class="h-4 w-4">
          <path d="M5.5 5.5l9 9m0-9l-9 9" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"></path>
        </svg>
      </button>
    {/if}
  </div>

  {#if direction === 'snap'}
    <p class="mt-1 pl-8 text-[11px] text-gray-500 dark:text-gray-400">Snap ignores amount and jumps to boundary.</p>
  {/if}
</div>
