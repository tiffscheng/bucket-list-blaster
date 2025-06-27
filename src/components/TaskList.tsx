
import { useMemo, useState } from 'react';
import TaskItem from './TaskItem';
import BucketView from './BucketView';
import { Task, TaskFilters } from '@/types/Task';
import { Button } from '@/components/ui/button';
import { Grid, List } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  filters: TaskFilters;
  sortBy: 'manual' | 'priority' | 'effort' | 'dueDate';
  onToggleTask: (id: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onDuplicateTask: (task: Task) => void;
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
  onDuplicateTask,
  onReorderTasks,
  onToggleSubtask
}: TaskListProps) => {
  const [viewMode, setViewMode] = useState<'list' | 'buckets'>('list');
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [draggedOverIndex, setDraggedOverIndex] = useState<number | null>(null);

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

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', '');
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDraggedOverIndex(index);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if we're leaving the entire drop zone
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDraggedOverIndex(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (!draggedTask) return;

    const otherTasks = tasks.filter(task => task.id !== draggedTask.id);
    const reorderedTasks = [
      ...otherTasks.slice(0, targetIndex),
      draggedTask,
      ...otherTasks.slice(targetIndex)
    ].map((task, index) => ({ ...task, order_index: index }));

    onReorderTasks(reorderedTasks);
    setDraggedTask(null);
    setDraggedOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDraggedOverIndex(null);
  };

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
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-700">
              Active Tasks ({activeTasks.length})
            </h3>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List size={16} className="mr-1" />
                List
              </Button>
              <Button
                variant={viewMode === 'buckets' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('buckets')}
              >
                <Grid size={16} className="mr-1" />
                Buckets
              </Button>
            </div>
          </div>

          {viewMode === 'buckets' ? (
            <BucketView
              tasks={activeTasks}
              onToggleTask={onToggleTask}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
              onDuplicateTask={onDuplicateTask}
              onReorderTasks={onReorderTasks}
              onToggleSubtask={onToggleSubtask}
            />
          ) : (
            <div className="space-y-2">
              {activeTasks.map((task, index) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`
                    transition-all duration-200 ease-in-out cursor-move
                    ${draggedTask?.id === task.id 
                      ? 'opacity-50 scale-95 rotate-1 shadow-lg' 
                      : 'opacity-100 scale-100 rotate-0'
                    }
                    ${draggedOverIndex === index && draggedTask?.id !== task.id
                      ? 'transform translate-y-1 shadow-md border-2 border-blue-300 border-dashed'
                      : ''
                    }
                    hover:shadow-sm
                  `}
                >
                  <TaskItem
                    task={task}
                    onToggle={onToggleTask}
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                    onDuplicate={onDuplicateTask}
                    onToggleSubtask={onToggleSubtask}
                  />
                </div>
              ))}
            </div>
          )}
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
                onDuplicate={onDuplicateTask}
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
