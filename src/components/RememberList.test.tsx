import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { FilterMode, RememberItem } from '../types';
import { RememberList } from './RememberList';

function makeItem(overrides: Partial<RememberItem> = {}): RememberItem {
  return { id: 'id-1', text: 'Test item', done: false, createdAt: 1000, ...overrides };
}

const defaultProps = {
  items: [] as RememberItem[],
  filter: 'all' as FilterMode,
  activeCount: 0,
  doneCount: 0,
  onToggle: vi.fn(),
  onDelete: vi.fn(),
  onFilterChange: vi.fn(),
  onClearDone: vi.fn(),
};

describe('RememberList', () => {
  it('renders filter buttons for All, Active and Done', () => {
    render(<RememberList {...defaultProps} />);
    expect(screen.getByRole('button', { name: /all/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /active/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /done/i })).toBeInTheDocument();
  });

  it('marks the active filter button as pressed', () => {
    render(<RememberList {...defaultProps} filter="active" />);
    expect(screen.getByRole('button', { name: /active/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /all/i })).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onFilterChange when a filter button is clicked', async () => {
    const onFilterChange = vi.fn();
    render(<RememberList {...defaultProps} onFilterChange={onFilterChange} />);
    await userEvent.click(screen.getByRole('button', { name: /done/i }));
    expect(onFilterChange).toHaveBeenCalledWith('done');
  });

  it('shows the active item count', () => {
    render(<RememberList {...defaultProps} activeCount={3} />);
    expect(screen.getByText(/3 items left/i)).toBeInTheDocument();
  });

  it('uses singular "item" when activeCount is 1', () => {
    render(<RememberList {...defaultProps} activeCount={1} />);
    expect(screen.getByText(/1 item left/i)).toBeInTheDocument();
  });

  it('shows "Clear done" button only when there are done items', () => {
    const { rerender } = render(<RememberList {...defaultProps} doneCount={0} />);
    expect(screen.queryByRole('button', { name: /clear done/i })).not.toBeInTheDocument();

    rerender(<RememberList {...defaultProps} doneCount={2} />);
    expect(screen.getByRole('button', { name: /clear done \(2\)/i })).toBeInTheDocument();
  });

  it('calls onClearDone when the "Clear done" button is clicked', async () => {
    const onClearDone = vi.fn();
    render(<RememberList {...defaultProps} doneCount={1} onClearDone={onClearDone} />);
    await userEvent.click(screen.getByRole('button', { name: /clear done/i }));
    expect(onClearDone).toHaveBeenCalledTimes(1);
  });

  it('shows empty-state text when there are no items', () => {
    render(<RememberList {...defaultProps} items={[]} filter="all" />);
    expect(screen.getByText(/nothing to remember yet/i)).toBeInTheDocument();
  });

  it('shows "Nothing done yet" empty-state when filter is done and list is empty', () => {
    render(<RememberList {...defaultProps} items={[]} filter="done" />);
    expect(screen.getByText(/nothing done yet/i)).toBeInTheDocument();
  });

  it('renders list items when items are provided', () => {
    const items = [
      makeItem({ id: 'a', text: 'Item A' }),
      makeItem({ id: 'b', text: 'Item B' }),
    ];
    render(<RememberList {...defaultProps} items={items} />);
    expect(screen.getByText('Item A')).toBeInTheDocument();
    expect(screen.getByText('Item B')).toBeInTheDocument();
  });
});
