import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import StartDateInput from './StartDateInput.svelte';

describe('StartDateInput', () => {
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
    expect(input.className).toContain('text-orange-500');
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
});
