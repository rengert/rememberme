import type { FilterMode, RememberItem as RememberItemType } from '../types';
import { RememberItem } from './RememberItem';

interface RememberListProps {
  items: RememberItemType[];
  filter: FilterMode;
  activeCount: number;
  doneCount: number;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onFilterChange: (mode: FilterMode) => void;
  onClearDone: () => void;
}

const FILTERS: { mode: FilterMode; label: string }[] = [
  { mode: 'all', label: 'All' },
  { mode: 'active', label: 'Active' },
  { mode: 'done', label: 'Done' },
];

export function RememberList({
  items,
  filter,
  activeCount,
  doneCount,
  onToggle,
  onDelete,
  onFilterChange,
  onClearDone,
}: RememberListProps) {
  return (
    <section className="remember-list-section">
      <div className="filter-bar">
        <span className="filter-bar__count">
          {activeCount} item{activeCount !== 1 ? 's' : ''} left
        </span>
        <div className="filter-bar__buttons" role="group" aria-label="Filter items">
          {FILTERS.map(({ mode, label }) => (
            <button
              key={mode}
              className={`btn btn-filter${filter === mode ? ' btn-filter--active' : ''}`}
              onClick={() => onFilterChange(mode)}
              aria-pressed={filter === mode}
            >
              {label}
            </button>
          ))}
        </div>
        {doneCount > 0 && (
          <button className="btn btn-ghost" onClick={onClearDone}>
            Clear done ({doneCount})
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <p className="empty-state">
          {filter === 'done' ? 'Nothing done yet.' : 'Nothing to remember yet. Add something above!'}
        </p>
      ) : (
        <ul className="remember-list">
          {items.map((item) => (
            <RememberItem key={item.id} item={item} onToggle={onToggle} onDelete={onDelete} />
          ))}
        </ul>
      )}
    </section>
  );
}
