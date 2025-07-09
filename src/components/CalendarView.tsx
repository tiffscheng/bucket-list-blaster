
import { useState, useMemo } from 'react';
import { Task } from '@/types/Task';
import { useTasks } from '@/hooks/useTasks';
import TaskForm from './TaskForm';
import CalendarNavigation from './calendar/CalendarNavigation';
import DailyView from './calendar/DailyView';
import WeeklyView from './calendar/WeeklyView';
import MonthlyView from './calendar/MonthlyView';
import CalendarSidebar from './calendar/CalendarSidebar';
import { 
  ViewMode, 
  getDateRange, 
  navigateDate as navigateDateUtil, 
  getTasksForDate, 
  getUpcomingTasks 
} from './calendar/CalendarUtils';

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
  const [viewMode, setViewMode] = useState<ViewMode>('monthly');
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
  
  const { start: rangeStart, end: rangeEnd } = getDateRange(selectedDate, viewMode);
  const upcomingTasks = getUpcomingTasks(tasksWithDueDates, rangeEnd);

  const handleNavigate = (direction: 'prev' | 'next') => {
    setSelectedDate(navigateDateUtil(selectedDate, viewMode, direction));
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    if (viewMode !== 'daily') {
      setViewMode('daily');
    }
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

  if (isLoading && !isDemo) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading calendar...</p>
      </div>
    );
  }

  const renderCalendarView = () => {
    const todayTasks = getTasksForDate(tasksWithDueDates, selectedDate);

    switch (viewMode) {
      case 'daily':
        return <DailyView selectedDate={selectedDate} tasks={todayTasks} />;
      case 'weekly':
        return (
          <WeeklyView
            selectedDate={selectedDate}
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            tasks={tasksWithDueDates}
            onDayClick={handleDayClick}
          />
        );
      case 'monthly':
        return (
          <MonthlyView
            selectedDate={selectedDate}
            tasks={tasksWithDueDates}
            onDayClick={handleDayClick}
          />
        );
    }
  };

  return (
    <div className="flex h-full">
      {/* Left Calendar Section */}
      <div className="flex-1 p-6">
        <CalendarNavigation
          selectedDate={selectedDate}
          viewMode={viewMode}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          onNavigate={handleNavigate}
          onViewModeChange={setViewMode}
        />
        
        {renderCalendarView()}
      </div>

      <CalendarSidebar
        recurringTasks={recurringTasks}
        upcomingTasks={upcomingTasks}
      />

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
