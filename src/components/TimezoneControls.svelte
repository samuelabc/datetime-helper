<script lang="ts">
  import type { TimezoneMode } from "../lib/timezoneContext";

  interface Props {
    mode: TimezoneMode;
    ianaEnabled: boolean;
    ianaTimeZone: string;
    availableTimezones: string[];
    onModeChange: (mode: TimezoneMode) => void;
    onIanaTimeZoneChange: (value: string) => void;
  }

  let { mode, ianaEnabled, ianaTimeZone, availableTimezones, onModeChange, onIanaTimeZoneChange }: Props = $props();

  function handleModeChange(event: Event) {
    const value = (event.currentTarget as HTMLSelectElement).value as TimezoneMode;
    onModeChange(value);
  }

  function handleIanaChange(event: Event) {
    onIanaTimeZoneChange((event.currentTarget as HTMLSelectElement).value);
  }
</script>

<div class="space-y-2">
  <label for="timezone-mode" class="block text-xs font-medium text-gray-700 dark:text-gray-300">Timezone display</label>
  <select
    id="timezone-mode"
    aria-label="Timezone mode"
    value={mode}
    oninput={handleModeChange}
    class="h-11 w-full rounded-md border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
  >
    <option value="utc">UTC</option>
    <option value="local">Local</option>
    {#if ianaEnabled}
      <option value="iana">IANA timezone</option>
    {/if}
  </select>

  {#if mode === "iana" && ianaEnabled}
    <select
      aria-label="IANA timezone"
      value={ianaTimeZone}
      oninput={handleIanaChange}
      class="h-11 w-full rounded-md border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
    >
      {#each availableTimezones as timezone}
        <option value={timezone}>{timezone}</option>
      {/each}
    </select>
  {/if}
</div>
