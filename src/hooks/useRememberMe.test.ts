import { renderHook, act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useRememberMe } from './useRememberMe';

describe('useRememberMe', () => {
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };
  })();

  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    localStorageMock.clear();
    let callCount = 0;
    vi.spyOn(crypto, 'randomUUID').mockImplementation(
      () => `uuid-${++callCount}` as `${string}-${string}-${string}-${string}-${string}`,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts with an empty list', () => {
    const { result } = renderHook(() => useRememberMe());
    expect(result.current.items).toHaveLength(0);
  });

  it('adds an item', () => {
    const { result } = renderHook(() => useRememberMe());
    act(() => {
      result.current.addItem('Buy milk');
    });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].text).toBe('Buy milk');
    expect(result.current.items[0].done).toBe(false);
  });

  it('does not add an empty or whitespace-only item', () => {
    const { result } = renderHook(() => useRememberMe());
    act(() => {
      result.current.addItem('   ');
    });
    expect(result.current.items).toHaveLength(0);
  });

  it('trims whitespace when adding an item', () => {
    const { result } = renderHook(() => useRememberMe());
    act(() => {
      result.current.addItem('  hello  ');
    });
    expect(result.current.items[0].text).toBe('hello');
  });

  it('toggles an item done/undone', () => {
    const { result } = renderHook(() => useRememberMe());
    act(() => {
      result.current.addItem('Call dentist');
    });
    const id = result.current.items[0].id;
    act(() => {
      result.current.toggleItem(id);
    });
    expect(result.current.items[0].done).toBe(true);
    act(() => {
      result.current.toggleItem(id);
    });
    expect(result.current.items[0].done).toBe(false);
  });

  it('deletes an item', () => {
    const { result } = renderHook(() => useRememberMe());
    act(() => {
      result.current.addItem('Read book');
    });
    const id = result.current.items[0].id;
    act(() => {
      result.current.deleteItem(id);
    });
    expect(result.current.items).toHaveLength(0);
  });

  it('clears all done items', () => {
    const { result } = renderHook(() => useRememberMe());
    act(() => {
      result.current.addItem('Item A');
      result.current.addItem('Item B');
    });
    act(() => {
      result.current.toggleItem(result.current.items[0].id);
    });
    act(() => {
      result.current.clearDone();
    });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].text).toBe('Item B');
  });

  it('filters active items', () => {
    const { result } = renderHook(() => useRememberMe());
    act(() => {
      result.current.addItem('Item A');
      result.current.addItem('Item B');
    });
    act(() => {
      result.current.toggleItem(result.current.items[0].id);
      result.current.setFilter('active');
    });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].text).toBe('Item B');
  });

  it('filters done items', () => {
    const { result } = renderHook(() => useRememberMe());
    act(() => {
      result.current.addItem('Item A');
      result.current.addItem('Item B');
    });
    act(() => {
      result.current.toggleItem(result.current.items[0].id);
      result.current.setFilter('done');
    });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].text).toBe('Item A');
  });

  it('counts active and done items', () => {
    const { result } = renderHook(() => useRememberMe());
    act(() => {
      result.current.addItem('A');
      result.current.addItem('B');
      result.current.addItem('C');
    });
    act(() => {
      result.current.toggleItem(result.current.items[0].id);
    });
    expect(result.current.activeCount).toBe(2);
    expect(result.current.doneCount).toBe(1);
  });

  it('persists items to localStorage', () => {
    const { result } = renderHook(() => useRememberMe());
    act(() => {
      result.current.addItem('Persisted item');
    });
    const stored = JSON.parse(localStorageMock.getItem('rememberme-items') ?? '[]') as unknown[];
    expect(stored).toHaveLength(1);
  });

  it('loads items from localStorage on init', () => {
    localStorageMock.setItem(
      'rememberme-items',
      JSON.stringify([{ id: '1', text: 'Loaded item', done: false, createdAt: 1000 }]),
    );
    const { result } = renderHook(() => useRememberMe());
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].text).toBe('Loaded item');
  });
});
