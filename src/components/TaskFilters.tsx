
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { TaskFilters as TTaskFilters } from '@/types/Task';
import { useTasks } from '@/hooks/useTasks';

interface TaskFiltersProps {
  filters: TTaskFilters;
  onFiltersChange: (filters: TTaskFilters) => void;
  sortBy: 'manual' | 'priority' | 'effort' | 'dueDate';
  onSortChange: (sort: 'manual' | 'priority' | 'effort' | 'dueDate') => void;
}

const TaskFilters = ({ filters, onFiltersChange, sortBy, onSortChange }: TaskFiltersProps) => {
  const { tasks } = useTasks();
  
  // Get unique labels from all tasks
  const allLabels = Array.from(new Set(tasks.flatMap(task => task.labels))).sort();

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = filters.priority || filters.effort || filters.label;

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

      <div className="space-y-3">
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
          <Label htmlFor="priority-filter" className="text-sm font-medium">Priority</Label>
          <Select 
            value={filters.priority || 'all'} 
            onValueChange={(value) => 
              onFiltersChange({ 
                ...filters, 
                priority: value === 'all' ? undefined : value as any 
              })
            }
          >
            <SelectTrigger id="priority-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
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
              onFiltersChange({ 
                ...filters, 
                effort: value === 'all' ? undefined : value as any 
              })
            }
          >
            <SelectTrigger id="effort-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Efforts</SelectItem>
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
                onFiltersChange({ 
                  ...filters, 
                  label: value === 'all' ? undefined : value 
                })
              }
            >
              <SelectTrigger id="label-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Labels</SelectItem>
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
    </div>
  );
};

export default TaskFilters;
