
import { useState } from 'react';
import { Task } from '@/types/Task';
import TaskForm from './TaskForm';

interface TaskDuplicationHandlerProps {
  onDuplicateTask: (task: Task) => void;
}

export const useTaskDuplication = ({ onDuplicateTask }: TaskDuplicationHandlerProps) => {
  const [duplicatingTask, setDuplicatingTask] = useState<Task | null>(null);

  const handleDuplicateTask = (task: Task) => {
    const duplicatedTaskData = {
      title: `${task.title} (Copy)`,
      description: task.description,
      priority: task.priority,
      effort: task.effort,
      labels: [...task.labels],
      due_date: task.due_date,
      bucket_id: task.bucket_id,
      subtasks: task.subtasks.map(subtask => ({
        id: crypto.randomUUID(),
        title: subtask.title,
        completed: false
      })),
      is_recurring: task.is_recurring,
      recurrence_interval: task.recurrence_interval,
      user_id: task.user_id,
      updated_at: task.updated_at,
    };
    
    setDuplicatingTask({
      ...duplicatedTaskData,
      id: 'duplicate-temp',
      completed: false,
      created_at: new Date(),
      order_index: 0
    });
  };

  const handleSubmitDuplicate = (taskData: Omit<Task, 'id' | 'completed' | 'created_at' | 'order_index'>) => {
    onDuplicateTask({
      ...taskData,
      id: crypto.randomUUID(),
      completed: false,
      created_at: new Date(),
      order_index: 0
    });
    setDuplicatingTask(null);
  };

  const TaskDuplicationForm = duplicatingTask ? (
    <TaskForm
      task={duplicatingTask}
      onSubmit={handleSubmitDuplicate}
      onCancel={() => setDuplicatingTask(null)}
    />
  ) : null;

  return {
    handleDuplicateTask,
    TaskDuplicationForm
  };
};
