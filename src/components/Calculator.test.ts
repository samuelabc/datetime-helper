import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import { tick } from 'svelte';
import Calculator from './Calculator.svelte';

const { calculateMock, validateDateMock } = vi.hoisted(() => ({
  calculateMock: vi.fn(),
  validateDateMock: vi.fn(),
}));

// Mock the wasmBridge module
vi.mock('../lib/wasmBridge', () => ({
  init: vi.fn().mockResolvedValue(undefined),
  calculate: calculateMock,
  validateDate: validateDateMock,
}));

const defaultResult = {
  unixTimestamp: 1739634600,
  iso8601: '2026-02-15T14:30:00Z',
  rfc2822: 'Sun, 15 Feb 2026 14:30:00 +0000',
  localHuman: 'February 15, 2026 2:30:00 PM UTC',
};

const shiftedResult = {
  unixTimestamp: 1739032200,
  iso8601: '2026-02-08T14:30:00Z',
  rfc2822: 'Sun, 08 Feb 2026 14:30:00 +0000',
  localHuman: 'February 08, 2026 2:30:00 PM UTC',
};

const explicitResult = {
  unixTimestamp: 1773532800,
  iso8601: '2026-03-15T00:00:00Z',
  rfc2822: 'Sun, 15 Mar 2026 00:00:00 +0000',
  localHuman: 'March 15, 2026 12:00:00 AM UTC',
};

const monthBoundaryResult = {
  unixTimestamp: 1772236800,
  iso8601: '2026-02-28T00:00:00Z',
  rfc2822: 'Sat, 28 Feb 2026 00:00:00 +0000',
  localHuman: 'February 28, 2026 12:00:00 AM UTC',
};

const leapResult = {
  unixTimestamp: 1835395200,
  iso8601: '2028-02-29T00:00:00Z',
  rfc2822: 'Tue, 29 Feb 2028 00:00:00 +0000',
  localHuman: 'February 29, 2028 12:00:00 AM UTC',
};

const chainedResult = {
  unixTimestamp: 1771977600,
  iso8601: '2026-02-25T00:00:00Z',
  rfc2822: 'Wed, 25 Feb 2026 00:00:00 +0000',
  localHuman: 'February 25, 2026 12:00:00 AM UTC',
};

calculateMock.mockReturnValue(defaultResult);
validateDateMock.mockImplementation((input: string) => {
  if (input === '2026-03-15') {
    return { valid: true, normalized: '2026-03-15T00:00:00Z' };
  }
  if (input === '2026-01-31') {
    return { valid: true, normalized: '2026-01-31T00:00:00Z' };
  }
  if (input === '2028-02-29') {
    return { valid: true, normalized: '2028-02-29T00:00:00Z' };
  }
  if (input === '2027-02-29') {
    return { valid: false, error: 'Invalid date: February 29 is not valid in 2027' };
  }
  if (input === '2026-13-01') {
    return { valid: false, error: 'Invalid month' };
  }
  return { valid: false, error: 'Invalid date' };
});

calculateMock.mockImplementation((startDate: string, operations: Array<{ value: number; unit: string }>) => {
  if (
    startDate.startsWith('2026-01-31') &&
    operations.length === 2 &&
    operations[0]?.value === 1 &&
    operations[0]?.unit === 'months' &&
    operations[1]?.value === 3 &&
    operations[1]?.unit === 'days'
  ) {
    return chainedResult;
  }
  if (startDate.startsWith('2026-01-31') && operations.some((operation) => operation.value === 1 && operation.unit === 'months')) {
    return monthBoundaryResult;
  }
  if (startDate.startsWith('2026-03-15')) return explicitResult;
  if (startDate.startsWith('2028-02-29')) return leapResult;
  if (operations.some((operation) => operation.value === 7 && operation.unit === 'days')) return shiftedResult;
  return defaultResult;
});

async function getStartDateInput() {
  return screen.getByLabelText('Start Date Input') as HTMLInputElement;
}

async function waitForWasmInit() {
  await vi.advanceTimersByTimeAsync(0);
  await tick();
  await vi.advanceTimersByTimeAsync(0);
  await tick();
}

