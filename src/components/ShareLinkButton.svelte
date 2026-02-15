<script lang="ts">
  import { copyToClipboard } from "../lib/clipboard";

  interface Props {
    value: string;
  }

  let { value }: Props = $props();
  let copied = $state(false);
  let announcement = $state("");
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  async function handleCopy() {
    const success = await copyToClipboard(value);
    if (!success) return;

    if (timeoutId) clearTimeout(timeoutId);
    copied = true;
    announcement = "Share link copied to clipboard.";
    timeoutId = setTimeout(() => {
      copied = false;
      announcement = "";
      timeoutId = null;
    }, 1200);
  }
</script>

<button
  type="button"
  onclick={handleCopy}
  aria-label="Copy share link"
  class="inline-flex items-center gap-2 rounded-md border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:border-orange-300 dark:hover:border-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 motion-reduce:transition-none"
>
  {copied ? "Copied share link!" : "Copy share link"}
</button>
<span class="sr-only" aria-live="assertive" aria-atomic="true">{announcement}</span>
