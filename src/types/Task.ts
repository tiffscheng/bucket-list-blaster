
export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  user_id?: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  effort: 'quick' | 'medium' | 'long' | 'massive';
  labels: string[];
  due_date?: Date;
  completed: boolean;
  created_at: Date;
  updated_at?: Date;
  order_index: number;
  subtasks: Subtask[];
  is_recurring: boolean;
  recurrence_interval?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  last_completed_at?: Date;
}

export interface TaskFilters {
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  effort?: 'quick' | 'medium' | 'long' | 'massive';
  label?: string;
}
