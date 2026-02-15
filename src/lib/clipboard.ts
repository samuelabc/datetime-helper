/**
 * Copy text to clipboard using the Clipboard API with execCommand fallback.
 * Returns true if the copy succeeded, false otherwise.
 * Never throws — all errors are caught and logged.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // Primary: Clipboard API
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      // Primary API failed — fall through to legacy fallback
      console.warn('Clipboard API failed, using fallback:', e);
    }
  }

  // Fallback: document.execCommand('copy')
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    // Prevent scrolling to bottom of page
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '-9999px';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch {
    console.error('Copy to clipboard failed');
    return false;
  }
}
