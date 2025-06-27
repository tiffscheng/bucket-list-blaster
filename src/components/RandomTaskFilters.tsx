
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { TaskFilters } from '@/types/Task';

interface RandomTaskFiltersProps {
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
  allLabels: string[];
  filteredTasksCount: number;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

const RandomTaskFilters = ({ 
  filters, 
  onFiltersChange, 
  allLabels, 
  filteredTasksCount, 
  hasActiveFilters, 
  onClearFilters 
}: RandomTaskFiltersProps) => {
  return (
    <div className="bg-gray-50 rounded-xl p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-700">Filter Options</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
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
  );
};

export default RandomTaskFilters;
