<script lang="ts">
  import { onMount } from "svelte";
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
  let rootElement: HTMLDivElement | null = null;
  let searchValue = $state("");
  let ianaListOpen = $state(false);
  let activeOptionIndex = $state(0);

  const localTimezone = $derived.by(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone ?? null;
    } catch {
      return null;
    }
  });

  const normalizedTimezones = $derived.by(() => {
    const unique = new Set(availableTimezones);
    return Array.from(unique);
  });

  const filteredIanaOptions = $derived.by(() => {
    const query = searchValue.trim().toLowerCase();
    const local = localTimezone;
    const includeLocal =
      !!local &&
      normalizedTimezones.includes(local) &&
      (query.length === 0 || local.toLowerCase().includes(query));
    const matches = normalizedTimezones.filter((timezone) => {
      if (timezone === local) return false;
      return query.length === 0 || timezone.toLowerCase().includes(query);
    });

    return [
      ...(includeLocal ? [{ value: local as string, label: `Local (${local})` }] : []),
      ...matches.map((timezone) => ({ value: timezone, label: timezone })),
    ];
  });

  function handleModeButtonClick(nextMode: TimezoneMode) {
    onModeChange(nextMode);
  }

  function selectTimezone(nextValue: string) {
    onIanaTimeZoneChange(nextValue);
    searchValue = nextValue;
    ianaListOpen = false;
  }

  function handleSearchInput(event: Event) {
    searchValue = (event.currentTarget as HTMLInputElement).value;
    ianaListOpen = true;
    activeOptionIndex = 0;
  }

  function handleSearchFocus() {
    ianaListOpen = true;
    if (!searchValue.trim()) {
      searchValue = ianaTimeZone;
    }
    activeOptionIndex = 0;
  }

  function handleSearchKeydown(event: KeyboardEvent) {
    if (!ianaListOpen && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      ianaListOpen = true;
      activeOptionIndex = 0;
      event.preventDefault();
      return;
    }

    if (event.key === "ArrowDown") {
      if (filteredIanaOptions.length === 0) return;
      activeOptionIndex = Math.min(activeOptionIndex + 1, filteredIanaOptions.length - 1);
      event.preventDefault();
      return;
    }

    if (event.key === "ArrowUp") {
      if (filteredIanaOptions.length === 0) return;
      activeOptionIndex = Math.max(activeOptionIndex - 1, 0);
      event.preventDefault();
      return;
    }

    if (event.key === "Enter") {
      const selected = filteredIanaOptions[activeOptionIndex];
      if (selected) {
        selectTimezone(selected.value);
        event.preventDefault();
      }
      return;
    }

    if (event.key === "Escape") {
      ianaListOpen = false;
      searchValue = ianaTimeZone;
      event.preventDefault();
    }
  }

  $effect(() => {
    if (!ianaListOpen) searchValue = ianaTimeZone;
  });

  $effect(() => {
    if (mode !== "iana") ianaListOpen = false;
  });

  onMount(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!rootElement) return;
      const target = event.target as Node | null;
      if (!target || rootElement.contains(target)) return;
      ianaListOpen = false;
      searchValue = ianaTimeZone;
    };
    window.addEventListener("mousedown", onPointerDown);
    return () => window.removeEventListener("mousedown", onPointerDown);
  });
</script>

<div class="space-y-2" bind:this={rootElement}>
  <p class="block text-xs font-medium text-gray-700 dark:text-gray-300">Timezone display</p>
  <div class="grid grid-cols-3 gap-2">
    <button
      type="button"
      aria-label="Timezone mode UTC"
      onclick={() => handleModeButtonClick("utc")}
      class={`h-10 rounded-md border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors cursor-pointer ${
        mode === "utc"
          ? "border-orange-500 bg-orange-500 text-white"
          : "border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 hover:border-orange-300 dark:hover:border-orange-600"
      }`}
    >
      UTC
    </button>
    <button
      type="button"
      aria-label="Timezone mode Local"
      onclick={() => handleModeButtonClick("local")}
      class={`h-10 rounded-md border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors cursor-pointer ${
        mode === "local"
          ? "border-orange-500 bg-orange-500 text-white"
          : "border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 hover:border-orange-300 dark:hover:border-orange-600"
      }`}
    >
      Local
    </button>
    <button
      type="button"
      aria-label="Timezone mode IANA"
      disabled={!ianaEnabled}
      onclick={() => handleModeButtonClick("iana")}
      class={`h-10 rounded-md border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
        mode === "iana"
          ? "border-orange-500 bg-orange-500 text-white"
          : "border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 hover:border-orange-300 dark:hover:border-orange-600"
      }`}
    >
      IANA
    </button>
  </div>

  {#if mode === "iana" && ianaEnabled}
    {#if localTimezone}
      <p class="text-xs text-gray-600 dark:text-gray-300">
        Detected local timezone: <span class="font-mono">{localTimezone}</span>
      </p>
    {/if}
    <div class="relative">
      <input
        aria-label="IANA timezone"
        role="combobox"
        aria-expanded={ianaListOpen}
        aria-controls="iana-timezone-list"
        aria-autocomplete="list"
        aria-activedescendant={filteredIanaOptions[activeOptionIndex] ? `iana-option-${activeOptionIndex}` : undefined}
        value={searchValue}
        oninput={handleSearchInput}
        onfocus={handleSearchFocus}
        onkeydown={handleSearchKeydown}
        class="ui-input ui-input-md h-11"
        placeholder="Search timezone (e.g. Asia, New_York, UTC)"
      />
      {#if ianaListOpen}
        <ul
          id="iana-timezone-list"
          role="listbox"
          class="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-md border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-lg"
        >
          {#if filteredIanaOptions.length === 0}
            <li class="px-3 py-2 text-sm text-gray-500 dark:text-gray-300">No timezone matches "{searchValue}".</li>
          {:else}
            {#each filteredIanaOptions as option, index}
              <li role="option" aria-selected={option.value === ianaTimeZone} id={`iana-option-${index}`}>
                <button
                  type="button"
                  class={`w-full px-3 py-2 text-left text-sm transition-colors cursor-pointer ${
                    index === activeOptionIndex
                      ? "bg-orange-50 dark:bg-orange-900/30 text-gray-900 dark:text-gray-100"
                      : "text-gray-800 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-orange-900/30"
                  }`}
                  onclick={() => selectTimezone(option.value)}
                >
                  {option.label}
                </button>
              </li>
            {/each}
          {/if}
        </ul>
      {/if}
    </div>
  {/if}
</div>
