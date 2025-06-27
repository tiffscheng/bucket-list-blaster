
import { useState, useEffect } from 'react';
import { useTasks } from '@/hooks/useTasks';
import TaskForm from './TaskForm';
import TaskList from './TaskList';
import TaskFilters from './TaskFilters';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Task, TaskFilters as TTaskFilters } from '@/types/Task';

const TaskManager = () => {
  const { tasks, addTask, updateTask, deleteTask, toggleTask, toggleSubtask, reorderTasks } = useTasks();
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [duplicatingTask, setDuplicatingTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState<TTaskFilters>({});
  const [sortBy, setSortBy] = useState<'manual' | 'priority' | 'effort' | 'dueDate'>('manual');

  const handleAddTask = (taskData: Omit<Task, 'id' | 'completed' | 'created_at' | 'order_index'>) => {
    addTask(taskData);
    setShowForm(false);
    setDuplicatingTask(null);
  };

  const handleEditTask = (taskData: Omit<Task, 'id' | 'completed' | 'created_at' | 'order_index'>) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
      setEditingTask(null);
    }
  };

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
    
    // Create a mock task object for the form
    setDuplicatingTask({
      ...duplicatedTaskData,
      id: 'duplicate-temp',
      completed: false,
      created_at: new Date(),
      order_index: 0
    });
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingTask(null);
    setDuplicatingTask(null);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-1/4">
          <div className="space-y-4">
            <Button
              onClick={() => setShowForm(true)}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <Plus size={18} className="mr-2" />
              Add New Task
            </Button>
            <TaskFilters
              filters={filters}
              onFiltersChange={setFilters}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />
          </div>
        </div>

        <div className="lg:w-3/4">
          <TaskList
            tasks={tasks}
            filters={filters}
            sortBy={sortBy}
            onToggleTask={toggleTask}
            onEditTask={setEditingTask}
            onDeleteTask={deleteTask}
            onDuplicateTask={handleDuplicateTask}
            onReorderTasks={reorderTasks}
            onToggleSubtask={toggleSubtask}
          />
        </div>
      </div>

      {(showForm || editingTask || duplicatingTask) && (
        <TaskForm
          task={editingTask || duplicatingTask}
          onSubmit={editingTask ? handleEditTask : handleAddTask}
          onCancel={handleCancelForm}
        />
      )}
    </div>
  );
};

export default TaskManager;