describe('Calculator', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    );
    calculateMock.mockClear();
    validateDateMock.mockClear();
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

  it('shows now as the default start-date value in orange mode', async () => {
    render(Calculator);
    await waitForWasmInit();
    const input = await getStartDateInput();
    expect(input.value).toBe('now');
    expect(input.className).toContain('text-orange-500');
  });

  it('displays all four format results after wasm init', async () => {
    render(Calculator);
    await waitForWasmInit();
    expect(screen.getByText('1739634600')).toBeTruthy();
    expect(screen.getByText('ISO 8601')).toBeTruthy();
    expect(screen.getByText('RFC 2822')).toBeTruthy();
    expect(screen.getByText('Local Time')).toBeTruthy();
  });

  it('recalculates immediately when operation fields change', async () => {
    render(Calculator);
    await waitForWasmInit();
    const direction = screen.getByLabelText('Direction') as HTMLSelectElement;
    const amount = screen.getByLabelText('Amount') as HTMLInputElement;
    const unit = screen.getByLabelText('Unit') as HTMLSelectElement;

    await fireEvent.input(direction, { target: { value: 'subtract' } });
    await fireEvent.input(amount, { target: { value: '7' } });
    await fireEvent.input(unit, { target: { value: 'days' } });
    await tick();

    expect(screen.getByText('1739032200')).toBeTruthy();
    expect(calculateMock).toHaveBeenCalled();
  });

  it('stops live indicator when now mode has operation amount > 0', async () => {
    render(Calculator);
    await waitForWasmInit();
    const amount = screen.getByLabelText('Amount') as HTMLInputElement;
    await fireEvent.input(amount, { target: { value: '7' } });
    await tick();
    expect(screen.queryByText('live')).toBeNull();
  });

  it('resumes live indicator when amount returns to 0 in now mode', async () => {
    render(Calculator);
    await waitForWasmInit();
    const amount = screen.getByLabelText('Amount') as HTMLInputElement;
    await fireEvent.input(amount, { target: { value: '7' } });
    await fireEvent.input(amount, { target: { value: '0' } });
    await tick();
    expect(screen.getByText('live')).toBeTruthy();
  });

  it('accepts a valid explicit start date and updates to static result', async () => {
    render(Calculator);
    await waitForWasmInit();
    const input = await getStartDateInput();
    await fireEvent.input(input, { target: { value: '2026-03-15' } });
    await tick();
    expect(screen.getByText('1773532800')).toBeTruthy();
    expect(screen.getByText('2026-03-15T00:00:00Z')).toBeTruthy();
    expect(screen.getByText('Sun, 15 Mar 2026 00:00:00 +0000')).toBeTruthy();
    expect(screen.getByText('March 15, 2026 12:00:00 AM UTC')).toBeTruthy();
    expect(screen.queryByText('live')).toBeNull();
  });

  it('keeps last valid result when invalid date is entered', async () => {
    render(Calculator);
    await waitForWasmInit();
    const input = await getStartDateInput();
    await fireEvent.input(input, { target: { value: '2026-03-15' } });
    await tick();
    expect(screen.getByText('1773532800')).toBeTruthy();

    await fireEvent.input(input, { target: { value: '2026-13-01' } });
    await tick();
    expect(screen.getByText('1773532800')).toBeTruthy();
    expect(screen.getByText('Invalid month')).toBeTruthy();
  });

  it('clears date validation error when corrected input is valid', async () => {
    render(Calculator);
    await waitForWasmInit();
    const input = await getStartDateInput();
    await fireEvent.input(input, { target: { value: '2026-13-01' } });
    await tick();
    expect(screen.getByText('Invalid month')).toBeTruthy();

    await fireEvent.input(input, { target: { value: '2026-03-15' } });
    await tick();
    expect(screen.queryByText('Invalid month')).toBeNull();
    expect(screen.getByText('1773532800')).toBeTruthy();
  });

  it('reverts to now on empty blur and restores live mode', async () => {
    render(Calculator);
    await waitForWasmInit();
    const input = await getStartDateInput();
    await fireEvent.input(input, { target: { value: '' } });
    await fireEvent.blur(input);
    await tick();
    expect(input.value).toBe('now');
    expect(screen.getByText('live')).toBeTruthy();
  });

  it('accepts leap-year date and rejects non-leap-year date', async () => {
    render(Calculator);
    await waitForWasmInit();
    const input = await getStartDateInput();

    await fireEvent.input(input, { target: { value: '2028-02-29' } });
    await tick();
    expect(screen.getByText('1835395200')).toBeTruthy();

    await fireEvent.input(input, { target: { value: '2027-02-29' } });
    await tick();
    expect(screen.getByText('Invalid date: February 29 is not valid in 2027')).toBeTruthy();
    expect(screen.getByText('1835395200')).toBeTruthy();
  });

  it('handles month-boundary arithmetic for 2026-01-31 + 1 month', async () => {
    render(Calculator);
    await waitForWasmInit();
    const input = await getStartDateInput();
    await fireEvent.input(input, { target: { value: '2026-01-31' } });
    await tick();

    const direction = screen.getByLabelText('Direction') as HTMLSelectElement;
    const amount = screen.getByLabelText('Amount') as HTMLInputElement;
    const unit = screen.getByLabelText('Unit') as HTMLSelectElement;
    await fireEvent.input(direction, { target: { value: 'add' } });
    await fireEvent.input(amount, { target: { value: '1' } });
    await fireEvent.input(unit, { target: { value: 'months' } });
    await tick();

    expect(screen.getByText('1772236800')).toBeTruthy();
    expect(screen.getByText('2026-02-28T00:00:00Z')).toBeTruthy();
  });

  it('adds and removes operation rows while preserving minimum one row', async () => {
    render(Calculator);
    await waitForWasmInit();
    expect(screen.getAllByLabelText('Direction').length).toBe(1);

    await fireEvent.click(screen.getByRole('button', { name: 'Add operation' }));
    await tick();
    expect(screen.getAllByLabelText('Direction').length).toBe(2);
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Direction');

    await fireEvent.click(screen.getAllByRole('button', { name: 'Remove operation' })[0]);
    await tick();
    expect(screen.getAllByLabelText('Direction').length).toBe(1);
    expect(screen.queryByRole('button', { name: 'Remove operation' })).toBeNull();
  });

  it('applies multi-step operations in visible order', async () => {
    render(Calculator);
    await waitForWasmInit();
    const input = await getStartDateInput();
    await fireEvent.input(input, { target: { value: '2026-01-31' } });
    await tick();

    const directionRows = screen.getAllByLabelText('Direction') as HTMLSelectElement[];
    const amountRows = screen.getAllByLabelText('Amount') as HTMLInputElement[];
    const unitRows = screen.getAllByLabelText('Unit') as HTMLSelectElement[];

    await fireEvent.input(directionRows[0], { target: { value: 'add' } });
    await fireEvent.input(amountRows[0], { target: { value: '1' } });
    await fireEvent.input(unitRows[0], { target: { value: 'months' } });

    await fireEvent.click(screen.getByRole('button', { name: 'Add operation' }));
    await tick();

    const amountRowsAfterAdd = screen.getAllByLabelText('Amount') as HTMLInputElement[];
    await fireEvent.input(amountRowsAfterAdd[1], { target: { value: '3' } });
    await tick();

    expect(calculateMock).toHaveBeenLastCalledWith('2026-01-31T00:00:00Z', [
      { type: 'add', value: 1, unit: 'months' },
      { type: 'subtract', value: 3, unit: 'days' },
    ]);
    expect(screen.getByText('1771977600')).toBeTruthy();
  });

  it('shows reset only when state differs from defaults and fully resets calculator', async () => {
    render(Calculator);
    await waitForWasmInit();
    expect(screen.queryByRole('button', { name: 'Reset calculator' })).toBeNull();

    const amount = screen.getByLabelText('Amount') as HTMLInputElement;
    await fireEvent.input(amount, { target: { value: '2' } });
    await tick();
    expect(screen.getByRole('button', { name: 'Reset calculator' })).toBeTruthy();

    await fireEvent.click(screen.getByRole('button', { name: 'Reset calculator' }));
    await tick();
    const input = await getStartDateInput();
    expect(input.value).toBe('now');
    expect((screen.getByLabelText('Amount') as HTMLInputElement).value).toBe('0');
    expect(screen.getAllByLabelText('Direction').length).toBe(1);
    expect(screen.getByText('live')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Reset calculator' })).toBeNull();
  });

  it('does not tick when prefers-reduced-motion is active', async () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    );

    render(Calculator);
    await waitForWasmInit();
    const callCountAfterInit = calculateMock.mock.calls.length;

    await vi.advanceTimersByTimeAsync(3000);
    await tick();

    expect(calculateMock.mock.calls.length).toBe(callCountAfterInit);
  });

  it('displays error message when wasm init fails', async () => {
    const { init } = await import('../lib/wasmBridge');
    (init as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Wasm load failed'));

    render(Calculator);
    await waitForWasmInit();

    expect(screen.getByText(/Engine error/)).toBeTruthy();
  });
});
