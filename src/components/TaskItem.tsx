import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit, Trash2, Calendar, ChevronDown, ChevronRight, RotateCcw } from 'lucide-react';
import { Task } from '@/types/Task';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
}

const TaskItem = ({ task, onToggle, onEdit, onDelete, onToggleSubtask }: TaskItemProps) => {
  const [showSubtasks, setShowSubtasks] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEffortIcon = (effort: string) => {
    switch (effort) {
      case 'quick': return '⚡';
      case 'medium': return '⏰';
      case 'long': return '📅';
      case 'massive': return '🏔️';
      default: return '⏰';
    }
  };

  const getDueDateStatus = () => {
    if (!task.dueDate) return null;
    
    if (isPast(task.dueDate) && !isToday(task.dueDate)) {
      return { text: 'Overdue', class: 'text-red-600 bg-red-50' };
    } else if (isToday(task.dueDate)) {
      return { text: 'Due Today', class: 'text-orange-600 bg-orange-50' };
    } else if (isTomorrow(task.dueDate)) {
      return { text: 'Due Tomorrow', class: 'text-blue-600 bg-blue-50' };
    }
    return { text: format(task.dueDate, 'MMM d'), class: 'text-gray-600 bg-gray-50' };
  };

  const dueDateStatus = getDueDateStatus();
  const completedSubtasks = task.subtasks.filter(s => s.completed).length;
  const totalSubtasks = task.subtasks.length;

  return (
    <div className={cn(
      "p-4 rounded-lg border transition-all duration-200 hover:shadow-md",
      task.completed 
        ? "bg-gray-50 border-gray-200 opacity-75" 
        : "bg-white border-gray-200 hover:border-blue-300"
    )}>
      <div className="flex items-start gap-3">
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => onToggle(task.id)}
          className="mt-1"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h3 className={cn(
              "font-medium",
              task.completed ? "line-through text-gray-500" : "text-gray-900"
            )}>
              {task.title}
            </h3>
            
            <span className={cn(
              "px-2 py-1 rounded-full text-xs font-medium border",
              getPriorityColor(task.priority)
            )}>
              {task.priority}
            </span>
            
            <span className="text-sm text-gray-500 flex items-center gap-1">
              {getEffortIcon(task.effort)} {task.effort}
            </span>

            {task.is_recurring && (
              <span className="text-xs text-purple-700 bg-purple-100 px-2 py-1 rounded-full flex items-center gap-1">
                <RotateCcw size={12} />
                {task.recurrence_interval}
              </span>
            )}

            {totalSubtasks > 0 && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {completedSubtasks}/{totalSubtasks} subtasks
              </span>
            )}
          </div>

          {task.description && (
            <p className={cn(
              "text-sm mb-2",
              task.completed ? "text-gray-400" : "text-gray-600"
            )}>
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 mb-2">
            {task.labels.map((label) => (
              <span
                key={label}
                className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
              >
                {label}
              </span>
            ))}
            
            {dueDateStatus && (
              <span className={cn(
                "px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1",
                dueDateStatus.class
              )}>
                <Calendar size={12} />
                {dueDateStatus.text}
              </span>
            )}
          </div>

          {totalSubtasks > 0 && (
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSubtasks(!showSubtasks)}
                className="p-0 h-auto text-xs text-gray-600 hover:text-gray-800"
              >
                {showSubtasks ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                {showSubtasks ? 'Hide' : 'Show'} subtasks
              </Button>

              {showSubtasks && (
                <div className="mt-2 space-y-1 pl-4 border-l-2 border-gray-200">
                  {task.subtasks.map((subtask) => (
                    <div key={subtask.id} className="flex items-center gap-2">
                      <Checkbox
                        checked={subtask.completed}
                        onCheckedChange={() => onToggleSubtask?.(task.id, subtask.id)}
                        className="h-3 w-3"
                      />
                      <span className={cn(
                        "text-sm",
                        subtask.completed ? "line-through text-gray-400" : "text-gray-700"
                      )}>
                        {subtask.title}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(task)}
            className="h-8 w-8 p-0"
          >
            <Edit size={14} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(task.id)}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;
