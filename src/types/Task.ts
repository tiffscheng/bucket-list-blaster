
export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  effort: 'quick' | 'medium' | 'long' | 'massive';
  labels: string[];
  dueDate?: Date;
  completed: boolean;
  createdAt: Date;
  order: number;
  subtasks: Subtask[];
}

export interface TaskFilters {
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  effort?: 'quick' | 'medium' | 'long' | 'massive';
  label?: string;
}
