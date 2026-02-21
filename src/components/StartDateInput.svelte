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
  let calendarInput: HTMLInputElement | null = null;
  let useDirectTouchPicker = $state(false);

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

  const formatAsDatetimeLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const parseDateCandidate = (candidate: string): Date | null => {
    const trimmed = candidate.trim();
    if (!trimmed || trimmed.toLowerCase() === 'now') return null;

    if (/^\d+$/.test(trimmed)) {
      const parsedNumber = Number.parseInt(trimmed, 10);
      const millis = trimmed.length <= 10 ? parsedNumber * 1000 : parsedNumber;
      const unixDate = new Date(millis);
      return Number.isNaN(unixDate.getTime()) ? null : unixDate;
    }

    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const openCalendarPicker = () => {
    if (!calendarInput) return;

    const seededDate = isNow ? new Date() : (parseDateCandidate(value) ?? new Date());
    calendarInput.value = formatAsDatetimeLocal(seededDate);
    if (useDirectTouchPicker) {
      calendarInput.focus();
      return;
    }
    if (typeof calendarInput.showPicker === 'function') {
      try {
        calendarInput.showPicker();
        return;
      } catch {
        // Some browsers expose showPicker but still reject calls.
      }
    }
    calendarInput.focus();
    calendarInput.click();
  };

  const handleCalendarChange = (event: Event) => {
    const target = event.currentTarget as HTMLInputElement;
    if (!target.value) return;
    const nextDate = new Date(target.value);
    if (Number.isNaN(nextDate.getTime())) return;
    onInput(nextDate.toISOString());
  };

  $effect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mediaQuery = window.matchMedia('(pointer: coarse)');
    const updatePickerMode = () => {
      useDirectTouchPicker = mediaQuery.matches;
    };
    updatePickerMode();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', updatePickerMode);
      return () => mediaQuery.removeEventListener('change', updatePickerMode);
    }

    mediaQuery.addListener(updatePickerMode);
    return () => mediaQuery.removeListener(updatePickerMode);
  });
</script>

<div>
  <div class="relative">
    <input
      id={inputId}
      aria-label="Start Date Input"
      type="text"
      autocomplete="off"
      value={value}
      oninput={handleInput}
      onchange={handleInput}
      onfocus={handleFocus}
      onmouseup={handleMouseUp}
      onblur={onBlur}
      class={`ui-input ui-input-md h-11 pr-11 ${error ? "ui-input-error" : isNow ? "ui-input-warm" : ""}`}
    />
    <button
      type="button"
      aria-label="Open date picker"
      class="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-md border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-200 hover:border-orange-300 dark:hover:border-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
      onclick={openCalendarPicker}
    >
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" class="mx-auto h-4 w-4">
        <rect x="3" y="4.5" width="14" height="12" rx="2" stroke="currentColor" stroke-width="1.4"></rect>
        <path d="M6.5 2.8V6M13.5 2.8V6M3 7.3H17" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"></path>
      </svg>
    </button>
    <input
      bind:this={calendarInput}
      tabindex="-1"
      aria-hidden={!useDirectTouchPicker}
      aria-label="Choose start date and time"
      type="datetime-local"
      class={`absolute ${
        useDirectTouchPicker
          ? 'right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 z-10 opacity-0 cursor-pointer'
          : 'h-0 w-0 opacity-0 pointer-events-none'
      }`}
      oninput={handleCalendarChange}
      onchange={handleCalendarChange}
    />
  </div>
  <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Supports "now", ISO 8601, Unix, or calendar selection.</p>
  {#if error}
    <p class="mt-1 text-xs text-red-500 dark:text-red-400">{error}</p>
  {/if}
</div>
