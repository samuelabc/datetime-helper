<script lang="ts">
  interface Props {
    value: string;
    error: string | null;
    isNow: boolean;
    onInput: (value: string) => void;
    onBlur: () => void;
  }

  let { value, error, isNow, onInput, onBlur }: Props = $props();

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
    aria-label="Start Date Input"
    type="text"
    value={value}
    oninput={handleInput}
    onfocus={handleFocus}
    onmouseup={handleMouseUp}
    onblur={onBlur}
    class={`w-full bg-white dark:bg-slate-700 border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400 ${
      error
        ? 'border-red-400 text-red-700 dark:text-red-300'
        : isNow
          ? 'border-orange-300 text-orange-500 dark:text-orange-400'
          : 'border-gray-200 dark:border-slate-600 text-gray-900 dark:text-gray-100'
    }`}
  />
  {#if error}
    <p class="mt-1 text-xs text-red-500 dark:text-red-400">{error}</p>
  {/if}
</div>
