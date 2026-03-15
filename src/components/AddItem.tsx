import { useState, type FormEvent } from 'react';

interface AddItemProps {
  onAdd: (text: string) => void;
}

export function AddItem({ onAdd }: AddItemProps) {
  const [value, setValue] = useState('');

  function handleSubmit(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    if (!value.trim()) return;
    onAdd(value.trim());
    setValue('');
  }

  return (
    <form className="add-item-form" onSubmit={handleSubmit}>
      <input
        type="text"
        className="add-item-input"
        placeholder="What do you want to remember?"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-label="New item"
        maxLength={200}
      />
      <button type="submit" className="btn btn-primary" disabled={!value.trim()}>
        Add
      </button>
    </form>
  );
}
