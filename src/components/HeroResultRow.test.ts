import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import HeroResultRow from './HeroResultRow.svelte';

describe('HeroResultRow', () => {
  beforeEach(() => {
    // Default: no reduced motion
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the Unix Timestamp label', () => {
    render(HeroResultRow, { props: { value: 1708000000, isLive: false } });
    expect(screen.getByText('Unix Timestamp')).toBeTruthy();
  });

  it('renders the value in monospace with correct styling', () => {
    render(HeroResultRow, { props: { value: 1708000000, isLive: false } });
    const valueEl = screen.getByText('1708000000');
    expect(valueEl).toBeTruthy();
    expect(valueEl.classList.contains('font-mono')).toBe(true);
    expect(valueEl.classList.contains('font-semibold')).toBe(true);
  });

  it('displays "live" indicator when isLive is true', () => {
    render(HeroResultRow, { props: { value: 1708000000, isLive: true } });
    expect(screen.getByText('live')).toBeTruthy();
  });

  it('hides "live" indicator when isLive is false', () => {
    render(HeroResultRow, { props: { value: 1708000000, isLive: false } });
    expect(screen.queryByText('live')).toBeNull();
  });

  it('has orange-50 background styling on the container', () => {
    const { container } = render(HeroResultRow, { props: { value: 1708000000, isLive: false } });
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.classList.contains('bg-orange-50')).toBe(true);
    expect(wrapper.classList.contains('border-orange-200')).toBe(true);
  });

  it('has an aria-live polite region for screen readers', () => {
    const { container } = render(HeroResultRow, { props: { value: 1708000000, isLive: true } });
    const liveRegion = container.querySelector('[aria-live="polite"]');
    expect(liveRegion).toBeTruthy();
  });

  it('value text is selectable (has select-text class)', () => {
    render(HeroResultRow, { props: { value: 1708000000, isLive: false } });
    const valueEl = screen.getByText('1708000000');
    expect(valueEl.classList.contains('select-text')).toBe(true);
  });

  it('hides live indicator when prefers-reduced-motion is active', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    render(HeroResultRow, { props: { value: 1708000000, isLive: true } });
    // When reduced motion is active, live indicator should be hidden
    expect(screen.queryByText('live')).toBeNull();
  });

  it('renders a CopyButton with hero variant and correct aria-label', () => {
    render(HeroResultRow, { props: { value: 1708000000, isLive: false } });
    const copyButton = screen.getByRole('button', { name: /Copy Unix Timestamp value/ });
    expect(copyButton).toBeTruthy();
    // Hero variant uses text-sm (larger than default text-xs)
    expect(copyButton.classList.contains('text-sm')).toBe(true);
  });
});
