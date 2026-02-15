import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import ResultRow from './ResultRow.svelte';

describe('ResultRow', () => {
  it('renders the format label', () => {
    render(ResultRow, { props: { formatLabel: 'ISO 8601', value: '2026-02-15T14:30:00Z' } });
    expect(screen.getByText('ISO 8601')).toBeTruthy();
  });

  it('renders the value in monospace text', () => {
    render(ResultRow, { props: { formatLabel: 'ISO 8601', value: '2026-02-15T14:30:00Z' } });
    const valueEl = screen.getByText('2026-02-15T14:30:00Z');
    expect(valueEl).toBeTruthy();
    expect(valueEl.classList.contains('font-mono')).toBe(true);
  });

  it('has gray-50 background and gray-100 border', () => {
    const { container } = render(ResultRow, { props: { formatLabel: 'RFC 2822', value: 'Sun, 15 Feb 2026 14:30:00 +0000' } });
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.classList.contains('bg-gray-50')).toBe(true);
    expect(wrapper.classList.contains('border-gray-100')).toBe(true);
  });

  it('value text is selectable (has select-text class)', () => {
    render(ResultRow, { props: { formatLabel: 'Local Time', value: 'February 15, 2026 2:30:00 PM UTC' } });
    const valueEl = screen.getByText('February 15, 2026 2:30:00 PM UTC');
    expect(valueEl.classList.contains('select-text')).toBe(true);
  });

  it('format label is in sans-serif (no font-mono)', () => {
    render(ResultRow, { props: { formatLabel: 'ISO 8601', value: '2026-02-15T14:30:00Z' } });
    const labelEl = screen.getByText('ISO 8601');
    expect(labelEl.classList.contains('font-mono')).toBe(false);
    expect(labelEl.classList.contains('text-xs')).toBe(true);
    expect(labelEl.classList.contains('font-medium')).toBe(true);
  });

  it('applies dark mode variant classes on container', () => {
    const { container } = render(ResultRow, { props: { formatLabel: 'ISO 8601', value: '2026-02-15T14:30:00Z' } });
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.classList.contains('dark:bg-slate-800')).toBe(true);
    expect(wrapper.classList.contains('dark:border-slate-700')).toBe(true);
  });

  it('renders a CopyButton with correct aria-label for the format', () => {
    render(ResultRow, { props: { formatLabel: 'ISO 8601', value: '2026-02-15T14:30:00Z' } });
    const copyButton = screen.getByRole('button', { name: /Copy ISO 8601 value/ });
    expect(copyButton).toBeTruthy();
    // Default variant uses text-xs (smaller than hero text-sm)
    expect(copyButton.classList.contains('text-xs')).toBe(true);
  });
});
