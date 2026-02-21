<script lang="ts">
  import type { AiSettings } from "../lib/aiSettings";

  interface Props {
    settings: AiSettings;
    onSave: (next: AiSettings) => void;
    onClearKey: () => void;
  }

  let { settings, onSave, onClearKey }: Props = $props();
  let keyInput = $state("");

  $effect(() => {
    keyInput = settings.geminiApiKey ?? "";
  });
</script>

<section class="rounded-md border border-gray-200 dark:border-slate-700 p-3 bg-gray-50 dark:bg-slate-800/60">
  <p class="text-xs font-medium text-gray-700 dark:text-gray-200 mb-2">AI Settings</p>
  <label for="gemini-key" class="block text-xs text-gray-600 dark:text-gray-300 mb-1">Optional Gemini API key</label>
  <input
    id="gemini-key"
    type="password"
    autocomplete="new-password"
    value={keyInput}
    oninput={(event) => {
      keyInput = (event.currentTarget as HTMLInputElement).value;
    }}
    class="ui-input ui-input-sm h-9"
    placeholder="AIza..."
  />
  <p class="mt-1 text-[11px] text-gray-500 dark:text-gray-400">Stored locally on this device only.</p>
  <div class="mt-2 flex items-center gap-2">
    <button
      type="button"
      class="text-xs rounded border border-gray-200 dark:border-slate-600 px-2 py-1"
      onclick={() =>
        onSave({
          ...settings,
          geminiApiKey: keyInput.trim().length > 0 ? keyInput.trim() : null,
        })}
    >
      Save key
    </button>
    <button type="button" class="text-xs rounded border border-gray-200 dark:border-slate-600 px-2 py-1" onclick={onClearKey}>
      Clear key
    </button>
  </div>
  <div class="mt-2 space-y-1 text-xs">
    <label class="inline-flex items-center gap-2">
      <input
        type="checkbox"
        checked={settings.allowPromptPersistence}
        onchange={(event) =>
          onSave({
            ...settings,
            allowPromptPersistence: (event.currentTarget as HTMLInputElement).checked,
          })}
      />
      Allow prompt persistence (off by default)
    </label>
    <label class="inline-flex items-center gap-2">
      <input
        type="checkbox"
        checked={settings.telemetryEnabled}
        onchange={(event) =>
          onSave({
            ...settings,
            telemetryEnabled: (event.currentTarget as HTMLInputElement).checked,
          })}
      />
      Enable diagnostics telemetry (metadata only)
    </label>
  </div>
</section>
