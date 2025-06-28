
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, Copy } from 'lucide-react';
import { Task } from '@/types/Task';

interface TaskActionsProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onDuplicate: (task: Task) => void;
  useDropdown?: boolean;
}

const TaskActions = ({ task, onEdit, onDelete, onDuplicate, useDropdown = false }: TaskActionsProps) => {
  if (useDropdown) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <MoreHorizontal size={14} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={() => onEdit(task)}>
            <Edit size={14} className="mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDuplicate(task)}>
            <Copy size={14} className="mr-2" />
            Copy
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => onDelete(task.id)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 size={14} className="mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

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
        className="h-8 w-8 p-0"
      >
        <Copy size={14} />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(task.id)}
        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
      >
        <Trash2 size={14} />
      </Button>
    </div>
  );
};

export default TaskActions;
