<script lang="ts">
  type OperationDirection = 'add' | 'subtract';
  type OperationUnit = 'days' | 'months' | 'years';

  interface Props {
    rowId: number;
    direction: OperationDirection;
    amount: number;
    unit: OperationUnit;
    showRemove?: boolean;
    onDirectionChange: (value: OperationDirection) => void;
    onAmountChange: (value: number) => void;
    onUnitChange: (value: OperationUnit) => void;
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
    const value = target.value === 'add' ? 'add' : 'subtract';
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
    const value = target.value === 'months' || target.value === 'years' ? target.value : 'days';
    onUnitChange(value);
  };
</script>

<div class="bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-md p-3">
  <div class="grid grid-cols-[auto_1fr_1fr_auto] gap-2 items-center">
    <select
      aria-label="Direction"
      data-direction-id={rowId}
      value={direction}
      oninput={handleDirectionChange}
      class="h-9 rounded-md border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-2 text-sm text-gray-900 dark:text-gray-100"
    >
      <option value="subtract">-</option>
      <option value="add">+</option>
    </select>

    <input
      aria-label="Amount"
      type="text"
      inputmode="numeric"
      pattern="[0-9]*"
      value={String(amount)}
      oninput={handleAmountChange}
      class="h-9 rounded-md border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-2 text-sm text-gray-900 dark:text-gray-100"
    />

    <select
      aria-label="Unit"
      value={unit}
      oninput={handleUnitChange}
      class="h-9 rounded-md border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-2 text-sm text-gray-900 dark:text-gray-100"
    >
      <option value="days">days</option>
      <option value="months">months</option>
      <option value="years">years</option>
    </select>

    {#if showRemove}
      <button
        type="button"
        aria-label="Remove operation"
        onclick={() => onRemove?.()}
        class="h-9 rounded-md px-2 text-xs font-medium text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-orange-400"
      >
        Remove
      </button>
    {/if}
  </div>
</div>
