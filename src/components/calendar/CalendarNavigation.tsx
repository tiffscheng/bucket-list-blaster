
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { ViewMode, formatViewTitle } from './CalendarUtils';

interface CalendarNavigationProps {
  selectedDate: Date;
  viewMode: ViewMode;
  rangeStart: Date;
  rangeEnd: Date;
  onNavigate: (direction: 'prev' | 'next') => void;
  onViewModeChange: (mode: ViewMode) => void;
  showSidebar?: boolean;
  onToggleSidebar?: () => void;
}

const CalendarNavigation = ({
  selectedDate,
  viewMode,
  rangeStart,
  rangeEnd,
  onNavigate,
  onViewModeChange,
  showSidebar,
  onToggleSidebar
}: CalendarNavigationProps) => {
  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold truncate">
          {formatViewTitle(selectedDate, viewMode, rangeStart, rangeEnd)}
        </h3>
        {onToggleSidebar && (
          <Button
            variant="outline"
            size="icon"
            onClick={onToggleSidebar}
          >
            <Menu size={16} />
          </Button>
        )}
      </div>

      {/* View Mode Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant={viewMode === 'daily' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewModeChange('daily')}
            className="flex-1 sm:flex-none"
          >
            Daily
          </Button>
          <Button
            variant={viewMode === 'weekly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewModeChange('weekly')}
            className="flex-1 sm:flex-none"
          >
            Weekly
          </Button>
          <Button
            variant={viewMode === 'monthly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewModeChange('monthly')}
            className="flex-1 sm:flex-none"
          >
            Monthly
          </Button>
        </div>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" size="sm" onClick={() => onNavigate('prev')}>
          <ChevronLeft size={16} />
        </Button>
        <h3 className="text-lg font-semibold text-center flex-1 hidden lg:block">
          {formatViewTitle(selectedDate, viewMode, rangeStart, rangeEnd)}
        </h3>
        <Button variant="outline" size="sm" onClick={() => onNavigate('next')}>
          <ChevronRight size={16} />
        </Button>
      </div>
    </>
  );
};

export default CalendarNavigation;
