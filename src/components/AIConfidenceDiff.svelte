<script lang="ts">
  import type { ConfidenceViewModel } from "../lib/aiConfidence";

  interface Props {
    open: boolean;
    model: ConfidenceViewModel | null;
    onToggle: () => void;
  }

  let { open, model, onToggle }: Props = $props();
</script>

{#if model}
  <section class="rounded-md border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3">
    <div class="flex items-center justify-between gap-2">
      <p class="text-xs text-gray-700 dark:text-gray-200">{model.summary}</p>
      <button
        type="button"
        class="text-xs rounded border border-gray-200 dark:border-slate-600 px-2 py-1"
        onclick={onToggle}
        aria-expanded={open}
      >
        {open ? "Hide confidence diff" : "Show confidence diff"}
      </button>
    </div>
    {#if open}
      <ul class="mt-2 space-y-1" aria-label="confidence diff">
        {#each model.steps as step}
          <li class="text-xs rounded border border-gray-100 dark:border-slate-700 p-2">
            <div class="flex items-center justify-between gap-2">
              <span class={step.lowConfidence ? "text-amber-700 dark:text-amber-300" : "text-gray-700 dark:text-gray-200"}>
                {step.label}
              </span>
              <span class="font-mono text-gray-600 dark:text-gray-300">{step.scoreLabel}</span>
            </div>
            <p class="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
              {step.sourceText.trim().length > 0 ? `From prompt: "${step.sourceText}"` : "From prompt: unavailable"}
            </p>
          </li>
        {/each}
      </ul>
    {/if}
  </section>
{/if}
