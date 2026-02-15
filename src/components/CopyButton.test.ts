import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import CopyButton from './CopyButton.svelte';

// Mock clipboard module
vi.mock('../lib/clipboard', () => ({
  copyToClipboard: vi.fn(),
}));

import { copyToClipboard } from '../lib/clipboard';

const mockCopyToClipboard = vi.mocked(copyToClipboard);

describe('CopyButton', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockCopyToClipboard.mockResolvedValue(true);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders with "Copy" text and clipboard icon in default state', () => {
    render(CopyButton, { props: { value: '2026-02-15T14:30:00Z', formatLabel: 'ISO 8601' } });
    expect(screen.getByText('Copy')).toBeTruthy();
  });

  it('renders with correct aria-label containing format label', () => {
    render(CopyButton, { props: { value: '2026-02-15T14:30:00Z', formatLabel: 'ISO 8601' } });
    const button = screen.getByRole('button');
    expect(button.getAttribute('aria-label')).toBe('Copy ISO 8601 value');
  });

  it('calls copyToClipboard with the provided value on click', async () => {
    render(CopyButton, { props: { value: '2026-02-15T14:30:00Z', formatLabel: 'ISO 8601' } });
    const button = screen.getByRole('button');
    await fireEvent.click(button);
    await vi.advanceTimersByTimeAsync(0);
    expect(mockCopyToClipboard).toHaveBeenCalledWith('2026-02-15T14:30:00Z');
  });

  it('transitions to "Copied!" state after successful copy', async () => {
    render(CopyButton, { props: { value: '2026-02-15T14:30:00Z', formatLabel: 'ISO 8601' } });
    const button = screen.getByRole('button');
    await fireEvent.click(button);
    await vi.advanceTimersByTimeAsync(0);
    expect(screen.getByText('Copied!')).toBeTruthy();
  });

  it('reverts to "Copy" state after 1.5 seconds', async () => {
    render(CopyButton, { props: { value: '2026-02-15T14:30:00Z', formatLabel: 'ISO 8601' } });
    const button = screen.getByRole('button');
    await fireEvent.click(button);
    await vi.advanceTimersByTimeAsync(0);
    expect(screen.getByText('Copied!')).toBeTruthy();
    await vi.advanceTimersByTimeAsync(1500);
    expect(screen.getByText('Copy')).toBeTruthy();
  });

  it('renders larger when variant="hero" (has text-sm class)', () => {
    render(CopyButton, { props: { value: '1708000000', formatLabel: 'Unix Timestamp', variant: 'hero' } });
    const button = screen.getByRole('button');
    expect(button.classList.contains('text-sm')).toBe(true);
  });

  it('renders smaller when variant="default" (has text-xs class)', () => {
    render(CopyButton, { props: { value: '2026-02-15T14:30:00Z', formatLabel: 'ISO 8601' } });
    const button = screen.getByRole('button');
    expect(button.classList.contains('text-xs')).toBe(true);
  });

  it('aria-live region shows "Copied to clipboard" when copied', async () => {
    const { container } = render(CopyButton, { props: { value: '2026-02-15T14:30:00Z', formatLabel: 'ISO 8601' } });
    const button = screen.getByRole('button');
    await fireEvent.click(button);
    await vi.advanceTimersByTimeAsync(0);
    const liveRegion = container.querySelector('[aria-live="assertive"]');
    expect(liveRegion?.textContent?.trim()).toBe('Copied to clipboard');
  });

  it('aria-live region is empty when not copied', () => {
    const { container } = render(CopyButton, { props: { value: '2026-02-15T14:30:00Z', formatLabel: 'ISO 8601' } });
    const liveRegion = container.querySelector('[aria-live="assertive"]');
    expect(liveRegion?.textContent?.trim()).toBe('');
  });

  it('does not transition to copied state if copyToClipboard returns false', async () => {
    mockCopyToClipboard.mockResolvedValue(false);
    render(CopyButton, { props: { value: '2026-02-15T14:30:00Z', formatLabel: 'ISO 8601' } });
    const button = screen.getByRole('button');
    await fireEvent.click(button);
    await vi.advanceTimersByTimeAsync(0);
    expect(screen.getByText('Copy')).toBeTruthy();
    expect(screen.queryByText('Copied!')).toBeNull();
  });

  it('has focus ring classes for keyboard accessibility', () => {
    render(CopyButton, { props: { value: '2026-02-15T14:30:00Z', formatLabel: 'ISO 8601' } });
    const button = screen.getByRole('button');
    expect(button.className).toContain('focus:ring-2');
    expect(button.className).toContain('ring-orange-400');
  });

  it('has motion-safe transition classes for reduced-motion support', () => {
    render(CopyButton, { props: { value: '2026-02-15T14:30:00Z', formatLabel: 'ISO 8601' } });
    const button = screen.getByRole('button');
    expect(button.className).toContain('motion-safe:transition-colors');
    expect(button.className).toContain('motion-safe:duration-150');
  });

  it('handles rapid re-clicks (clears previous timeout)', async () => {
    render(CopyButton, { props: { value: '2026-02-15T14:30:00Z', formatLabel: 'ISO 8601' } });
    const button = screen.getByRole('button');

    // First click
    await fireEvent.click(button);
    await vi.advanceTimersByTimeAsync(0);
    expect(screen.getByText('Copied!')).toBeTruthy();

    // Advance 1 second (before 1.5s revert)
    await vi.advanceTimersByTimeAsync(1000);
    expect(screen.getByText('Copied!')).toBeTruthy();

    // Second click — resets the timeout
    await fireEvent.click(button);
    await vi.advanceTimersByTimeAsync(0);
    expect(screen.getByText('Copied!')).toBeTruthy();

    // Advance 1 second after second click (total 2s from first, 1s from second)
    await vi.advanceTimersByTimeAsync(1000);
    // Should still show Copied! because second click reset the timer
    expect(screen.getByText('Copied!')).toBeTruthy();

    // Advance remaining 500ms — now 1.5s from second click
    await vi.advanceTimersByTimeAsync(500);
    expect(screen.getByText('Copy')).toBeTruthy();
  });
});
