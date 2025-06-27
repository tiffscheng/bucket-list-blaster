
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { TaskFilters as TTaskFilters } from '@/types/Task';
import { useTasks } from '@/hooks/useTasks';
import { useState } from 'react';

interface TaskFiltersProps {
  filters: TTaskFilters;
  onFiltersChange: (filters: TTaskFilters) => void;
  sortBy: 'manual' | 'priority' | 'effort' | 'dueDate';
  onSortChange: (sort: 'manual' | 'priority' | 'effort' | 'dueDate') => void;
}

const TaskFilters = ({ filters, onFiltersChange, sortBy, onSortChange }: TaskFiltersProps) => {
  const { tasks } = useTasks();
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>(
    filters.priority ? [filters.priority] : []
  );
  const [selectedEfforts, setSelectedEfforts] = useState<string[]>(
    filters.effort ? [filters.effort] : []
  );
  const [selectedLabels, setSelectedLabels] = useState<string[]>(
    filters.label ? [filters.label] : []
  );
  
  // Get unique labels from all tasks
  const allLabels = Array.from(new Set(tasks.flatMap(task => task.labels))).sort();

  const priorities = [
    { value: 'urgent', label: 'Urgent' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ];

  const efforts = [
    { value: 'quick', label: 'Quick' },
    { value: 'medium', label: 'Medium' },
    { value: 'long', label: 'Long' },
    { value: 'massive', label: 'Massive' }
  ];

  const handlePriorityChange = (priority: string, checked: boolean) => {
    const newPriorities = checked 
      ? [...selectedPriorities, priority]
      : selectedPriorities.filter(p => p !== priority);
    
    setSelectedPriorities(newPriorities);
    onFiltersChange({
      ...filters,
      priority: newPriorities.length === 1 ? newPriorities[0] as any : undefined
    });
  };

  const handleEffortChange = (effort: string, checked: boolean) => {
    const newEfforts = checked 
      ? [...selectedEfforts, effort]
      : selectedEfforts.filter(e => e !== effort);
    
    setSelectedEfforts(newEfforts);
    onFiltersChange({
      ...filters,
      effort: newEfforts.length === 1 ? newEfforts[0] as any : undefined
    });
  };

  const handleLabelChange = (label: string, checked: boolean) => {
    const newLabels = checked 
      ? [...selectedLabels, label]
      : selectedLabels.filter(l => l !== label);
    
    setSelectedLabels(newLabels);
    onFiltersChange({
      ...filters,
      label: newLabels.length === 1 ? newLabels[0] : undefined
    });
  };

  const clearFilters = () => {
    setSelectedPriorities([]);
    setSelectedEfforts([]);
    setSelectedLabels([]);
    onFiltersChange({});
  };

  const hasActiveFilters = selectedPriorities.length > 0 || selectedEfforts.length > 0 || selectedLabels.length > 0;

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-700">Filters & Sort</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="sort" className="text-sm font-medium">Sort by</Label>
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger id="sort">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manual">Manual Order</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="effort">Effort Required</SelectItem>
              <SelectItem value="dueDate">Due Date</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium">Priority</Label>
          <div className="space-y-2 mt-2">
            {priorities.map((priority) => (
              <div key={priority.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`priority-${priority.value}`}
                  checked={selectedPriorities.includes(priority.value)}
                  onCheckedChange={(checked) => handlePriorityChange(priority.value, !!checked)}
                />
                <Label htmlFor={`priority-${priority.value}`} className="text-sm">
                  {priority.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium">Effort</Label>
          <div className="space-y-2 mt-2">
            {efforts.map((effort) => (
              <div key={effort.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`effort-${effort.value}`}
                  checked={selectedEfforts.includes(effort.value)}
                  onCheckedChange={(checked) => handleEffortChange(effort.value, !!checked)}
                />
                <Label htmlFor={`effort-${effort.value}`} className="text-sm">
                  {effort.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {allLabels.length > 0 && (
          <div>
            <Label className="text-sm font-medium">Labels</Label>
            <div className="space-y-2 mt-2 max-h-32 overflow-y-auto">
              {allLabels.map((label) => (
                <div key={label} className="flex items-center space-x-2">
                  <Checkbox
                    id={`label-${label}`}
                    checked={selectedLabels.includes(label)}
                    onCheckedChange={(checked) => handleLabelChange(label, !!checked)}
                  />
                  <Label htmlFor={`label-${label}`} className="text-sm">
                    {label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskFilters;
