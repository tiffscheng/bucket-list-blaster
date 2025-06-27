
import { useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Shuffle, Sparkles } from 'lucide-react';
import { Task, TaskFilters } from '@/types/Task';
import TaskItem from './TaskItem';

const RandomTaskGenerator = () => {
  const { tasks, updateTask, deleteTask, toggleTask } = useTasks();
  const [filters, setFilters] = useState<TaskFilters>({});
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

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
    
    // Add some suspense with a delay
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * filteredTasks.length);
      setSelectedTask(filteredTasks[randomIndex]);
      setIsGenerating(false);
    }, 800);
  };

  const clearFilters = () => {
    setFilters({});
  };

  const filteredTasksCount = getFilteredTasks().length;
  const hasActiveFilters = filters.priority || filters.effort || filters.label;

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

        {/* Filters */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">Filter Options</h3>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="priority-filter" className="text-sm font-medium">Priority</Label>
              <Select 
                value={filters.priority || 'all'} 
                onValueChange={(value) => 
                  setFilters({ 
                    ...filters, 
                    priority: value === 'all' ? undefined : value as any 
                  })
                }
              >
                <SelectTrigger id="priority-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="effort-filter" className="text-sm font-medium">Effort</Label>
              <Select 
                value={filters.effort || 'all'} 
                onValueChange={(value) => 
                  setFilters({ 
                    ...filters, 
                    effort: value === 'all' ? undefined : value as any 
                  })
                }
              >
                <SelectTrigger id="effort-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Effort</SelectItem>
                  <SelectItem value="quick">Quick</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="long">Long</SelectItem>
                  <SelectItem value="massive">Massive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {allLabels.length > 0 && (
              <div>
                <Label htmlFor="label-filter" className="text-sm font-medium">Label</Label>
                <Select 
                  value={filters.label || 'all'} 
                  onValueChange={(value) => 
                    setFilters({ 
                      ...filters, 
                      label: value === 'all' ? undefined : value 
                    })
                  }
                >
                  <SelectTrigger id="label-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Label</SelectItem>
                    {allLabels.map((label) => (
                      <SelectItem key={label} value={label}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="mt-4 text-sm text-gray-600">
            <span className="font-medium">{filteredTasksCount}</span> tasks match your current filters
          </div>
        </div>

        {/* Generate Button */}
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

        {/* Selected Task */}
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
              />
            </div>
          </div>
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
