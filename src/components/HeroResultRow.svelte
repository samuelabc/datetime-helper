<script lang="ts">
  // 1. Imports
  import CopyButton from './CopyButton.svelte';

  // 2. Props
  interface Props {
    valueMs: number;
    isLive: boolean;
    paused?: boolean;
    onPauseChange?: (paused: boolean, event: FocusEvent | null) => void;
  }
  let { valueMs, isLive, paused = false, onPauseChange = () => {} }: Props = $props();
  const labelId = 'unix-timestamp-label';
  const valueId = 'unix-timestamp-value';

  // 3. State — for screen reader throttle
  let lastAnnouncedValue = $state(0);
  let lastAnnouncementAtMs = $state(0);
  let pendingAnnouncement = $state<number | null>(null);

  // 4. Derived values
  // Whether to show the live indicator (respects prefers-reduced-motion)
  let showLiveIndicator = $derived.by(() => {
    if (typeof window === 'undefined') return isLive;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    return isLive && !reducedMotion.matches;
  });
  let unixMilliseconds = $derived(Math.trunc(valueMs));
  let unixSeconds = $derived(Math.floor(unixMilliseconds / 1000));

  // 5. Effects
  // Throttle screen reader announcements to every 10 seconds (NFR11).
  $effect(() => {
    if (!isLive) {
      lastAnnouncedValue = unixMilliseconds;
      pendingAnnouncement = null;
      lastAnnouncementAtMs = Date.now();
      return;
    }

    if (lastAnnouncementAtMs === 0) {
      lastAnnouncedValue = unixMilliseconds;
      lastAnnouncementAtMs = Date.now();
      return;
    }

    const now = Date.now();
    const elapsed = now - lastAnnouncementAtMs;
    if (elapsed >= 10000) {
      lastAnnouncedValue = unixMilliseconds;
      pendingAnnouncement = null;
      lastAnnouncementAtMs = now;
      return;
    }

    pendingAnnouncement = unixMilliseconds;
    const timeout = setTimeout(() => {
      if (pendingAnnouncement !== null) {
        lastAnnouncedValue = pendingAnnouncement;
        pendingAnnouncement = null;
        lastAnnouncementAtMs = Date.now();
      }
    }, 10000 - elapsed);

    return () => clearTimeout(timeout);
  });
</script>

<div
  role="group"
  aria-labelledby={labelId}
  aria-describedby={valueId}
  class="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-md p-4"
  onmouseenter={() => onPauseChange(true, null)}
  onmouseleave={() => onPauseChange(false, null)}
  onfocusin={(event) => onPauseChange(true, event)}
  onfocusout={(event) => onPauseChange(false, event)}
>
  <div class="flex items-center justify-between">
    <span id={labelId} class="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Unix Timestamp (ms)</span>
    {#if showLiveIndicator}
      <span class="flex items-center gap-1 text-xs font-medium text-orange-700 dark:text-orange-300">
        <span
          class={`inline-block w-2 h-2 rounded-full bg-orange-700 dark:bg-orange-300 ${paused ? '' : 'live-dot-breathe'}`}
        ></span>
        {paused ? "live (paused)" : "live"}
      </span>
    {/if}
  </div>
  <div class="flex flex-wrap sm:flex-nowrap items-start sm:items-center justify-between gap-3 mt-1 min-w-0">
    <p id={valueId} class="min-w-0 break-all font-mono text-[1.6rem] sm:text-[2rem] leading-tight font-semibold text-gray-900 dark:text-gray-100 select-text">
      {unixMilliseconds}
    </p>
    <CopyButton value={String(unixMilliseconds)} formatLabel="Unix Timestamp (milliseconds)" variant="hero" label="Copy ms" />
  </div>
  <div class="mt-2 flex flex-wrap items-center gap-2 min-w-0">
    <span class="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Seconds</span>
    <p class="min-w-0 break-all font-mono text-sm sm:text-base text-gray-800 dark:text-gray-200 select-text">{unixSeconds}</p>
    <CopyButton value={String(unixSeconds)} formatLabel="Unix Timestamp (seconds)" label="Copy s" />
  </div>
  <!-- Screen reader live region — throttled to max once per 10 seconds -->
  <div class="sr-only" aria-live="polite" aria-atomic="true">
    Unix Timestamp in milliseconds: {lastAnnouncedValue}
  </div>
</div>

<style>
  .live-dot-breathe {
    animation: live-dot-breathe 2.8s ease-in-out infinite;
    transform-origin: center;
  }

  @keyframes live-dot-breathe {
    0%,
    100% {
      opacity: 0.7;
      transform: scale(0.95);
    }
    50% {
      opacity: 1;
      transform: scale(1.05);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .live-dot-breathe {
      animation: none;
    }
  }
</style>
