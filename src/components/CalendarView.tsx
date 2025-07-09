import { useState, useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Lock } from 'lucide-react';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
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
  
  const tasksForSelectedDate = tasksWithDueDates.filter(task => 
    task.due_date && isSameDay(task.due_date, selectedDate)
  );

  const getTasksForDate = (date: Date) => {
    return tasksWithDueDates.filter(task => 
      task.due_date && isSameDay(task.due_date, date)
    );
  };

  const currentMonth = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const monthDays = eachDayOfInterval({ start: currentMonth, end: monthEnd });

  const dayProps = monthDays.reduce((acc, day) => {
    const dayTasks = getTasksForDate(day);
    if (dayTasks.length > 0) {
      acc[format(day, 'yyyy-MM-dd')] = {
        hasTask: true,
        taskCount: dayTasks.length
      };
    }
    return acc;
  }, {} as Record<string, { hasTask: boolean; taskCount: number }>);

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

  return (
    <div className="p-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Calendar Section */}
        <div className="lg:w-1/2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Calendar</h2>
            <Button 
              onClick={() => !isDemo && setShowTaskForm(true)}
              size="sm"
              disabled={isDemo}
            >
              {isDemo ? <Lock size={16} className="mr-2" /> : <Plus size={16} className="mr-2" />}
              Add Task
            </Button>
          </div>
          
          <div className="border rounded-lg p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="w-full"
              modifiers={{
                hasTask: (date) => {
                  const dateKey = format(date, 'yyyy-MM-dd');
                  return dayProps[dateKey]?.hasTask || false;
                }
              }}
              modifiersStyles={{
                hasTask: {
                  backgroundColor: 'hsl(var(--primary))',
                  color: 'hsl(var(--primary-foreground))',
                  borderRadius: '50%'
                }
              }}
            />
          </div>
        </div>

        {/* Tasks for Selected Date */}
        <div className="lg:w-1/2">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">
              Tasks for {format(selectedDate, 'MMMM d, yyyy')}
            </h3>
            {tasksForSelectedDate.length > 0 ? (
              <Badge variant="secondary" className="mb-4">
                {tasksForSelectedDate.length} task{tasksForSelectedDate.length !== 1 ? 's' : ''}
              </Badge>
            ) : null}
          </div>

          <div className="space-y-3">
            {tasksForSelectedDate.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No tasks scheduled for this date</p>
                <p className="text-sm mt-2">
                  {isDemo ? 'Sign up to add tasks' : 'Click "Add Task" to create one'}
                </p>
              </div>
            ) : (
              tasksForSelectedDate.map((task) => (
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
