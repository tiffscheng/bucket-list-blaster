
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Subtask } from '@/types/Task';
import { cn } from '@/lib/utils';
import { sanitizeHtml } from '@/utils/security';

interface TaskSubtasksProps {
  subtasks: Subtask[];
  taskId: string;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
}

const TaskSubtasks = ({ subtasks, taskId, onToggleSubtask }: TaskSubtasksProps) => {
  const [showSubtasks, setShowSubtasks] = useState(false);
  
  const completedSubtasks = subtasks.filter(s => s.completed).length;
  const totalSubtasks = subtasks.length;

  if (totalSubtasks === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSubtasks(!showSubtasks)}
          className="h-auto p-0 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full hover:bg-gray-200 hover:text-gray-700"
        >
          <span className="mr-1">
            {completedSubtasks}/{totalSubtasks} subtasks
          </span>
          {showSubtasks ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </Button>
      </div>

      {showSubtasks && (
        <div className="mt-2 space-y-1 pl-4 border-l-2 border-gray-200">
          {subtasks.map((subtask) => (
            <div key={subtask.id} className="flex items-center gap-2">
              <Checkbox
                checked={subtask.completed}
                onCheckedChange={() => onToggleSubtask?.(taskId, subtask.id)}
                className="h-3 w-3"
              />
              <span className={cn(
                "text-sm",
                subtask.completed ? "line-through text-gray-400" : "text-gray-700"
              )}>
                {sanitizeHtml(subtask.title)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskSubtasks;
