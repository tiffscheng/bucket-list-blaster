
import { cn } from '@/lib/utils';

interface TaskPriorityBadgeProps {
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

const TaskPriorityBadge = ({ priority }: TaskPriorityBadgeProps) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <span className={cn(
      "px-2 py-1 rounded-full text-xs font-medium border",
      getPriorityColor(priority)
    )}>
      {priority}
    </span>
  );
};

export default TaskPriorityBadge;
