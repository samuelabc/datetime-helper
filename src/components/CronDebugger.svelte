<script lang="ts">
  import CustomSelect from "./CustomSelect.svelte";
  import type { CronReferenceTimezone, CronRunInstant } from "../lib/cronDebugger";

  interface Props {
    open: boolean;
    expression: string;
    timezone: CronReferenceTimezone;
    error: string | null;
    runs: CronRunInstant[];
    onToggle: () => void;
    onExpressionInput: (value: string) => void;
    onTimezoneInput: (value: CronReferenceTimezone) => void;
    onUseRun: (iso: string) => void;
  }

  let { open, expression, timezone, error, runs, onToggle, onExpressionInput, onTimezoneInput, onUseRun }: Props = $props();

  const timezoneOptions = [
    { value: "UTC", label: "UTC" },
    { value: "LOCAL", label: "Local" },
  ] as const;

  async function copyValue(value: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Fall back quietly to preserve non-blocking behavior.
      const input = document.createElement("input");
      input.value = value;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
  }
</script>

<section class="rounded-md border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3">
  <div class="flex items-center justify-between gap-2">
    <p class="text-xs font-medium text-gray-700 dark:text-gray-200">Cron debugger</p>
    <button type="button" class="text-xs rounded border border-gray-200 dark:border-slate-600 px-2 py-1" onclick={onToggle}>
      {open ? "Hide" : "Show"}
    </button>
  </div>
  {#if open}
    <div class="mt-2 space-y-2">
      <input
        aria-label="Cron expression"
        autocomplete="off"
        value={expression}
        oninput={(event) => onExpressionInput((event.currentTarget as HTMLInputElement).value)}
        class="ui-input ui-input-sm h-9"
        placeholder="*/15 * * * *"
      />
      <label class="block text-xs text-gray-600 dark:text-gray-300">
        Reference timezone
        <div class="ui-select-shell mt-1">
          <CustomSelect
            ariaLabel="Cron timezone"
            value={timezone}
            options={timezoneOptions.map((option) => ({ ...option }))}
            sizeClass="ui-select-sm"
            heightClass="h-9"
            onChange={(value) => onTimezoneInput(value as CronReferenceTimezone)}
          />
        </div>
      </label>
      {#if error}
        <p class="text-xs text-red-600 dark:text-red-300">{error}</p>
      {/if}
      <ul class="space-y-1">
        {#each runs as run}
          <li class="text-xs rounded border border-gray-100 dark:border-slate-700 p-2">
            <div class="font-mono text-gray-700 dark:text-gray-200 break-all">{run.iso}</div>
            <div class="mt-1 font-mono text-gray-600 dark:text-gray-300">Unix: {run.unixTimestamp}</div>
            <div class="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                class="rounded border border-gray-200 dark:border-slate-600 px-2 py-1"
                onclick={() => onUseRun(run.iso)}
              >
                Use this run
              </button>
              <button
                type="button"
                class="rounded border border-gray-200 dark:border-slate-600 px-2 py-1"
                onclick={() => copyValue(run.iso)}
              >
                Copy ISO
              </button>
              <button
                type="button"
                class="rounded border border-gray-200 dark:border-slate-600 px-2 py-1"
                onclick={() => copyValue(String(run.unixTimestamp))}
              >
                Copy Unix
              </button>
            </div>
          </li>
        {/each}
      </ul>
    </div>
  {/if}
</section>
