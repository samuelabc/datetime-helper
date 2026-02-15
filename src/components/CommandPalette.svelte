<script lang="ts">
  import { onDestroy } from "svelte";
  import type { AiAvailabilityResult } from "../lib/aiAvailability";

  interface Props {
    open: boolean;
    availability: AiAvailabilityResult;
    busy: boolean;
    error: string | null;
    onClose: () => void;
    onSubmit: (prompt: string) => Promise<void>;
  }

  let { open, availability, busy, error, onClose, onSubmit }: Props = $props();
  let prompt = $state("");
  let panelRef = $state<HTMLDivElement | null>(null);
  let inputRef = $state<HTMLInputElement | null>(null);

  async function handleSubmit(event: Event) {
    event.preventDefault();
    await onSubmit(prompt);
  }

  function focusTrap(event: KeyboardEvent) {
    if (!open || event.key !== "Tab" || !panelRef) return;
    const focusable = panelRef.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }

  $effect(() => {
    if (!open) return;
    const raf = requestAnimationFrame(() => inputRef?.focus());
    return () => cancelAnimationFrame(raf);
  });

  function onKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }
    focusTrap(event);
  }

  onDestroy(() => {
    prompt = "";
  });
</script>

{#if open}
  <div
    class="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] motion-safe:transition-opacity motion-reduce:transition-none"
    role="presentation"
    onclick={(event) => {
      if (event.currentTarget === event.target) onClose();
    }}
  >
    <div
      bind:this={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label="AI command palette"
      tabindex="-1"
      class="mx-auto mt-20 w-[min(92vw,680px)] rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-xl"
      onkeydown={onKeydown}
    >
      <form onsubmit={handleSubmit} class="space-y-3">
        <label for="command-palette-input" class="block text-xs font-medium text-gray-700 dark:text-gray-300">
          Describe your datetime intent
        </label>
        <input
          bind:this={inputRef}
          id="command-palette-input"
          aria-label="Command palette prompt"
          type="text"
          bind:value={prompt}
          placeholder="e.g. 6 months ago from now then add 3 days"
          class="h-11 w-full rounded-md border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />

        <p
          class={`text-xs ${
            availability.state === "ready"
              ? "text-green-700 dark:text-green-300"
              : "text-amber-700 dark:text-amber-300"
          }`}
        >
          {availability.state === "ready" ? "AI ready" : availability.message ?? "AI unavailable"}
        </p>

        {#if error}
          <p class="text-xs text-red-600 dark:text-red-300">{error}</p>
        {/if}

        <div class="flex items-center justify-end gap-2">
          <button
            type="button"
            onclick={onClose}
            class="h-10 rounded-md border border-gray-200 dark:border-slate-600 px-3 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            Close
          </button>
          <button
            type="submit"
            disabled={availability.state !== "ready" || busy}
            class="h-10 rounded-md border border-orange-500 bg-orange-500 px-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            {busy ? "Applying..." : "Apply"}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
