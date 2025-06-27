
import { useState } from 'react';
import { Task } from '@/types/Task';
import TaskItem from './TaskItem';

interface TaskListViewProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onDuplicateTask: (task: Task) => void;
  onReorderTasks: (tasks: Task[]) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
}

const TaskListView = ({ 
  tasks, 
  onToggleTask, 
  onEditTask, 
  onDeleteTask, 
  onDuplicateTask, 
  onReorderTasks, 
  onToggleSubtask 
}: TaskListViewProps) => {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [draggedOverIndex, setDraggedOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', '');
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDraggedOverIndex(index);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDraggedOverIndex(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (!draggedTask) return;

    const otherTasks = tasks.filter(task => task.id !== draggedTask.id);
    const reorderedTasks = [
      ...otherTasks.slice(0, targetIndex),
      draggedTask,
      ...otherTasks.slice(targetIndex)
    ].map((task, index) => ({ ...task, order_index: index }));

    onReorderTasks(reorderedTasks);
    setDraggedTask(null);
    setDraggedOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDraggedOverIndex(null);
  };

  return (
    <div className="space-y-2">
      {tasks.map((task, index) => (
        <div
          key={task.id}
          draggable
          onDragStart={(e) => handleDragStart(e, task)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
          className={`
            transition-all duration-200 ease-in-out cursor-move
            ${draggedTask?.id === task.id 
              ? 'opacity-50 scale-95 rotate-1 shadow-lg' 
              : 'opacity-100 scale-100 rotate-0'
            }
            ${draggedOverIndex === index && draggedTask?.id !== task.id
              ? 'transform translate-y-1 shadow-md border-2 border-blue-300 border-dashed'
              : ''
            }
            hover:shadow-sm
          `}
        >
          <TaskItem
            task={task}
            onToggle={onToggleTask}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
            onDuplicate={onDuplicateTask}
            onToggleSubtask={onToggleSubtask}
          />
        </div>
      ))}
    </div>
  );
};

export default TaskListView;
