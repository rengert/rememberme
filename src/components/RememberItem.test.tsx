import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { RememberItem as RememberItemType } from '../types';
import { RememberItem } from './RememberItem';

function makeItem(overrides?: Partial<RememberItemType>): RememberItemType {
  return { id: '1', text: 'Test item', done: false, createdAt: 1000, ...overrides };
}

describe('RememberItem', () => {
  it('renders the item text', () => {
    render(<RememberItem item={makeItem()} onToggle={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('Test item')).toBeInTheDocument();
  });

  it('renders an unchecked checkbox for an active item', () => {
    render(<RememberItem item={makeItem({ done: false })} onToggle={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('renders a checked checkbox for a done item', () => {
    render(<RememberItem item={makeItem({ done: true })} onToggle={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('calls onToggle when the checkbox is clicked', async () => {
    const onToggle = vi.fn();
    render(<RememberItem item={makeItem()} onToggle={onToggle} onDelete={vi.fn()} />);
    await userEvent.click(screen.getByRole('checkbox'));
    expect(onToggle).toHaveBeenCalledWith('1');
  });

  it('calls onDelete when the delete button is clicked', async () => {
    const onDelete = vi.fn();
    render(<RememberItem item={makeItem()} onToggle={vi.fn()} onDelete={onDelete} />);
    await userEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(onDelete).toHaveBeenCalledWith('1');
  });

  it('applies done class when the item is done', () => {
    const { container } = render(
      <RememberItem item={makeItem({ done: true })} onToggle={vi.fn()} onDelete={vi.fn()} />,
    );
    expect(container.querySelector('.remember-item--done')).toBeInTheDocument();
  });
});
