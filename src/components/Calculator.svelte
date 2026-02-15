<script lang="ts">
  import { onMount } from "svelte";
  import { init, calculate, validateDate } from "../lib/wasmBridge";
  import type { FormattedResult, Operation, OperationRowState } from "../lib/types";
  import HeroResultRow from "./HeroResultRow.svelte";
  import ResultRow from "./ResultRow.svelte";
  import StartDateInput from "./StartDateInput.svelte";
  import OperationRow from "./OperationRow.svelte";
  import AddOperationButton from "./AddOperationButton.svelte";
  import ResetButton from "./ResetButton.svelte";
  import CommandPalette from "./CommandPalette.svelte";
  import ShareLinkButton from "./ShareLinkButton.svelte";
  import ReverseDecodeInput from "./ReverseDecodeInput.svelte";
  import TimezoneControls from "./TimezoneControls.svelte";
  import { detectAiAvailability, type AiAvailabilityResult } from "../lib/aiAvailability";
  import { parseNaturalLanguagePrompt, parsedOperationsToRows, NaturalLanguageParseError } from "../lib/naturalLanguageParser";
  import { AiRequestController } from "../lib/aiRequestController";
  import { encodeUrlState, decodeUrlState } from "../lib/urlState";
  import { decodeDatetimeInput, ReverseDecodeError } from "../lib/reverseDecode";
  import { applyTimezoneContext, supportsIanaTimeZones, type TimezoneMode } from "../lib/timezoneContext";
  import { applyOperationChain, SnapOperationError } from "../lib/snapOperations";

  const createDefaultOperation = (id: number): OperationRowState => ({
    id,
    direction: "subtract",
    amount: 0,
    unit: "days",
  });

  const requestController = new AiRequestController();
  const startDateInputId = "start-date-input";

  let wasmReady = $state(false);
  let baseResult = $state<FormattedResult | null>(null);
  let startDateInput = $state("now");
  let explicitStartDate = $state<string | null>(null);
  let isNowMode = $state(true);
  let startDateError = $state<string | null>(null);
  let nextOperationId = $state(2);
  let operations = $state<OperationRowState[]>([createDefaultOperation(1)]);
  let prefersReducedMotion = $state(false);
  let hydrationComplete = $state(false);
  let urlHydrationError = $state<string | null>(null);
  let engineError = $state<string | null>(null);
  let reverseDecodeError = $state<string | null>(null);

  let commandPaletteOpen = $state(false);
  let commandPaletteBusy = $state(false);
  let commandPaletteError = $state<string | null>(null);
  let aiApplyAnnouncement = $state("");
  let previousFocusedElement = $state<HTMLElement | null>(null);
  let aiAvailability = $state<AiAvailabilityResult>({ state: "unavailable", message: "Checking AI availability..." });

  let reverseMode = $state(false);
  let reverseDecodeInput = $state("");

  let timezoneMode = $state<TimezoneMode>("utc");
  let selectedIanaTimezone = $state("America/New_York");
  let ianaSupported = $state(false);
  let ianaTimezones = $state<string[]>([]);

  let hasNonZeroOperation = $derived(operations.some((operation) => operation.direction === "snap" || operation.amount > 0));
  let containsSnapOperation = $derived(operations.some((operation) => operation.direction === "snap"));
  let isLive = $derived(isNowMode && !hasNonZeroOperation && !reverseMode);
  let result = $derived(baseResult ? applyTimezoneContext(baseResult, { mode: timezoneMode, ianaTimeZone: selectedIanaTimezone }) : null);
  let shareQuery = $derived(
    encodeUrlState({
      startDateInput,
      operations,
    }),
  );
  let shareUrl = $derived.by(() => {
    if (typeof window === "undefined") return `?${shareQuery}`;
    return `${window.location.origin}${window.location.pathname}?${shareQuery}`;
  });

  let showReset = $derived.by(() => {
    const firstOperation = operations[0];
    if (!firstOperation) return true;
    return (
      !isNowMode ||
      reverseMode ||
      reverseDecodeInput.trim().length > 0 ||
      operations.length > 1 ||
      firstOperation.direction !== "subtract" ||
      firstOperation.amount !== 0 ||
      firstOperation.unit !== "days"
    );
  });

  const canCalculate = () => isNowMode || (!startDateError && explicitStartDate !== null);

  const toWasmOperations = (rows: OperationRowState[]): Operation[] =>
    rows
      .filter((row) => row.direction !== "snap")
      .map((row) => ({
        type: row.direction,
        value: row.amount,
        unit: row.unit,
      }));

  const recalculate = () => {
    if (!wasmReady || !hydrationComplete) return;

    if (reverseMode) {
      if (!reverseDecodeInput.trim()) return;
      try {
        baseResult = decodeDatetimeInput(reverseDecodeInput);
        reverseDecodeError = null;
        engineError = null;
      } catch (error) {
        reverseDecodeError = error instanceof ReverseDecodeError ? error.message : "Reverse decode failed.";
      }
      return;
    }

    if (!canCalculate()) return;

    try {
      const startDate = isNowMode ? new Date().toISOString() : (explicitStartDate as string);
      if (containsSnapOperation) {
        const finalIso = applyOperationChain(startDate, operations);
        baseResult = calculate(finalIso, []);
      } else {
        baseResult = calculate(startDate, toWasmOperations(operations));
      }
      engineError = null;
      reverseDecodeError = null;
    } catch (error) {
      engineError =
        error instanceof SnapOperationError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Calculation failed";
      console.error("Calculation failed:", error);
    }
  };

  const applyParsedStateAtomically = (
    parsedRows: OperationRowState[],
    startContext: { startDateInput: string; explicitStartDate: string | null; isNowMode: boolean } = {
      startDateInput: "now",
      explicitStartDate: null,
      isNowMode: true,
    },
  ) => {
    const previousState = {
      startDateInput,
      explicitStartDate,
      isNowMode,
      operations: [...operations],
      nextOperationId,
    };

    try {
      isNowMode = startContext.isNowMode;
      startDateInput = startContext.startDateInput;
      explicitStartDate = startContext.explicitStartDate;
      startDateError = null;
      operations = parsedRows.map((row, index) => ({ ...row, id: index + 1 }));
      nextOperationId = operations.length + 1;
      recalculate();
    } catch (error) {
      startDateInput = previousState.startDateInput;
      explicitStartDate = previousState.explicitStartDate;
      isNowMode = previousState.isNowMode;
      operations = previousState.operations;
      nextOperationId = previousState.nextOperationId;
      throw error;
    }
  };

  async function handlePaletteSubmit(prompt: string): Promise<void> {
    commandPaletteError = null;
    const handle = requestController.begin();
    commandPaletteBusy = true;

    try {
      const parsed = parseNaturalLanguagePrompt(prompt);
      const parsedRows = parsedOperationsToRows(parsed.operations);
      if (parsedRows.length === 0) {
        throw new NaturalLanguageParseError("AMBIGUOUS", "No actionable operations found.");
      }

      if (!requestController.isLatest(handle)) {
        return;
      }

      let startContext: { startDateInput: string; explicitStartDate: string | null; isNowMode: boolean } = {
        startDateInput: "now",
        explicitStartDate: null,
        isNowMode: true,
      };
      if (parsed.startDateIntent.kind === "explicit") {
        const validation = validateDate(parsed.startDateIntent.value);
        if (!validation.valid) {
          throw new NaturalLanguageParseError(
            "INVALID_OPERATION",
            validation.error ?? "AI returned an invalid explicit start date.",
          );
        }
        startContext = {
          startDateInput: parsed.startDateIntent.value,
          explicitStartDate: validation.normalized ?? parsed.startDateIntent.value,
          isNowMode: false,
        };
      }

      applyParsedStateAtomically(parsedRows, startContext);
      aiApplyAnnouncement = "Calculator steps updated from AI prompt.";
      commandPaletteOpen = false;
      if (previousFocusedElement) previousFocusedElement.focus();
    } catch (error) {
      commandPaletteError = error instanceof Error ? error.message : "Unable to parse prompt.";
    } finally {
      if (requestController.isLatest(handle)) {
        commandPaletteBusy = false;
      }
    }
  }

  onMount(async () => {
    try {
      await init();
      wasmReady = true;
      aiAvailability = detectAiAvailability();
      ianaSupported = supportsIanaTimeZones();
      if (ianaSupported && typeof Intl.supportedValuesOf === "function") {
        ianaTimezones = Intl.supportedValuesOf("timeZone").slice(0, 80);
        if (ianaTimezones.length > 0) selectedIanaTimezone = ianaTimezones[0] as string;
      }
    } catch (error) {
      engineError = error instanceof Error ? error.message : "Failed to initialize engine";
      console.error("Wasm init failed:", error);
    }

    const decoded = typeof window !== "undefined"
      ? decodeUrlState(window.location.search, {
          startDateInput: "now",
          operations: [createDefaultOperation(1)],
        })
      : { state: { startDateInput: "now", operations: [createDefaultOperation(1)] } };

    if (decoded.error) {
      urlHydrationError = decoded.error.message;
      startDateInput = "now";
      operations = [createDefaultOperation(1)];
      nextOperationId = 2;
      isNowMode = true;
      explicitStartDate = null;
      hydrationComplete = true;
      recalculate();
      return;
    }

    startDateInput = decoded.state.startDateInput || "now";
    operations = decoded.state.operations.map((operation, index) => ({ ...operation, id: index + 1 }));
    nextOperationId = operations.length + 1;

    if (startDateInput.trim().toLowerCase() === "now") {
      isNowMode = true;
      explicitStartDate = null;
    } else {
      const validation = validateDate(startDateInput.trim());
      if (validation.valid) {
        isNowMode = false;
        explicitStartDate = validation.normalized ?? startDateInput.trim();
      } else {
        startDateInput = "now";
        isNowMode = true;
        explicitStartDate = null;
        urlHydrationError = validation.error ?? "Invalid URL state. Using defaults.";
      }
    }

    hydrationComplete = true;
    recalculate();
  });

  $effect(() => {
    if (typeof window === "undefined") return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => {
      prefersReducedMotion = query.matches;
    };
    updatePreference();
    query.addEventListener("change", updatePreference);
    return () => query.removeEventListener("change", updatePreference);
  });

  $effect(() => {
    if (!aiApplyAnnouncement) return;
    const timeout = setTimeout(() => {
      aiApplyAnnouncement = "";
    }, 800);
    return () => clearTimeout(timeout);
  });

  $effect(() => {
    if (typeof window === "undefined") return;
    const onShortcut = (event: KeyboardEvent) => {
      const isK = event.key.toLowerCase() === "k";
      if (!isK) return;
      if (!(event.metaKey || event.ctrlKey)) return;
      if (event.shiftKey || event.altKey || event.defaultPrevented) return;
      const target = event.target as HTMLElement | null;
      const isEditableTarget =
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);
      if (isEditableTarget) return;
      event.preventDefault();
      previousFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      commandPaletteOpen = true;
    };
    window.addEventListener("keydown", onShortcut);
    return () => window.removeEventListener("keydown", onShortcut);
  });

  $effect(() => {
    if (!isLive || !wasmReady || !hydrationComplete) return;
    const tick = () => recalculate();
    tick();
    if (prefersReducedMotion) return;
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  });

  $effect(() => {
    if (typeof window === "undefined" || !hydrationComplete || reverseMode) return;
    const querySnapshot = shareQuery;
    const timeout = setTimeout(() => {
      const next = querySnapshot ? `${window.location.pathname}?${querySnapshot}` : window.location.pathname;
      const current = `${window.location.pathname}${window.location.search}`;
      if (current !== next) {
        history.replaceState(null, "", next);
      }
    }, 80);
    return () => clearTimeout(timeout);
  });

  const handleStartDateInput = (value: string) => {
    reverseMode = false;
    startDateInput = value;
    const trimmed = value.trim();

    if (trimmed.length === 0) {
      isNowMode = false;
      startDateError = null;
      explicitStartDate = null;
      return;
    }

    if (!wasmReady) return;
    const validation = validateDate(trimmed);
    if (!validation.valid) {
      isNowMode = false;
      startDateError = validation.error ?? "Invalid date";
      return;
    }

    isNowMode = false;
    startDateError = null;
    explicitStartDate = validation.normalized ?? trimmed;
    recalculate();
  };

  const handleStartDateBlur = () => {
    if (startDateInput.trim().length > 0) return;
    startDateInput = "now";
    explicitStartDate = null;
    startDateError = null;
    isNowMode = true;
    recalculate();
  };

  const updateOperation = (id: number, updater: (operation: OperationRowState) => OperationRowState) => {
    reverseMode = false;
    operations = operations.map((operation) => (operation.id === id ? updater(operation) : operation));
    recalculate();
  };

  const handleAddOperation = async () => {
    reverseMode = false;
    const newId = nextOperationId;
    nextOperationId += 1;
    operations = [...operations, createDefaultOperation(newId)];
    recalculate();
    await Promise.resolve();
    document.querySelector<HTMLSelectElement>(`[data-direction-id="${newId}"]`)?.focus();
  };

  const handleRemoveOperation = (id: number) => {
    reverseMode = false;
    if (operations.length <= 1) return;
    operations = operations.filter((operation) => operation.id !== id);
    recalculate();
  };

  const handleReverseDecodeInput = (value: string) => {
    reverseMode = true;
    reverseDecodeInput = value;
    recalculate();
  };

  const handleReset = () => {
    reverseMode = false;
    reverseDecodeInput = "";
    reverseDecodeError = null;
    isNowMode = true;
    startDateInput = "now";
    explicitStartDate = null;
    startDateError = null;
    const resetId = nextOperationId;
    nextOperationId += 1;
    operations = [createDefaultOperation(resetId)];
    recalculate();
  };
