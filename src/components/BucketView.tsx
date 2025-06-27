
import { useState } from 'react';
import TaskItem from './TaskItem';
import { Task } from '@/types/Task';
import { cn } from '@/lib/utils';

interface BucketViewProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onReorderTasks: (tasks: Task[]) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
}

const BucketView = ({ 
  tasks, 
  onToggleTask, 
  onEditTask, 
  onDeleteTask, 
  onReorderTasks,
  onToggleSubtask 
}: BucketViewProps) => {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  // Group tasks by priority
  const taskBuckets = {
    urgent: tasks.filter(task => task.priority === 'urgent'),
    high: tasks.filter(task => task.priority === 'high'),
    medium: tasks.filter(task => task.priority === 'medium'),
    low: tasks.filter(task => task.priority === 'low'),
  };

  const bucketColors = {
    urgent: 'border-red-200 bg-red-50',
    high: 'border-orange-200 bg-orange-50',
    medium: 'border-yellow-200 bg-yellow-50',
    low: 'border-green-200 bg-green-50',
  };

  const bucketTitles = {
    urgent: 'Urgent',
    high: 'High Priority',
    medium: 'Medium Priority',
    low: 'Low Priority',
  };

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetPriority: string) => {
    e.preventDefault();
    if (!draggedTask) return;

    // Update the task's priority and reorder
    const updatedTask = { ...draggedTask, priority: targetPriority as Task['priority'] };
    const otherTasks = tasks.filter(task => task.id !== draggedTask.id);
    const updatedTasks = [...otherTasks, updatedTask];
    
    onReorderTasks(updatedTasks);
    setDraggedTask(null);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Object.entries(taskBuckets).map(([priority, bucketTasks]) => (
        <div
          key={priority}
          className={cn(
            "p-4 rounded-lg border-2 border-dashed min-h-[200px]",
            bucketColors[priority as keyof typeof bucketColors]
          )}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, priority)}
        >
          <h4 className="font-semibold text-gray-700 mb-3 text-center">
            {bucketTitles[priority as keyof typeof bucketTitles]} ({bucketTasks.length})
          </h4>
          
          <div className="space-y-2">
            {bucketTasks.map((task) => (
              <div
                key={task.id}
                draggable
                onDragStart={(e) => handleDragStart(e, task)}
                onDragEnd={handleDragEnd}
                className={cn(
                  "cursor-move transition-opacity",
                  draggedTask?.id === task.id ? "opacity-50" : "opacity-100"
                )}
              >
                <TaskItem
                  task={task}
                  onToggle={onToggleTask}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                  onToggleSubtask={onToggleSubtask}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default BucketView;
