
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskDueDateProps {
  due_date?: Date;
}

const TaskDueDate = ({ due_date }: TaskDueDateProps) => {
  if (!due_date) return null;

  const getDueDateStatus = () => {
    if (isPast(due_date) && !isToday(due_date)) {
      return { text: 'Overdue', class: 'text-red-600 bg-red-50' };
    } else if (isToday(due_date)) {
      return { text: 'Due Today', class: 'text-orange-600 bg-orange-50' };
    } else if (isTomorrow(due_date)) {
      return { text: 'Due Tomorrow', class: 'text-blue-600 bg-blue-50' };
    }
    return { text: format(due_date, 'MMM d'), class: 'text-gray-600 bg-gray-50' };
  };

  const dueDateStatus = getDueDateStatus();

  return (
    <span className={cn(
      "px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1",
      dueDateStatus.class
    )}>
      <Calendar size={12} />
      {dueDateStatus.text}
    </span>
  );
};

export default TaskDueDate;
