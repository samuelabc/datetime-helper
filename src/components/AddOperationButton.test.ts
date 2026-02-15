import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import AddOperationButton from './AddOperationButton.svelte';

describe('AddOperationButton', () => {
  it('renders with expected label', () => {
    render(AddOperationButton, { props: { onClick: vi.fn() } });
    const button = screen.getByRole('button', { name: 'Add operation' });
    expect(button).toBeTruthy();
    expect(button.className).toContain('h-11');
    expect(screen.getByText('+ Add operation')).toBeTruthy();
  });

  it('calls onClick callback when pressed', async () => {
    const onClick = vi.fn();
    render(AddOperationButton, { props: { onClick } });
    await fireEvent.click(screen.getByRole('button', { name: 'Add operation' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
