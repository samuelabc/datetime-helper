import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import HeroResultRow from './HeroResultRow.svelte';

describe('HeroResultRow', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Default: no reduced motion
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

  it('renders the Unix Timestamp (ms) label', () => {
    render(HeroResultRow, { props: { valueMs: 1708000000000, isLive: false } });
    expect(screen.getByText('Unix Timestamp (ms)')).toBeTruthy();
  });

  it('renders millisecond value in monospace with correct styling', () => {
    render(HeroResultRow, { props: { valueMs: 1708000000123, isLive: false } });
    const valueEl = screen.getByText('1708000000123');
    expect(valueEl).toBeTruthy();
    expect(valueEl.classList.contains('font-mono')).toBe(true);
    expect(valueEl.classList.contains('font-semibold')).toBe(true);
  });

  it('renders derived seconds row from millisecond value', () => {
    render(HeroResultRow, { props: { valueMs: 1708000000123, isLive: false } });
    expect(screen.getByText('Seconds')).toBeTruthy();
    const valueEl = screen.getByText('1708000000123');
    expect(valueEl).toBeTruthy();
    expect(screen.getByText('1708000000')).toBeTruthy();
  });

  it('displays "live" indicator when isLive is true', () => {
    render(HeroResultRow, { props: { valueMs: 1708000000000, isLive: true } });
    expect(screen.getByText('live')).toBeTruthy();
  });

  it('hides "live" indicator when isLive is false', () => {
    render(HeroResultRow, { props: { valueMs: 1708000000000, isLive: false } });
    expect(screen.queryByText('live')).toBeNull();
  });

  it('has orange-50 background styling on the container', () => {
    const { container } = render(HeroResultRow, { props: { valueMs: 1708000000000, isLive: false } });
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.classList.contains('bg-orange-50')).toBe(true);
    expect(wrapper.classList.contains('border-orange-200')).toBe(true);
  });

  it('has an aria-live polite region for screen readers', () => {
    const { container } = render(HeroResultRow, { props: { valueMs: 1708000000000, isLive: true } });
    const liveRegion = container.querySelector('[aria-live="polite"]');
    expect(liveRegion).toBeTruthy();
  });

  it('throttles polite live-region updates to 10 second intervals', async () => {
    const { container, rerender } = render(HeroResultRow, { props: { valueMs: 1708000000000, isLive: true } });
    const liveRegion = container.querySelector('[aria-live="polite"]');
    expect(liveRegion?.textContent).toContain('1708000000000');

    await rerender({ valueMs: 1708000001001, isLive: true });
    await vi.advanceTimersByTimeAsync(9000);
    expect(liveRegion?.textContent).toContain('1708000000000');

    await vi.advanceTimersByTimeAsync(1000);
    expect(liveRegion?.textContent).toContain('1708000001001');
  });

  it('exposes semantic label/value association for assistive tech', () => {
    const { container } = render(HeroResultRow, { props: { valueMs: 1708000000000, isLive: true } });
    const group = container.querySelector('[role="group"]');
    expect(group?.getAttribute('aria-labelledby')).toBe('unix-timestamp-label');
    expect(group?.getAttribute('aria-describedby')).toBe('unix-timestamp-value');
    expect(container.querySelector('#unix-timestamp-label')).toBeTruthy();
    expect(container.querySelector('#unix-timestamp-value')).toBeTruthy();
  });

  it('value text is selectable (has select-text class)', () => {
    render(HeroResultRow, { props: { valueMs: 1708000000000, isLive: false } });
    const valueEl = screen.getByText('1708000000000');
    expect(valueEl.classList.contains('select-text')).toBe(true);
  });

  it('hides live indicator when prefers-reduced-motion is active', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    render(HeroResultRow, { props: { valueMs: 1708000000000, isLive: true } });
    // When reduced motion is active, live indicator should be hidden
    expect(screen.queryByText('live')).toBeNull();
  });

  it('renders dedicated copy actions for milliseconds and seconds', () => {
    render(HeroResultRow, { props: { valueMs: 1708000000000, isLive: false } });
    const copyMsButton = screen.getByRole('button', { name: /Copy Unix Timestamp \(milliseconds\) value/ });
    const copySecondsButton = screen.getByRole('button', { name: /Copy Unix Timestamp \(seconds\) value/ });
    expect(copyMsButton).toBeTruthy();
    expect(copySecondsButton).toBeTruthy();
    // Hero variant uses text-sm (larger than default text-xs)
    expect(copyMsButton.classList.contains('text-sm')).toBe(true);
  });
});
