<script lang="ts">
  interface Props {
    value: string;
    error: string | null;
    onInput: (value: string) => void;
  }

  let { value, error, onInput }: Props = $props();

  function handleInput(event: Event) {
    onInput((event.currentTarget as HTMLInputElement).value);
  }
</script>

<div>
  <label for="reverse-decode-input" class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
    Reverse decode input (Unix or ISO 8601)
  </label>
  <input
    id="reverse-decode-input"
    aria-label="Reverse decode input"
    type="text"
    value={value}
    oninput={handleInput}
    placeholder="e.g. 1739634600 or 2026-02-15T14:30:00Z"
    class={`h-11 w-full bg-white dark:bg-slate-700 border rounded-md px-3 text-sm outline-none focus:ring-2 focus:ring-orange-500 ${
      error
        ? "border-red-400 text-red-700 dark:text-red-300"
        : "border-gray-200 dark:border-slate-600 text-gray-900 dark:text-gray-100"
    }`}
  />
  {#if error}
    <p class="mt-1 text-xs text-red-500 dark:text-red-400">{error}</p>
  {/if}
</div>