</script>

<CommandPalette
  open={commandPaletteOpen}
  availability={aiAvailability}
  busy={commandPaletteBusy}
  error={commandPaletteError}
  onClose={() => {
    commandPaletteOpen = false;
    if (previousFocusedElement) previousFocusedElement.focus();
  }}
  onSubmit={handlePaletteSubmit}
/>

<div class="flex flex-col md:flex-row gap-4 md:gap-5 lg:gap-6">
  <!-- Input Zone -->
  <section aria-label="Input" class="md:w-2/5 bg-gray-50 dark:bg-slate-800 rounded-md p-4 md:p-6">
    <p class="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">Input</p>
    <div class="space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
          type="button"
          aria-label="Use calculator mode"
          onclick={() => (reverseMode = false)}
          class={`h-10 rounded-md border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 ${
            reverseMode
              ? "border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200"
              : "border-orange-500 bg-orange-500 text-white"
          }`}
        >
          Calculate
        </button>
        <button
          type="button"
          aria-label="Use reverse decode mode"
          onclick={() => (reverseMode = true)}
          class={`h-10 rounded-md border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 ${
            reverseMode
              ? "border-orange-500 bg-orange-500 text-white"
              : "border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200"
          }`}
        >
          Decode
        </button>
      </div>
      {#if reverseMode}
        <ReverseDecodeInput value={reverseDecodeInput} error={reverseDecodeError} onInput={handleReverseDecodeInput} />
      {:else}
        <div>
          <label for={startDateInputId} class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
          <StartDateInput
            inputId={startDateInputId}
            value={startDateInput}
            error={startDateError}
            isNow={isNowMode}
            onInput={handleStartDateInput}
            onBlur={handleStartDateBlur}
          />
        </div>
      {/if}
      <div>
        <p class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Operations</p>
        <div class="space-y-2">
          {#each operations as operation (operation.id)}
            <OperationRow
              rowId={operation.id}
              direction={operation.direction}
              amount={operation.amount}
              unit={operation.unit}
              showRemove={operations.length > 1}
              onDirectionChange={(value) => updateOperation(operation.id, (op) => ({ ...op, direction: value }))}
              onAmountChange={(value) => updateOperation(operation.id, (op) => ({ ...op, amount: value }))}
              onUnitChange={(value) => updateOperation(operation.id, (op) => ({ ...op, unit: value }))}
              onRemove={() => handleRemoveOperation(operation.id)}
            />
          {/each}
          <div class="flex flex-wrap items-center justify-between gap-2">
            <AddOperationButton onClick={handleAddOperation} />
            {#if showReset}
              <ResetButton onClick={handleReset} />
            {/if}
          </div>
        </div>
      </div>
      <TimezoneControls
        mode={timezoneMode}
        ianaEnabled={ianaSupported}
        ianaTimeZone={selectedIanaTimezone}
        availableTimezones={ianaTimezones}
        onModeChange={(value) => {
          timezoneMode = value;
        }}
        onIanaTimeZoneChange={(value) => {
          selectedIanaTimezone = value;
        }}
      />
      <div class="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onclick={() => {
            previousFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
            commandPaletteOpen = true;
          }}
          aria-label="Open command palette"
          class="inline-flex items-center rounded-md border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:border-orange-300 dark:hover:border-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          Open command palette
        </button>
        <ShareLinkButton value={shareUrl} />
      </div>
      {#if aiAvailability.state !== "ready"}
        <p class="text-xs text-amber-700 dark:text-amber-300">
          {aiAvailability.message}
        </p>
      {/if}
    </div>
  </section>

  <!-- Output Zone -->
  <section aria-label="Results" class="md:w-3/5 min-w-0 space-y-3">
    <!-- Hero: Unix Timestamp -->
    {#if wasmReady && result}
      <HeroResultRow value={result.unixTimestamp} isLive={isLive} />
    {:else}
      <div class="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-md p-4">
        <span class="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Unix Timestamp</span>
        <p class="font-mono text-[1.6rem] sm:text-[2rem] leading-tight font-semibold text-gray-300 dark:text-gray-600 mt-1">---</p>
      </div>
    {/if}

    <!-- ISO 8601 -->
    {#if wasmReady && result}
      <ResultRow formatLabel="ISO 8601" value={result.iso8601} />
    {:else}
      <div class="bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-md p-3">
        <span class="text-xs font-medium text-gray-600 dark:text-gray-400">ISO 8601</span>
        <p class="font-mono text-base sm:text-lg break-words text-gray-300 dark:text-gray-600 mt-1">---</p>
      </div>
    {/if}

    <!-- RFC 2822 -->
    {#if wasmReady && result}
      <ResultRow formatLabel="RFC 2822" value={result.rfc2822} />
    {:else}
      <div class="bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-md p-3">
        <span class="text-xs font-medium text-gray-600 dark:text-gray-400">RFC 2822</span>
        <p class="font-mono text-base sm:text-lg break-words text-gray-300 dark:text-gray-600 mt-1">---</p>
      </div>
    {/if}

    <!-- Local Time -->
    {#if wasmReady && result}
      <ResultRow formatLabel={timezoneMode === 'utc' ? 'Local Time (UTC)' : timezoneMode === 'iana' ? `Local Time (${selectedIanaTimezone})` : 'Local Time'} value={result.localHuman} />
    {:else}
      <div class="bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-md p-3">
        <span class="text-xs font-medium text-gray-600 dark:text-gray-400">Local Time</span>
        <p class="font-mono text-base sm:text-lg break-words text-gray-300 dark:text-gray-600 mt-1">---</p>
      </div>
    {/if}

    <!-- Error state -->
    {#if engineError}
      <p class="text-sm text-red-500 dark:text-red-400 mt-2">Engine error: {engineError}</p>
    {/if}
    {#if urlHydrationError}
      <p class="text-sm text-amber-700 dark:text-amber-300 mt-2">{urlHydrationError}</p>
    {/if}
    <div class="sr-only" aria-live="polite" aria-atomic="true">{aiApplyAnnouncement}</div>
  </section>
</div>
