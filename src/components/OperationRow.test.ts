import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import OperationRow from './OperationRow.svelte';

function buildProps() {
  return {
    rowId: 1,
    direction: 'subtract' as const,
    amount: 0,
    unit: 'days' as const,
    showRemove: false,
    onDirectionChange: vi.fn(),
    onAmountChange: vi.fn(),
    onUnitChange: vi.fn(),
    onRemove: vi.fn(),
  };
}

describe('OperationRow', () => {
  it('renders default controls and values', () => {
    render(OperationRow, { props: buildProps() });
    const direction = screen.getByLabelText('Direction') as HTMLSelectElement;
    const amount = screen.getByLabelText('Amount') as HTMLInputElement;
    const unit = screen.getByLabelText('Unit') as HTMLSelectElement;

    expect(direction.value).toBe('subtract');
    expect(amount.value).toBe('0');
    expect(unit.value).toBe('days');
    expect(direction.className).toContain('h-11');
    expect(amount.className).toContain('h-11');
    expect(unit.className).toContain('h-11');
  });

  it('calls direction and unit callbacks on changes', async () => {
    const props = buildProps();
    render(OperationRow, { props });
    await fireEvent.input(screen.getByLabelText('Direction'), { target: { value: 'add' } });
    await fireEvent.input(screen.getByLabelText('Unit'), { target: { value: 'months' } });
    expect(props.onDirectionChange).toHaveBeenCalledWith('add');
    expect(props.onUnitChange).toHaveBeenCalledWith('months');
  });

  it('prevents invalid amount input and keeps previous value', async () => {
    const props = buildProps();
    render(OperationRow, { props });
    const amountInput = screen.getByLabelText('Amount') as HTMLInputElement;
    await fireEvent.input(amountInput, { target: { value: '-1abc2' } });
    expect(props.onAmountChange).not.toHaveBeenCalled();
    expect(amountInput.value).toBe('0');
  });

  it('shows remove button when showRemove=true and triggers callback', async () => {
    const props = buildProps();
    props.showRemove = true;
    render(OperationRow, { props });
    const button = screen.getByRole('button', { name: 'Remove operation' });
    expect(button).toBeTruthy();
    await fireEvent.click(button);
    expect(props.onRemove).toHaveBeenCalled();
  });

  it('hides remove button when only one operation remains', () => {
    render(OperationRow, { props: buildProps() });
    expect(screen.queryByRole('button', { name: 'Remove operation' })).toBeNull();
  });
});
