
import { Checkbox } from '@/components/ui/checkbox';
import { RotateCcw } from 'lucide-react';
import { Task } from '@/types/Task';
import { cn } from '@/lib/utils';
import { sanitizeHtml } from '@/utils/security';
import TaskPriorityBadge from './TaskPriorityBadge';
import TaskEffortIndicator from './TaskEffortIndicator';
import TaskDueDate from './TaskDueDate';
import TaskSubtasks from './TaskSubtasks';
import TaskActions from './TaskActions';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onDuplicate: (task: Task) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
  hideActions?: boolean;
}

const TaskItem = ({ task, onToggle, onEdit, onDelete, onDuplicate, onToggleSubtask, hideActions = false }: TaskItemProps) => {
  const safeTitle = sanitizeHtml(task.title);
  const safeDescription = task.description ? sanitizeHtml(task.description) : '';

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
              {safeTitle}
            </h3>
            
            <TaskPriorityBadge priority={task.priority} />
            <TaskEffortIndicator effort={task.effort} />

            {task.is_recurring && (
              <span className="text-xs text-purple-700 bg-purple-100 px-2 py-1 rounded-full flex items-center gap-1">
                <RotateCcw size={12} />
                {task.recurrence_interval}
              </span>
            )}
          </div>

          {safeDescription && (
            <p className={cn(
              "text-sm mb-2",
              task.completed ? "text-gray-400" : "text-gray-600"
            )}>
              {safeDescription}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 mb-2">
            {task.labels.map((label) => (
              <span
                key={label}
                className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
              >
                {sanitizeHtml(label)}
              </span>
            ))}
            
            <TaskDueDate due_date={task.due_date} />
          </div>

          <TaskSubtasks 
            subtasks={task.subtasks}
            taskId={task.id}
            onToggleSubtask={onToggleSubtask}
          />
        </div>

        {!hideActions && (
          <TaskActions
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
          />
        )}
      </div>
    </div>
  );
};

export default TaskItem;
