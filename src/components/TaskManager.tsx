import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Lock } from 'lucide-react';
import TaskList from './TaskList';
import TaskForm from './TaskForm';
import TaskFilters from './TaskFilters';
import { Task, TaskFilters as TaskFiltersType } from '@/types/Task';
import { useTasks } from '@/hooks/useTasks';

/**
 * TaskManager component - Main interface for task management
 * Handles task CRUD operations, filtering, and sorting
 * 
 * @param isDemo - Whether the component is in demo mode (disables Add Task)
 */
interface TaskManagerProps {
  isDemo?: boolean;
}

const TaskManager = ({ isDemo = false }: TaskManagerProps) => {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState<TaskFiltersType>({});
  const [sortBy, setSortBy] = useState<'manual' | 'priority' | 'effort' | 'dueDate'>('manual');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const {
    tasks,
    isLoading,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    reorderTasks,
    toggleSubtask
  } = useTasks();

  // Demo tasks for when in demo mode
  const demoTasks: Task[] = useMemo(() => [
    {
      id: 'demo-1',
      title: 'Complete project proposal',
      description: 'Draft and finalize the Q4 project proposal',
      priority: 'high' as const,
      effort: 'long' as const,
      labels: ['Work', 'Important'],
      completed: false,
      created_at: new Date(),
      updated_at: new Date(),
      order_index: 0,
      subtasks: [],
      is_recurring: false,
      recurrence_interval: undefined,
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      user_id: 'demo-user',
      bucket_id: null
    },
    {
      id: 'demo-2',
      title: 'Review quarterly reports',
      description: 'Analyze Q3 performance metrics and prepare summary',
      priority: 'medium' as const,
      effort: 'medium' as const,
      labels: ['Work', 'Analysis'],
      completed: false,
      created_at: new Date(),
      updated_at: new Date(),
      order_index: 1,
      subtasks: [
        { id: 'demo-subtask-1', title: 'Download reports', completed: true },
        { id: 'demo-subtask-2', title: 'Create summary', completed: false }
      ],
      is_recurring: false,
      recurrence_interval: undefined,
      due_date: undefined,
      user_id: 'demo-user',
      bucket_id: null
    }
  ], []);

  // Use demo tasks when in demo mode, otherwise use real tasks
  const displayTasks = isDemo ? demoTasks : tasks;

  const handleAddTask = (taskData: Omit<Task, 'id' | 'completed' | 'created_at' | 'order_index'>) => {
    if (isDemo) return; // Prevent task creation in demo mode
    addTask(taskData);
    setShowTaskForm(false);
  };

  const handleEditTask = (task: Task) => {
    if (isDemo) return; // Prevent task editing in demo mode
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleUpdateTask = (taskData: Omit<Task, 'id' | 'completed' | 'created_at' | 'order_index'>) => {
    if (isDemo || !editingTask) return; // Prevent task updates in demo mode
    updateTask(editingTask.id, taskData);
    setEditingTask(null);
    setShowTaskForm(false);
  };

  const handleDeleteTask = (id: string) => {
    if (isDemo) return; // Prevent task deletion in demo mode
    deleteTask(id);
  };

  const handleToggleTask = (id: string) => {
    if (isDemo) return; // Prevent task toggling in demo mode
    toggleTask(id);
  };

  const handleDuplicateTask = (task: Task) => {
    if (isDemo) return; // Prevent task duplication in demo mode
    const duplicatedTask = {
      ...task,
      title: `${task.title} (Copy)`,
      id: 'duplicate-temp'
    };
    setEditingTask(duplicatedTask);
    setShowTaskForm(true);
  };

  const handleReorderTasks = (reorderedTasks: Task[]) => {
    if (isDemo) return; // Prevent reordering in demo mode
    reorderTasks(reorderedTasks);
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    if (isDemo) return; // Prevent subtask toggling in demo mode
    toggleSubtask(taskId, subtaskId);
  };

  if (isLoading && !isDemo) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Left Sidebar - Filters & Sort */}
      <div className="w-80 border-r border-gray-200 p-6">
        <Button 
          onClick={() => !isDemo && setShowTaskForm(true)} 
          className="w-full flex items-center justify-center gap-2 mb-6"
          disabled={isDemo}
        >
          {isDemo ? <Lock size={16} /> : <Plus size={16} />}
          Add Task
        </Button>

        <TaskFilters
          filters={filters}
          onFiltersChange={setFilters}
          sortBy={sortBy}
          onSortChange={setSortBy}
          sortDirection={sortDirection}
          onSortDirectionChange={setSortDirection}
        />
      </div>

      {/* Right Main Content - Task List */}
      <div className="flex-1 p-6">
        <TaskList
          tasks={displayTasks}
          filters={filters}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onToggleTask={handleToggleTask}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onDuplicateTask={handleDuplicateTask}
          onReorderTasks={handleReorderTasks}
          onToggleSubtask={handleToggleSubtask}
        />
      </div>

      {showTaskForm && !isDemo && (
        <TaskForm
          task={editingTask}
          onSubmit={editingTask ? handleUpdateTask : handleAddTask}
          onCancel={() => {
            setShowTaskForm(false);
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
};

export default TaskManager;
