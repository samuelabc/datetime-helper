import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import { tick } from 'svelte';
import Calculator from './Calculator.svelte';

// Mock the wasmBridge module
vi.mock('../lib/wasmBridge', () => ({
  init: vi.fn().mockResolvedValue(undefined),
  calculate: vi.fn().mockReturnValue({
    unixTimestamp: 1739634600,
    iso8601: '2026-02-15T14:30:00Z',
    rfc2822: 'Sun, 15 Feb 2026 14:30:00 +0000',
    localHuman: 'February 15, 2026 2:30:00 PM UTC',
  }),
}));

/**
 * Helper: wait for onMount async to complete and effects to settle.
 * Uses microtask flushing instead of runAllTimers to avoid infinite setInterval.
 */
async function waitForWasmInit() {
  // Flush the pending microtask from onMount's async init()
  await vi.advanceTimersByTimeAsync(0);
  await tick();
  // Let the $effect run (triggered by wasmReady becoming true)
  await vi.advanceTimersByTimeAsync(0);
  await tick();
}

describe('Calculator', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders the Input section with aria-label', async () => {
    render(Calculator);
    await waitForWasmInit();
    const inputSection = document.querySelector('[aria-label="Input"]');
    expect(inputSection).toBeTruthy();
  });

  it('renders the Results section with aria-label', async () => {
    render(Calculator);
    await waitForWasmInit();
    const resultsSection = document.querySelector('[aria-label="Results"]');
    expect(resultsSection).toBeTruthy();
  });

  it('displays Unix Timestamp label in hero row after wasm init', async () => {
    render(Calculator);
    await waitForWasmInit();
    expect(screen.getByText('Unix Timestamp')).toBeTruthy();
  });

  it('displays the live indicator after wasm init', async () => {
    render(Calculator);
    await waitForWasmInit();
    expect(screen.getByText('live')).toBeTruthy();
  });

  it('displays all four format results after wasm init', async () => {
    render(Calculator);
    await waitForWasmInit();
    expect(screen.getByText('1739634600')).toBeTruthy();
    expect(screen.getByText('ISO 8601')).toBeTruthy();
    expect(screen.getByText('RFC 2822')).toBeTruthy();
    expect(screen.getByText('Local Time')).toBeTruthy();
  });

  it('calls calculate with full ISO string including time', async () => {
    const { calculate } = await import('../lib/wasmBridge');
    render(Calculator);
    await waitForWasmInit();

    // calculate should have been called during init
    expect(calculate).toHaveBeenCalled();

    // The first arg should be a full ISO string (not date-only)
    const callArg = (calculate as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(callArg).toContain('T'); // ISO string includes 'T' separator
  });

  it('ticks every second calling calculate again', async () => {
    const { calculate } = await import('../lib/wasmBridge');
    render(Calculator);
    await waitForWasmInit();

    const callCountAfterInit = (calculate as ReturnType<typeof vi.fn>).mock.calls.length;

    // Advance 1 second for a tick
    await vi.advanceTimersByTimeAsync(1000);
    await tick();

    expect((calculate as ReturnType<typeof vi.fn>).mock.calls.length).toBeGreaterThan(callCountAfterInit);
  });

  it('does not tick when prefers-reduced-motion is active', async () => {
    // Override matchMedia to report reduced motion
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { calculate } = await import('../lib/wasmBridge');
    render(Calculator);
    await waitForWasmInit();

    // calculate is called once (initial compute) even with reduced motion
    const callCountAfterInit = (calculate as ReturnType<typeof vi.fn>).mock.calls.length;

    // Advance 3 seconds — should NOT trigger additional calculate calls
    await vi.advanceTimersByTimeAsync(3000);
    await tick();

    expect((calculate as ReturnType<typeof vi.fn>).mock.calls.length).toBe(callCountAfterInit);
  });

  it('displays error message when wasm init fails', async () => {
    const { init } = await import('../lib/wasmBridge');
    (init as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Wasm load failed'));

    render(Calculator);
    await waitForWasmInit();

    expect(screen.getByText(/Engine error/)).toBeTruthy();
  });
});
