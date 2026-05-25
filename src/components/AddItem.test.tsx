import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AddItem } from './AddItem';

describe('AddItem', () => {
  it('renders the input and button', () => {
    render(<AddItem onAdd={vi.fn()} />);
    expect(screen.getByRole('textbox', { name: /new item/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
  });

  it('disables the button when the input is empty', () => {
    render(<AddItem onAdd={vi.fn()} />);
    expect(screen.getByRole('button', { name: /add/i })).toBeDisabled();
  });

  it('enables the button when text is entered', async () => {
    render(<AddItem onAdd={vi.fn()} />);
    await userEvent.type(screen.getByRole('textbox'), 'Remember this');
    expect(screen.getByRole('button', { name: /add/i })).not.toBeDisabled();
  });

  it('calls onAdd with the trimmed text and clears the input', async () => {
    const onAdd = vi.fn();
    render(<AddItem onAdd={onAdd} />);
    await userEvent.type(screen.getByRole('textbox'), '  Buy flowers  ');
    await userEvent.click(screen.getByRole('button', { name: /add/i }));
    expect(onAdd).toHaveBeenCalledWith('Buy flowers');
    expect(screen.getByRole('textbox')).toHaveValue('');
  });

  it('calls onAdd when Enter is pressed', async () => {
    const onAdd = vi.fn();
    render(<AddItem onAdd={onAdd} />);
    await userEvent.type(screen.getByRole('textbox'), 'Press enter{Enter}');
    expect(onAdd).toHaveBeenCalledWith('Press enter');
  });

  it('does not call onAdd when the input is only whitespace', async () => {
    const onAdd = vi.fn();
    render(<AddItem onAdd={onAdd} />);
    await userEvent.type(screen.getByRole('textbox'), '   ');
    await userEvent.click(screen.getByRole('button', { name: /add/i }));
    expect(onAdd).not.toHaveBeenCalled();
  });
});
