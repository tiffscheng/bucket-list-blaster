
import { format, isSameDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, addWeeks, addMonths, subDays, subWeeks, subMonths, isWithinInterval, eachDayOfInterval } from 'date-fns';
import { Task } from '@/types/Task';

export type ViewMode = 'daily' | 'weekly' | 'monthly';

export const getDateRange = (selectedDate: Date, viewMode: ViewMode) => {
  switch (viewMode) {
    case 'daily':
      return { start: selectedDate, end: selectedDate };
    case 'weekly':
      return { start: startOfWeek(selectedDate), end: endOfWeek(selectedDate) };
    case 'monthly':
      return { start: startOfMonth(selectedDate), end: endOfMonth(selectedDate) };
  }
};

export const navigateDate = (selectedDate: Date, viewMode: ViewMode, direction: 'prev' | 'next'): Date => {
  switch (viewMode) {
    case 'daily':
      return direction === 'next' ? addDays(selectedDate, 1) : subDays(selectedDate, 1);
    case 'weekly':
      return direction === 'next' ? addWeeks(selectedDate, 1) : subWeeks(selectedDate, 1);
    case 'monthly':
      return direction === 'next' ? addMonths(selectedDate, 1) : subMonths(selectedDate, 1);
  }
};

export const getTasksForDate = (tasks: Task[], date: Date): Task[] => {
  return tasks.filter(task => 
    task.due_date && isSameDay(task.due_date, date)
  );
};

export const getTasksInRange = (tasks: Task[], start: Date, end: Date): Task[] => {
  return tasks.filter(task => 
    task.due_date && isWithinInterval(task.due_date, { start, end })
  );
};

export const getUpcomingTasks = (tasks: Task[], rangeEnd: Date, limit: number = 5): Task[] => {
  return tasks.filter(task => 
    task.due_date && task.due_date > rangeEnd
  ).slice(0, limit);
};

export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-700';
    case 'medium':
      return 'bg-yellow-100 text-yellow-700';
    case 'low':
      return 'bg-green-100 text-green-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

export const formatViewTitle = (selectedDate: Date, viewMode: ViewMode, rangeStart?: Date, rangeEnd?: Date): string => {
  switch (viewMode) {
    case 'daily':
      return format(selectedDate, 'MMMM d, yyyy');
    case 'weekly':
      return `${format(rangeStart!, 'MMM d')} - ${format(rangeEnd!, 'MMM d, yyyy')}`;
    case 'monthly':
      return format(selectedDate, 'MMMM yyyy');
  }
};
