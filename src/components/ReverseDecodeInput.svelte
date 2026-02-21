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
    autocomplete="off"
    value={value}
    oninput={handleInput}
    placeholder="e.g. 1739634600 or 2026-02-15T14:30:00Z"
    class={`ui-input ui-input-md h-11 ${error ? "ui-input-error" : ""}`}
  />
  {#if error}
    <p class="mt-1 text-xs text-red-500 dark:text-red-400">{error}</p>
  {/if}
</div>
