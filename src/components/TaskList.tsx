
import { useMemo } from 'react';
import TaskItem from './TaskItem';
import { Task, TaskFilters } from '@/types/Task';

interface TaskListProps {
  tasks: Task[];
  filters: TaskFilters;
  sortBy: 'manual' | 'priority' | 'effort' | 'dueDate';
  onToggleTask: (id: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onReorderTasks: (tasks: Task[]) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
}

const TaskList = ({ 
  tasks, 
  filters, 
  sortBy, 
  onToggleTask, 
  onEditTask, 
  onDeleteTask,
  onReorderTasks,
  onToggleSubtask
}: TaskListProps) => {
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks.filter(task => {
      if (filters.priority && task.priority !== filters.priority) return false;
      if (filters.effort && task.effort !== filters.effort) return false;
      if (filters.label && !task.labels.includes(filters.label)) return false;
      return true;
    });

    if (sortBy === 'manual') {
      filtered.sort((a, b) => a.order_index - b.order_index);
    } else if (sortBy === 'priority') {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      filtered.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    } else if (sortBy === 'effort') {
      const effortOrder = { quick: 0, medium: 1, long: 2, massive: 3 };
      filtered.sort((a, b) => effortOrder[a.effort] - effortOrder[b.effort]);
    } else if (sortBy === 'dueDate') {
      filtered.sort((a, b) => {
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return a.due_date.getTime() - b.due_date.getTime();
      });
    }

    return filtered;
  }, [tasks, filters, sortBy]);

  const activeTasks = filteredAndSortedTasks.filter(task => !task.completed);
  const completedTasks = filteredAndSortedTasks.filter(task => task.completed);

  if (filteredAndSortedTasks.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No tasks found</p>
        <p className="text-sm mt-2">Try adjusting your filters or add a new task</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {activeTasks.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            Active Tasks ({activeTasks.length})
          </h3>
          <div className="space-y-2">
            {activeTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={onToggleTask}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                onToggleSubtask={onToggleSubtask}
              />
            ))}
          </div>
        </div>
      )}

      {completedTasks.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            Completed Tasks ({completedTasks.length})
          </h3>
          <div className="space-y-2">
            {completedTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={onToggleTask}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                onToggleSubtask={onToggleSubtask}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;
