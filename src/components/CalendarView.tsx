
import { useState, useMemo } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { Button } from '@/components/ui/button';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isAfter, startOfDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Task } from '@/types/Task';
import { cn } from '@/lib/utils';

const CalendarView = () => {
  const { tasks } = useTasks();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  const tasksWithDueDates = tasks.filter(task => task.due_date && !task.completed);
  
  const upcomingTasks = useMemo(() => {
    const today = startOfDay(new Date());
    return tasksWithDueDates
      .filter(task => task.due_date && isAfter(task.due_date, today))
      .sort((a, b) => (a.due_date!.getTime() - b.due_date!.getTime()))
      .slice(0, 5);
  }, [tasksWithDueDates]);

  const getTasksForDate = (date: Date) => {
    return tasksWithDueDates.filter(task => 
      task.due_date && isSameDay(task.due_date, date)
    );
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get first day of week (0 = Sunday)
  const startDay = monthStart.getDay();
  const emptyDays = Array(startDay).fill(null);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        {/* Main Calendar */}
        <div className="lg:w-3/4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-800">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                  <ChevronLeft size={16} />
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              {(['daily', 'weekly', 'monthly'] as const).map((viewType) => (
                <Button
                  key={viewType}
                  variant={view === viewType ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setView(viewType)}
                  className="capitalize"
                >
                  {viewType}
                </Button>
              ))}
            </div>
          </div>

          {view === 'monthly' && (
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
                  {day}
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-7 gap-1 min-h-96">
            {/* Empty days at start of month */}
            {emptyDays.map((_, index) => (
              <div key={`empty-${index}`} className="p-2 h-24 bg-gray-50 rounded"></div>
            ))}
            
            {/* Days of the month */}
            {monthDays.map((day) => {
              const dayTasks = getTasksForDate(day);
              const isToday = isSameDay(day, new Date());
              
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "p-2 h-24 border rounded hover:bg-gray-50 transition-colors",
                    isToday ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"
                  )}
                >
                  <div className={cn(
                    "text-sm font-medium mb-1",
                    isToday ? "text-blue-600" : "text-gray-700"
                  )}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayTasks.slice(0, 2).map((task) => (
                      <div
                        key={task.id}
                        className="text-xs p-1 rounded text-white truncate"
                        style={{ backgroundColor: getPriorityColor(task.priority) }}
                        title={task.title}
                      >
                        {task.title}
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{dayTasks.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Tasks Sidebar */}
        <div className="lg:w-1/4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar size={18} />
              Upcoming Tasks
            </h3>
            
            {upcomingTasks.length === 0 ? (
              <p className="text-gray-500 text-sm">No upcoming tasks with due dates</p>
            ) : (
              <div className="space-y-3">
                {upcomingTasks.map((task) => (
                  <div key={task.id} className="bg-white p-3 rounded-lg border">
                    <div className="flex items-start gap-2 mb-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full mt-2",
                        getPriorityColor(task.priority)
                      )} />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-gray-900 truncate">
                          {task.title}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1">
                          Due {format(task.due_date!, 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    {task.labels.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {task.labels.slice(0, 2).map((label) => (
                          <span
                            key={label}
                            className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                          >
                            {label}
                          </span>
                        ))}
                        {task.labels.length > 2 && (
                          <span className="text-xs text-gray-400">
                            +{task.labels.length - 2}
                          </span>
                        )}
                      </div>
                    )}
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

export default CalendarView;
