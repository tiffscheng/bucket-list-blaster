import { useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { Button } from '@/components/ui/button';
import { Shuffle, Sparkles } from 'lucide-react';
import { Task, TaskFilters } from '@/types/Task';
import TaskItem from './TaskItem';
import TaskForm from './TaskForm';
import RandomTaskFilters from './RandomTaskFilters';

const RandomTaskGenerator = () => {
  const { tasks, updateTask, deleteTask, toggleTask, addTask } = useTasks();
  const [filters, setFilters] = useState<TaskFilters>({});
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [duplicatingTask, setDuplicatingTask] = useState<Task | null>(null);

  const allLabels = Array.from(new Set(tasks.flatMap(task => task.labels))).sort();
  const activeTasks = tasks.filter(task => !task.completed);

  const getFilteredTasks = () => {
    return activeTasks.filter(task => {
      if (filters.priority && task.priority !== filters.priority) return false;
      if (filters.effort && task.effort !== filters.effort) return false;
      if (filters.label && !task.labels.includes(filters.label)) return false;
      return true;
    });
  };

  const generateRandomTask = () => {
    const filteredTasks = getFilteredTasks();
    
    if (filteredTasks.length === 0) {
      setSelectedTask(null);
      return;
    }

    setIsGenerating(true);
    
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * filteredTasks.length);
      const randomTask = filteredTasks[randomIndex];
      setSelectedTask(randomTask);
      setIsGenerating(false);
    }, 800);
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
    
    setDuplicatingTask({
      ...duplicatedTaskData,
      id: 'duplicate-temp',
      completed: false,
      created_at: new Date(),
      order_index: 0
    });
  };

  const handleSubmitDuplicate = (taskData: Omit<Task, 'id' | 'completed' | 'created_at' | 'order_index'>) => {
    addTask(taskData);
    setDuplicatingTask(null);
  };

  const clearFilters = () => {
    setFilters({});
  };

  const filteredTasksCount = getFilteredTasks().length;
  const hasActiveFilters = Boolean(filters.priority || filters.effort || filters.label);

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Random Task Generator</h2>
          <p className="text-gray-600">
            Let us pick your next task! Set your filters and let fate decide what to work on.
          </p>
        </div>

        <RandomTaskFilters
          filters={filters}
          onFiltersChange={setFilters}
          allLabels={allLabels}
          filteredTasksCount={filteredTasksCount}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearFilters}
        />

        <div className="text-center mb-8">
          <Button
            onClick={generateRandomTask}
            disabled={filteredTasksCount === 0 || isGenerating}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 text-lg"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Choosing...
              </>
            ) : (
              <>
                <Shuffle className="mr-2" size={20} />
                Generate Random Task
              </>
            )}
          </Button>
        </div>

        {selectedTask && !isGenerating && (
          <div className="bg-white rounded-xl border-2 border-purple-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 text-center">
              <h3 className="text-lg font-semibold">🎯 Your Random Task</h3>
            </div>
            <div className="p-4">
              <TaskItem
                task={selectedTask}
                onToggle={toggleTask}
                onEdit={(task) => updateTask(task.id, task)}
                onDelete={deleteTask}
                onDuplicate={handleDuplicateTask}
              />
            </div>
          </div>
        )}

        {duplicatingTask && (
          <TaskForm
            task={duplicatingTask}
            onSubmit={handleSubmitDuplicate}
            onCancel={() => setDuplicatingTask(null)}
          />
        )}

        {filteredTasksCount === 0 && activeTasks.length > 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No tasks match your current filters.</p>
            <p className="text-sm mt-2">Try adjusting your filter settings above.</p>
          </div>
        )}

        {activeTasks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No active tasks available.</p>
            <p className="text-sm mt-2">Add some tasks first to use the random generator!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RandomTaskGenerator;
