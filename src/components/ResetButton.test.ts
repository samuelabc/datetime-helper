import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import ResetButton from './ResetButton.svelte';

describe('ResetButton', () => {
  it('renders reset label and button text', () => {
    render(ResetButton, { props: { onClick: vi.fn() } });
    const button = screen.getByRole('button', { name: 'Reset calculator' });
    expect(button).toBeTruthy();
    expect(button.className).toContain('h-11');
    expect(screen.getByText('Reset')).toBeTruthy();
  });

  it('calls onClick callback', async () => {
    const onClick = vi.fn();
    render(ResetButton, { props: { onClick } });
    await fireEvent.click(screen.getByRole('button', { name: 'Reset calculator' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
