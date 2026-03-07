import type { RememberItem as RememberItemType } from '../types';

interface RememberItemProps {
  item: RememberItemType;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function RememberItem({ item, onToggle, onDelete }: RememberItemProps) {
  return (
    <li className={`remember-item${item.done ? ' remember-item--done' : ''}`}>
      <label className="remember-item__label">
        <input
          type="checkbox"
          className="remember-item__checkbox"
          checked={item.done}
          onChange={() => onToggle(item.id)}
          aria-label={`Mark "${item.text}" as ${item.done ? 'active' : 'done'}`}
        />
        <span className="remember-item__text">{item.text}</span>
      </label>
      <button
        className="btn btn-danger"
        onClick={() => onDelete(item.id)}
        aria-label={`Delete "${item.text}"`}
      >
        ✕
      </button>
    </li>
  );
}
