
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TaskFilters as TTaskFilters } from '@/types/Task';
import { useTasks } from '@/hooks/useTasks';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Check, ChevronDown, ChevronUp, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface TaskFiltersProps {
  filters: TTaskFilters;
  onFiltersChange: (filters: TTaskFilters) => void;
  sortBy: 'manual' | 'priority' | 'effort' | 'dueDate';
  onSortChange: (sort: 'manual' | 'priority' | 'effort' | 'dueDate') => void;
  sortDirection?: 'asc' | 'desc';
  onSortDirectionChange?: (direction: 'asc' | 'desc') => void;
}

const TaskFilters = ({ 
  filters, 
  onFiltersChange, 
  sortBy, 
  onSortChange,
  sortDirection = 'asc',
  onSortDirectionChange
}: TaskFiltersProps) => {
  const { tasks } = useTasks();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>(
    filters.priority ? [filters.priority] : []
  );
  const [selectedEfforts, setSelectedEfforts] = useState<string[]>(
    filters.effort ? [filters.effort] : []
  );
  const [selectedLabels, setSelectedLabels] = useState<string[]>(
    filters.label ? [filters.label] : []
  );
  
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

  const handleLabelChange = (label: string, checked: boolean) => {
    const newLabels = checked
      ? [...selectedLabels, label]
      : selectedLabels.filter(l => l !== label);
    
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

  const toggleSortDirection = () => {
    if (onSortDirectionChange) {
      onSortDirectionChange(sortDirection === 'asc' ? 'desc' : 'asc');
    }
  };

  const hasActiveFilters = selectedPriorities.length > 0 || selectedEfforts.length > 0 || selectedLabels.length > 0;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between cursor-pointer">
            <h3 className="font-medium text-gray-700 flex items-center gap-2">
              Filters & Sort
              {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </h3>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={(e) => {
                  e.stopPropagation();
                  clearFilters();
                }}>
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex-1">
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
            
            {sortBy !== 'manual' && onSortDirectionChange && (
              <div className="flex flex-col items-center">
                <Label className="text-sm font-medium mb-2">Order</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleSortDirection}
                  className="p-2"
                  title={`Sort ${sortDirection === 'asc' ? 'Ascending' : 'Descending'}`}
                >
                  {sortDirection === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                </Button>
              </div>
            )}
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
            <Label className="text-sm font-medium mb-2 block">Labels</Label>
            {allLabels.length === 0 ? (
              <p className="text-sm text-gray-500">No labels available</p>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {selectedLabels.length === 0 
                      ? "Select labels" 
                      : selectedLabels.length === 1 
                      ? selectedLabels[0]
                      : `${selectedLabels.length} labels selected`
                    }
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full min-w-[200px]" align="start">
                  {allLabels.map((label) => (
                    <DropdownMenuCheckboxItem
                      key={label}
                      checked={selectedLabels.includes(label)}
                      onCheckedChange={(checked) => handleLabelChange(label, checked)}
                    >
                      {label}
                    </DropdownMenuCheckboxItem>
                  ))}
                  {selectedLabels.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllLabels}
                        className="w-full text-left justify-start h-8"
                      >
                        Clear Selections
                      </Button>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default TaskFilters;
