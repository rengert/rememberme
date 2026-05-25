import { useState, useEffect } from 'react';
import type { FilterMode, RememberItem } from '../types';

const STORAGE_KEY = 'rememberme-items';

function loadItems(): RememberItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as RememberItem[]) : [];
  } catch {
    return [];
  }
}

function saveItems(items: RememberItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignore write failures (e.g. storage quota exceeded or storage disabled)
  }
}

export function useRememberMe() {
  const [items, setItems] = useState<RememberItem[]>(loadItems);
  const [filter, setFilter] = useState<FilterMode>('all');

  useEffect(() => {
    saveItems(items);
  }, [items]);

  function addItem(text: string): void {
    const trimmed = text.trim();
    if (!trimmed) return;
    setItems((prev) => [
      ...prev,
      { id: crypto.randomUUID(), text: trimmed, done: false, createdAt: Date.now() },
    ]);
  }

  function toggleItem(id: string): void {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item)),
    );
  }

  function deleteItem(id: string): void {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  function clearDone(): void {
    setItems((prev) => prev.filter((item) => !item.done));
  }

  const filteredItems = items.filter((item) => {
    if (filter === 'active') return !item.done;
    if (filter === 'done') return item.done;
    return true;
  });

  const activeCount = items.filter((item) => !item.done).length;
  const doneCount = items.filter((item) => item.done).length;

  return {
    items: filteredItems,
    filter,
    setFilter,
    addItem,
    toggleItem,
    deleteItem,
    clearDone,
    activeCount,
    doneCount,
  };
}
