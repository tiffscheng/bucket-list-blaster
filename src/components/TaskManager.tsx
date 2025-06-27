
import { useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import TaskForm from './TaskForm';
import TaskList from './TaskList';
import TaskFilters from './TaskFilters';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Task, TaskFilters as TTaskFilters } from '@/types/Task';

const TaskManager = () => {
  const { tasks, addTask, updateTask, deleteTask, toggleTask, reorderTasks } = useTasks();
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState<TTaskFilters>({});
  const [sortBy, setSortBy] = useState<'manual' | 'priority' | 'effort' | 'dueDate'>('manual');

  const handleAddTask = (taskData: Omit<Task, 'id' | 'completed' | 'createdAt' | 'order'>) => {
    addTask(taskData);
    setShowForm(false);
  };

  const handleEditTask = (taskData: Omit<Task, 'id' | 'completed' | 'createdAt' | 'order'>) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
      setEditingTask(null);
    }
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
            onReorderTasks={reorderTasks}
          />
        </div>
      </div>

      {(showForm || editingTask) && (
        <TaskForm
          task={editingTask}
          onSubmit={editingTask ? handleEditTask : handleAddTask}
          onCancel={() => {
            setShowForm(false);
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
};

export default TaskManager;
