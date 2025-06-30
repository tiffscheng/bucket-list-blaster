
import { useState, useMemo } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { Button } from '@/components/ui/button';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isAfter, startOfDay, startOfWeek, endOfWeek, addDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, RotateCcw } from 'lucide-react';
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

  const recurringTasks = useMemo(() => {
    return tasks.filter(task => task.is_recurring && !task.completed);
  }, [tasks]);

  const dailyRecurringTasks = recurringTasks.filter(task => task.recurrence_interval === 'daily');
  const weeklyRecurringTasks = recurringTasks.filter(task => task.recurrence_interval === 'weekly');
  const monthlyRecurringTasks = recurringTasks.filter(task => task.recurrence_interval === 'monthly');
  const yearlyRecurringTasks = recurringTasks.filter(task => task.recurrence_interval === 'yearly');

  const getTasksForDate = (date: Date) => {
    return tasksWithDueDates.filter(task => 
      task.due_date && isSameDay(task.due_date, date)
    );
  };

  const handleDayClick = (date: Date) => {
    setCurrentDate(date);
    setView('daily');
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (view === 'daily') {
        newDate.setDate(prev.getDate() + (direction === 'next' ? 1 : -1));
      } else if (view === 'weekly') {
        newDate.setDate(prev.getDate() + (direction === 'next' ? 7 : -7));
      } else {
        newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      }
      return newDate;
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const renderDailyView = () => {
    const dayTasks = getTasksForDate(currentDate);
    
    return (
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        <div className="flex-1 w-full lg:w-auto">
          <div className="bg-white rounded-lg border p-6 min-h-96">
            <h3 className="text-lg font-semibold mb-4">
              Tasks for {format(currentDate, 'EEEE, MMMM d, yyyy')}
            </h3>
            
            {dayTasks.length === 0 ? (
              <p className="text-gray-500">No tasks scheduled for this day</p>
            ) : (
              <div className="space-y-3">
                {dayTasks.map((task) => (
                  <div key={task.id} className="border rounded-lg p-3">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-3 h-3 rounded-full mt-1",
                        getPriorityColor(task.priority)
                      )} />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{task.title}</h4>
                        {task.description && (
                          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                            {task.priority}
                          </span>
                          <span className="text-xs px-2 py-1 bg-blue-100 rounded">
                            {task.effort}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="w-full lg:w-80">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <RotateCcw size={18} />
              Daily Recurring Tasks
            </h3>
            
            {dailyRecurringTasks.length === 0 ? (
              <p className="text-gray-500 text-sm">No daily recurring tasks</p>
            ) : (
              <div className="space-y-3">
                {dailyRecurringTasks.map((task) => (
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
                          Repeats daily
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderWeeklyView = () => {
    const weekStart = startOfWeek(currentDate);
    const weekEnd = endOfWeek(currentDate);
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return (
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        <div className="flex-1 w-full lg:w-auto">
          <div className="bg-white rounded-lg border p-6 min-h-96">
            <h3 className="text-lg font-semibold mb-4">
              Week of {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
            </h3>
            
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day) => {
                const dayTasks = getTasksForDate(day);
                const isToday = isSameDay(day, new Date());
                
                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      "p-3 border rounded-lg min-h-40 cursor-pointer hover:shadow-md transition-shadow",
                      isToday ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"
                    )}
                    onClick={() => handleDayClick(day)}
                  >
                    <div className={cn(
                      "text-sm font-medium mb-2",
                      isToday ? "text-blue-600" : "text-gray-700"
                    )}>
                      {format(day, 'EEE d')}
                    </div>
                    <div className="space-y-1">
                      {dayTasks.map((task) => (
                        <div
                          key={task.id}
                          className={cn(
                            "text-xs p-1.5 rounded text-white truncate",
                            getPriorityColor(task.priority)
                          )}
                          title={task.title}
                        >
                          {task.title}
                        </div>
                      ))}
                      {dayTasks.length > 4 && (
                        <div className="text-xs text-gray-500 font-medium">
                          +{dayTasks.length - 4} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-80">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <RotateCcw size={18} />
              Weekly Recurring Tasks
            </h3>
            
            {weeklyRecurringTasks.length === 0 ? (
              <p className="text-gray-500 text-sm">No weekly recurring tasks</p>
            ) : (
              <div className="space-y-3">
                {weeklyRecurringTasks.map((task) => (
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
                          Repeats weekly
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderMonthlyView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startDay = monthStart.getDay();
    const emptyDays = Array(startDay).fill(null);

    return (
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        <div className="lg:w-3/4">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 min-h-96">
            {emptyDays.map((_, index) => (
              <div key={`empty-${index}`} className="p-2 h-32 bg-gray-50 rounded"></div>
            ))}
            
            {monthDays.map((day) => {
              const dayTasks = getTasksForDate(day);
              const isToday = isSameDay(day, new Date());
              
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "p-2 h-32 border rounded cursor-pointer hover:shadow-md transition-all hover:bg-gray-50",
                    isToday ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"
                  )}
                  onClick={() => handleDayClick(day)}
                >
                  <div className={cn(
                    "text-sm font-medium mb-1",
                    isToday ? "text-blue-600" : "text-gray-700"
                  )}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayTasks.slice(0, 3).map((task) => (
                      <div
                        key={task.id}
                        className={cn(
                          "text-xs p-1 rounded text-white truncate",
                          getPriorityColor(task.priority)
                        )}
                        title={task.title}
                      >
                        {task.title}
                      </div>
                    ))}
                    {dayTasks.length > 3 && (
                      <div className="text-xs text-gray-500 font-medium">
                        +{dayTasks.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:w-1/4 space-y-4">
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

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <RotateCcw size={18} />
              Recurring Tasks
            </h3>
            
            {recurringTasks.length === 0 ? (
              <p className="text-gray-500 text-sm">No recurring tasks</p>
            ) : (
              <div className="space-y-3">
                {recurringTasks.map((task) => (
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
                          Repeats {task.recurrence_interval}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800">
            {view === 'daily' ? format(currentDate, 'EEEE, MMMM d, yyyy') :
             view === 'weekly' ? `Week of ${format(startOfWeek(currentDate), 'MMM d, yyyy')}` :
             format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" onClick={() => navigateDate('prev')}>
              <ChevronLeft size={16} />
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigateDate('next')}>
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

      {view === 'daily' && renderDailyView()}
      {view === 'weekly' && renderWeeklyView()}
      {view === 'monthly' && renderMonthlyView()}
    </div>
  );
};

export default CalendarView;
