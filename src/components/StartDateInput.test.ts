import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import StartDateInput from './StartDateInput.svelte';

describe('StartDateInput', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders now value with orange text when isNow=true', () => {
    render(StartDateInput, {
      props: {
        value: 'now',
        error: null,
        isNow: true,
        onInput: vi.fn(),
        onBlur: vi.fn(),
      },
    });

    const input = screen.getByLabelText('Start Date Input') as HTMLInputElement;
    expect(input.value).toBe('now');
    expect(input.className).toContain('ui-input-warm');
    expect(input.className).toContain('h-11');
  });

  it('calls onInput with typed value', async () => {
    const onInput = vi.fn();
    render(StartDateInput, {
      props: {
        value: 'now',
        error: null,
        isNow: true,
        onInput,
        onBlur: vi.fn(),
      },
    });

    const input = screen.getByLabelText('Start Date Input') as HTMLInputElement;
    await fireEvent.input(input, { target: { value: '2026-03-15' } });
    expect(onInput).toHaveBeenCalledWith('2026-03-15');
  });

  it('selects all text on focus', async () => {
    render(StartDateInput, {
      props: {
        value: 'now',
        error: null,
        isNow: true,
        onInput: vi.fn(),
        onBlur: vi.fn(),
      },
    });

    const input = screen.getByLabelText('Start Date Input') as HTMLInputElement;
    const selectSpy = vi.spyOn(input, 'select');
    await fireEvent.focus(input);
    expect(selectSpy).toHaveBeenCalled();
  });

  it('keeps full selection on mouseup click', async () => {
    render(StartDateInput, {
      props: {
        value: 'now',
        error: null,
        isNow: true,
        onInput: vi.fn(),
        onBlur: vi.fn(),
      },
    });

    const input = screen.getByLabelText('Start Date Input') as HTMLInputElement;
    const selectSpy = vi.spyOn(input, 'select');
    await fireEvent.mouseUp(input);
    expect(selectSpy).toHaveBeenCalled();
  });

  it('shows validation error message', () => {
    render(StartDateInput, {
      props: {
        value: '2026-13-01',
        error: 'Invalid month',
        isNow: false,
        onInput: vi.fn(),
        onBlur: vi.fn(),
      },
    });

    expect(screen.getByText('Invalid month')).toBeTruthy();
  });

  it('opens native picker via showPicker when available', async () => {
    const { container } = render(StartDateInput, {
      props: {
        value: 'now',
        error: null,
        isNow: true,
        onInput: vi.fn(),
        onBlur: vi.fn(),
      },
    });

    const calendarInput = container.querySelector('input[type="datetime-local"]') as HTMLInputElement;
    const showPickerSpy = vi.fn();
    Object.defineProperty(calendarInput, 'showPicker', {
      configurable: true,
      value: showPickerSpy,
    });

    await fireEvent.click(screen.getByLabelText('Open date picker'));
    expect(showPickerSpy).toHaveBeenCalledOnce();
  });

  it('falls back to focus and click when showPicker is unavailable', async () => {
    const { container } = render(StartDateInput, {
      props: {
        value: 'now',
        error: null,
        isNow: true,
        onInput: vi.fn(),
        onBlur: vi.fn(),
      },
    });

    const calendarInput = container.querySelector('input[type="datetime-local"]') as HTMLInputElement;
    const focusSpy = vi.spyOn(calendarInput, 'focus');
    const clickSpy = vi.spyOn(calendarInput, 'click');

    await fireEvent.click(screen.getByLabelText('Open date picker'));
    expect(focusSpy).toHaveBeenCalledOnce();
    expect(clickSpy).toHaveBeenCalledOnce();
  });

  it('uses direct touch target mode for coarse pointers', () => {
    const originalMatchMedia = window.matchMedia;
    try {
      window.matchMedia = vi.fn().mockImplementation(() => ({
        matches: true,
        media: '(pointer: coarse)',
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })) as unknown as typeof window.matchMedia;

      const { container } = render(StartDateInput, {
        props: {
          value: 'now',
          error: null,
          isNow: true,
          onInput: vi.fn(),
          onBlur: vi.fn(),
        },
      });

      const calendarInput = container.querySelector('input[type="datetime-local"]') as HTMLInputElement;
      expect(calendarInput.className).toContain('h-8');
      expect(calendarInput.className).toContain('w-8');
      expect(calendarInput.className).not.toContain('pointer-events-none');
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });
});
