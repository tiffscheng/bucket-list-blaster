import { useState, useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, isSameDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, addWeeks, addMonths, subDays, subWeeks, subMonths, isWithinInterval, eachDayOfInterval } from 'date-fns';
import { Task } from '@/types/Task';
import { useTasks } from '@/hooks/useTasks';
import TaskForm from './TaskForm';
import TaskItem from './TaskItem';

/**
 * CalendarView component - Calendar interface for viewing and managing tasks
 * Shows tasks organized by their due dates in a calendar format
 * 
 * @param isDemo - Whether the component is in demo mode (disables task operations)
 */
interface CalendarViewProps {
  isDemo?: boolean;
}

const CalendarView = ({ isDemo = false }: CalendarViewProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const {
    tasks,
    isLoading,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    toggleSubtask
  } = useTasks();

  // Demo tasks for when in demo mode
  const demoTasks: Task[] = useMemo(() => [
    {
      id: 'demo-cal-1',
      title: 'Team meeting',
      description: 'Weekly team standup meeting',
      priority: 'medium' as const,
      effort: 'quick' as const,
      labels: ['Work', 'Meeting'],
      completed: false,
      created_at: new Date(),
      updated_at: new Date(),
      order_index: 0,
      subtasks: [],
      is_recurring: true,
      recurrence_interval: 'weekly' as const,
      due_date: new Date(), // Today
      user_id: 'demo-user',
      bucket_id: null
    },
    {
      id: 'demo-cal-2',
      title: 'Project deadline',
      description: 'Submit final project deliverables',
      priority: 'high' as const,
      effort: 'long' as const,
      labels: ['Work', 'Deadline'],
      completed: false,
      created_at: new Date(),
      updated_at: new Date(),
      order_index: 1,
      subtasks: [],
      is_recurring: false,
      recurrence_interval: undefined,
      due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      user_id: 'demo-user',
      bucket_id: null
    }
  ], []);

  // Use demo tasks when in demo mode, otherwise use real tasks
  const displayTasks = isDemo ? demoTasks : tasks;

  const tasksWithDueDates = displayTasks.filter(task => task.due_date);
  const recurringTasks = displayTasks.filter(task => task.is_recurring);
  
  const getDateRange = () => {
    switch (viewMode) {
      case 'daily':
        return { start: selectedDate, end: selectedDate };
      case 'weekly':
        return { start: startOfWeek(selectedDate), end: endOfWeek(selectedDate) };
      case 'monthly':
        return { start: startOfMonth(selectedDate), end: endOfMonth(selectedDate) };
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    switch (viewMode) {
      case 'daily':
        setSelectedDate(direction === 'next' ? addDays(selectedDate, 1) : subDays(selectedDate, 1));
        break;
      case 'weekly':
        setSelectedDate(direction === 'next' ? addWeeks(selectedDate, 1) : subWeeks(selectedDate, 1));
        break;
      case 'monthly':
        setSelectedDate(direction === 'next' ? addMonths(selectedDate, 1) : subMonths(selectedDate, 1));
        break;
    }
  };

  const { start: rangeStart, end: rangeEnd } = getDateRange();
  
  const tasksInRange = tasksWithDueDates.filter(task => 
    task.due_date && isWithinInterval(task.due_date, { start: rangeStart, end: rangeEnd })
  );

  const upcomingTasks = tasksWithDueDates.filter(task => 
    task.due_date && task.due_date > rangeEnd
  ).slice(0, 5);

  const getTasksForDate = (date: Date) => {
    return tasksWithDueDates.filter(task => 
      task.due_date && isSameDay(task.due_date, date)
    );
  };

  const handleAddTask = (taskData: Omit<Task, 'id' | 'completed' | 'created_at' | 'order_index'>) => {
    if (isDemo) return; // Prevent task creation in demo mode
    addTask({
      ...taskData,
      due_date: selectedDate
    });
    setShowTaskForm(false);
  };

  const handleEditTask = (task: Task) => {
    if (isDemo) return; // Prevent task editing in demo mode
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleUpdateTask = (taskData: Omit<Task, 'id' | 'completed' | 'created_at' | 'order_index'>) => {
    if (isDemo || !editingTask) return; // Prevent task updates in demo mode
    updateTask(editingTask.id, taskData);
    setEditingTask(null);
    setShowTaskForm(false);
  };

  const handleDeleteTask = (id: string) => {
    if (isDemo) return; // Prevent task deletion in demo mode
    deleteTask(id);
  };

  const handleToggleTask = (id: string) => {
    if (isDemo) return; // Prevent task toggling in demo mode
    toggleTask(id);
  };

  const handleDuplicateTask = (task: Task) => {
    if (isDemo) return; // Prevent task duplication in demo mode
    const duplicatedTask = {
      ...task,
      title: `${task.title} (Copy)`,
      id: 'duplicate-temp'
    };
    setEditingTask(duplicatedTask);
    setShowTaskForm(true);
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    if (isDemo) return; // Prevent subtask toggling in demo mode
    toggleSubtask(taskId, subtaskId);
  };

  if (isLoading && !isDemo) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading calendar...</p>
      </div>
    );
  }

  const renderCalendarView = () => {
    if (viewMode === 'daily') {
      const todayTasks = getTasksForDate(selectedDate);
      return (
        <div className="space-y-4">
          <div className="text-center p-8 border rounded-lg bg-gray-50">
            <h3 className="text-xl font-semibold mb-4">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</h3>
            <div className="space-y-3">
              {todayTasks.length === 0 ? (
                <p className="text-gray-500">No tasks for this day</p>
              ) : (
                todayTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={handleToggleTask}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                    onDuplicate={handleDuplicateTask}
                    onToggleSubtask={handleToggleSubtask}
                    hideActions={isDemo}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      );
    }

    if (viewMode === 'weekly') {
      const weekDays = eachDayOfInterval({ start: rangeStart, end: rangeEnd });
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-semibold p-2 bg-gray-100 rounded">
                {day}
              </div>
            ))}
            {weekDays.map((day) => {
              const dayTasks = getTasksForDate(day);
              return (
                <div 
                  key={day.toString()} 
                  className={`border rounded-lg p-3 min-h-32 ${
                    isSameDay(day, selectedDate) ? 'bg-blue-50 border-blue-300' : 'bg-white'
                  }`}
                  onClick={() => setSelectedDate(day)}
                >
                  <div className="font-semibold text-sm mb-2">{format(day, 'd')}</div>
                  <div className="space-y-1">
                    {dayTasks.slice(0, 3).map((task) => (
                      <div 
                        key={task.id} 
                        className="text-xs p-1 bg-blue-100 rounded truncate cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditTask(task);
                        }}
                      >
                        {task.title}
                      </div>
                    ))}
                    {dayTasks.length > 3 && (
                      <div className="text-xs text-gray-500">+{dayTasks.length - 3} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (viewMode === 'monthly') {
      return (
        <div className="border rounded-lg p-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="w-full"
            modifiers={{
              hasTask: (date) => getTasksForDate(date).length > 0
            }}
            modifiersStyles={{
              hasTask: { backgroundColor: '#dbeafe', color: '#1e40af' }
            }}
          />
          <div className="mt-4 space-y-2">
            <h4 className="font-semibold">Tasks for {format(selectedDate, 'MMMM d, yyyy')}</h4>
            {getTasksForDate(selectedDate).length === 0 ? (
              <p className="text-gray-500 text-sm">No tasks for this day</p>
            ) : (
              getTasksForDate(selectedDate).map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={handleToggleTask}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onDuplicate={handleDuplicateTask}
                  onToggleSubtask={handleToggleSubtask}
                  hideActions={isDemo}
                />
              ))
            )}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="flex h-full">
      {/* Left Calendar Section */}
      <div className="flex-1 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'daily' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('daily')}
            >
              Daily
            </Button>
            <Button
              variant={viewMode === 'weekly' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('weekly')}
            >
              Weekly
            </Button>
            <Button
              variant={viewMode === 'monthly' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('monthly')}
            >
              Monthly
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" size="sm" onClick={() => navigateDate('prev')}>
            <ChevronLeft size={16} />
          </Button>
          <h3 className="text-lg font-semibold">
            {viewMode === 'daily' && format(selectedDate, 'MMMM d, yyyy')}
            {viewMode === 'weekly' && `${format(rangeStart, 'MMM d')} - ${format(rangeEnd, 'MMM d, yyyy')}`}
            {viewMode === 'monthly' && format(selectedDate, 'MMMM yyyy')}
          </h3>
          <Button variant="outline" size="sm" onClick={() => navigateDate('next')}>
            <ChevronRight size={16} />
          </Button>
        </div>
        
        {renderCalendarView()}
      </div>

      {/* Right Sidebar */}
      <div className="w-80 border-l border-gray-200 p-6 space-y-6">
        {/* Recurring Tasks */}
        <div>
          <h4 className="text-lg font-semibold mb-3">Recurring Tasks</h4>
          <div className="space-y-2">
            {recurringTasks.length === 0 ? (
              <p className="text-gray-500 text-sm">No recurring tasks</p>
            ) : (
              recurringTasks.map((task) => (
                <div key={task.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{task.title}</span>
                    <Badge variant="secondary" className="text-xs">
                      {task.recurrence_interval}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div>
          <h4 className="text-lg font-semibold mb-3">Upcoming Tasks</h4>
          <div className="space-y-2">
            {upcomingTasks.length === 0 ? (
              <p className="text-gray-500 text-sm">No upcoming tasks</p>
            ) : (
              upcomingTasks.map((task) => (
                <div key={task.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{task.title}</span>
                    <span className="text-xs text-gray-500">
                      {task.due_date && format(task.due_date, 'MMM d')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showTaskForm && !isDemo && (
        <TaskForm
          task={editingTask}
          onSubmit={editingTask ? handleUpdateTask : handleAddTask}
          onCancel={() => {
            setShowTaskForm(false);
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
};

export default CalendarView;
