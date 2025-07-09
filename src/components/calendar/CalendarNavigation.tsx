
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ViewMode, formatViewTitle } from './CalendarUtils';

interface CalendarNavigationProps {
  selectedDate: Date;
  viewMode: ViewMode;
  rangeStart: Date;
  rangeEnd: Date;
  onNavigate: (direction: 'prev' | 'next') => void;
  onViewModeChange: (mode: ViewMode) => void;
}

const CalendarNavigation = ({
  selectedDate,
  viewMode,
  rangeStart,
  rangeEnd,
  onNavigate,
  onViewModeChange
}: CalendarNavigationProps) => {
  return (
    <>
      {/* View Mode Buttons */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'daily' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewModeChange('daily')}
          >
            Daily
          </Button>
          <Button
            variant={viewMode === 'weekly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewModeChange('weekly')}
          >
            Weekly
          </Button>
          <Button
            variant={viewMode === 'monthly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewModeChange('monthly')}
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
        <h3 className="text-lg font-semibold">
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
