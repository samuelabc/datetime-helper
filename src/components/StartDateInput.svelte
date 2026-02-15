<script lang="ts">
  interface Props {
    inputId?: string;
    value: string;
    error: string | null;
    isNow: boolean;
    onInput: (value: string) => void;
    onBlur: () => void;
  }

  let { inputId = 'start-date-input', value, error, isNow, onInput, onBlur }: Props = $props();

  const handleInput = (event: Event) => {
    const target = event.currentTarget as HTMLInputElement;
    onInput(target.value);
  };

  const handleFocus = (event: FocusEvent) => {
    const target = event.currentTarget as HTMLInputElement;
    target.select();
  };

  const handleMouseUp = (event: MouseEvent) => {
    const target = event.currentTarget as HTMLInputElement;
    target.select();
    event.preventDefault();
  };
</script>

<div>
  <input
    id={inputId}
    aria-label="Start Date Input"
    type="text"
    value={value}
    oninput={handleInput}
    onfocus={handleFocus}
    onmouseup={handleMouseUp}
    onblur={onBlur}
    class={`h-11 w-full bg-white dark:bg-slate-700 border rounded-md px-3 text-sm outline-none focus:ring-2 focus:ring-orange-500 ${
      error
        ? 'border-red-400 text-red-700 dark:text-red-300'
        : isNow
          ? 'border-orange-300 text-orange-800 dark:text-orange-300'
          : 'border-gray-200 dark:border-slate-600 text-gray-900 dark:text-gray-100'
    }`}
  />
  {#if error}
    <p class="mt-1 text-xs text-red-500 dark:text-red-400">{error}</p>
  {/if}
</div>
