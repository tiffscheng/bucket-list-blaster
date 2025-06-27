
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Copy } from 'lucide-react';
import { Task } from '@/types/Task';

interface TaskActionsProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onDuplicate: (task: Task) => void;
}

const TaskActions = ({ task, onEdit, onDelete, onDuplicate }: TaskActionsProps) => {
  return (
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
        onClick={() => onDuplicate(task)}
        className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
      >
        <Copy size={14} />
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
  );
};

export default TaskActions;
