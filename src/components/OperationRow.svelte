<script lang="ts">
  import type { OperationDirection, OperationUnit, SnapUnit } from '../lib/types';

  type RowUnit = OperationUnit | SnapUnit;

  interface Props {
    rowId: number;
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
    direction,
    amount,
    unit,
    showRemove = false,
    onDirectionChange,
    onAmountChange,
    onUnitChange,
    onRemove,
  }: Props = $props();

  const handleDirectionChange = (event: Event) => {
    const target = event.currentTarget as HTMLSelectElement;
    if (target.value === 'add' || target.value === 'subtract' || target.value === 'snap') {
      onDirectionChange(target.value);
      return;
    }
    const value: OperationDirection = 'subtract';
    onDirectionChange(value);
  };

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

  const handleUnitChange = (event: Event) => {
    const target = event.currentTarget as HTMLSelectElement;
    const value = target.value as RowUnit;
    onUnitChange(value);
  };

  const directionId = $derived(`operation-${rowId}-direction`);
  const amountId = $derived(`operation-${rowId}-amount`);
  const unitId = $derived(`operation-${rowId}-unit`);
</script>

<div class="bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-md p-3">
  <div class="grid grid-cols-2 sm:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)_auto] gap-2 items-center">
    <label class="sr-only" for={directionId}>Direction</label>
    <select
      id={directionId}
      aria-label="Direction"
      data-direction-id={rowId}
      value={direction}
      oninput={handleDirectionChange}
      onchange={handleDirectionChange}
      class="h-11 w-16 sm:w-auto rounded-md border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
    >
      <option value="subtract">-</option>
      <option value="add">+</option>
      <option value="snap">snap</option>
    </select>

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
        class="h-11 min-w-0 rounded-md border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
      />
    {:else}
      <input
        id={amountId}
        aria-label="Amount"
        type="text"
        value="1"
        disabled
        class="h-11 min-w-0 rounded-md border border-gray-200 dark:border-slate-600 bg-gray-100 dark:bg-slate-800 px-2 text-sm text-gray-500 dark:text-gray-400"
      />
    {/if}

    <label class="sr-only" for={unitId}>Unit</label>
    <select
      id={unitId}
      aria-label="Unit"
      value={unit}
      oninput={handleUnitChange}
      onchange={handleUnitChange}
      class="h-11 rounded-md border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
    >
      {#if direction === 'snap'}
        <option value="startOfDay">startOfDay</option>
        <option value="endOfDay">endOfDay</option>
        <option value="startOfMonth">startOfMonth</option>
        <option value="endOfMonth">endOfMonth</option>
      {:else}
        <option value="days">days</option>
        <option value="months">months</option>
        <option value="years">years</option>
        <option value="hours">hours</option>
        <option value="minutes">minutes</option>
        <option value="seconds">seconds</option>
      {/if}
    </select>

    {#if showRemove}
      <button
        type="button"
        aria-label="Remove operation"
        onclick={() => onRemove?.()}
        class="col-span-2 sm:col-span-1 h-11 rounded-md px-3 text-sm sm:text-xs font-medium text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-orange-500"
      >
        Remove
      </button>
    {/if}
  </div>
</div>
