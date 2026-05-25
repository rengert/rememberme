export interface RememberItem {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
}

export type FilterMode = 'all' | 'active' | 'done';
