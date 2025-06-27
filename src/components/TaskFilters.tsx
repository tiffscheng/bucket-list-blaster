
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TaskFilters as TTaskFilters } from '@/types/Task';
import { useTasks } from '@/hooks/useTasks';
import { useState, useEffect } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [labelsOpen, setLabelsOpen] = useState(false);
  
  // Get unique labels from all tasks and update when tasks change
  const allLabels = Array.from(new Set(tasks.flatMap(task => task.labels))).sort();

  // Update selected labels when tasks change (to remove labels that no longer exist)
  useEffect(() => {
    const validLabels = selectedLabels.filter(label => allLabels.includes(label));
    if (validLabels.length !== selectedLabels.length) {
      setSelectedLabels(validLabels);
      onFiltersChange({
        ...filters,
        labels: validLabels.length > 0 ? validLabels : undefined,
        label: validLabels.length === 1 ? validLabels[0] : undefined
      });
    }
  }, [allLabels, selectedLabels, filters, onFiltersChange]);

  const priorities = [
    { value: 'urgent', label: 'Urgent', color: 'bg-red-500 text-white' },
    { value: 'high', label: 'High', color: 'bg-orange-500 text-white' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-500 text-white' },
    { value: 'low', label: 'Low', color: 'bg-green-500 text-white' }
  ];

  const efforts = [
    { value: 'quick', label: 'Quick', color: 'bg-blue-500 text-white' },
    { value: 'medium', label: 'Medium', color: 'bg-purple-500 text-white' },
    { value: 'long', label: 'Long', color: 'bg-pink-500 text-white' },
    { value: 'massive', label: 'Massive', color: 'bg-gray-500 text-white' }
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

  const handleLabelToggle = (label: string) => {
    const newLabels = selectedLabels.includes(label)
      ? selectedLabels.filter(l => l !== label)
      : [...selectedLabels, label];
    
    setSelectedLabels(newLabels);
    onFiltersChange({
      ...filters,
      labels: newLabels.length > 0 ? newLabels : undefined,
      label: newLabels.length === 1 ? newLabels[0] : undefined
    });
  };

  const handleRemoveLabel = (labelToRemove: string) => {
    const newLabels = selectedLabels.filter(l => l !== labelToRemove);
    setSelectedLabels(newLabels);
    onFiltersChange({
      ...filters,
      labels: newLabels.length > 0 ? newLabels : undefined,
      label: newLabels.length === 1 ? newLabels[0] : undefined
    });
  };

  const clearAllLabels = () => {
    setSelectedLabels([]);
    onFiltersChange({
      ...filters,
      labels: undefined,
      label: undefined
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
          <Label className="text-sm font-medium mb-2 block">Priority</Label>
          <div className="flex flex-wrap gap-2">
            {priorities.map((priority) => (
              <Badge
                key={priority.value}
                variant={selectedPriorities.includes(priority.value) ? "default" : "outline"}
                className={cn(
                  "cursor-pointer transition-all hover:scale-105",
                  selectedPriorities.includes(priority.value) ? priority.color : "hover:bg-gray-100"
                )}
                onClick={() => handlePriorityChange(priority.value, !selectedPriorities.includes(priority.value))}
              >
                {priority.label}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium mb-2 block">Effort</Label>
          <div className="flex flex-wrap gap-2">
            {efforts.map((effort) => (
              <Badge
                key={effort.value}
                variant={selectedEfforts.includes(effort.value) ? "default" : "outline"}
                className={cn(
                  "cursor-pointer transition-all hover:scale-105",
                  selectedEfforts.includes(effort.value) ? effort.color : "hover:bg-gray-100"
                )}
                onClick={() => handleEffortChange(effort.value, !selectedEfforts.includes(effort.value))}
              >
                {effort.label}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium">Labels</Label>
          <div className="mt-2">
            <Popover open={labelsOpen} onOpenChange={setLabelsOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={labelsOpen}
                  className="w-full justify-between"
                >
                  {selectedLabels.length === 0
                    ? "Select labels..."
                    : `${selectedLabels.length} label${selectedLabels.length > 1 ? 's' : ''} selected`}
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <div className="max-h-60 overflow-y-auto bg-white">
                  {allLabels.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500">No labels found</div>
                  ) : (
                    <div className="p-1">
                      <div className="flex items-center justify-between p-2 border-b">
                        <span className="text-sm font-medium">Select Labels</span>
                        {selectedLabels.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearAllLabels}
                            className="text-xs h-6 px-2"
                          >
                            Clear All
                          </Button>
                        )}
                      </div>
                      {allLabels.map((label) => (
                        <div
                          key={label}
                          className="flex items-center justify-between w-full p-2 hover:bg-gray-100 cursor-pointer rounded"
                          onClick={() => handleLabelToggle(label)}
                        >
                          <span className="text-sm flex-1">{label}</span>
                          {selectedLabels.includes(label) && (
                            <Check className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            
            {selectedLabels.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedLabels.map((label) => (
                  <div
                    key={label}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    {label}
                    <button
                      onClick={() => handleRemoveLabel(label)}
                      className="hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskFilters;
