
import { Task } from '@/types/Task';
import TaskItem from './TaskItem';
import BucketHeader from './BucketHeader';

interface BucketCardProps {
  bucket: any;
  tasks: Task[];
  draggedTask: Task | null;
  draggedOverBucket: string | null;
  draggedBucket: any;
  draggedOverBucketIndex: number | null;
  index: number;
  onUpdateBucket: (bucketId: string, name: string, color: string) => void;
  onDeleteBucket: (bucketId: string) => void;
  onTaskDragStart: (e: React.DragEvent, task: Task) => void;
  onTaskDragOver: (e: React.DragEvent, bucketId: string) => void;
  onTaskDragLeave: (e: React.DragEvent) => void;
  onTaskDrop: (e: React.DragEvent, bucketId: string) => void;
  onBucketDragStart: (e: React.DragEvent, bucket: any) => void;
  onBucketDragOver: (e: React.DragEvent, index: number) => void;
  onBucketDragLeave: (e: React.DragEvent) => void;
  onBucketDrop: (e: React.DragEvent, dropIndex: number) => void;
  onToggleTask: (id: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onDuplicateTask: (task: Task) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
}

const BucketCard = ({
  bucket,
  tasks,
  draggedTask,
  draggedOverBucket,
  draggedBucket,
  draggedOverBucketIndex,
  index,
  onUpdateBucket,
  onDeleteBucket,
  onTaskDragStart,
  onTaskDragOver,
  onTaskDragLeave,
  onTaskDrop,
  onBucketDragStart,
  onBucketDragOver,
  onBucketDragLeave,
  onBucketDrop,
  onToggleTask,
  onEditTask,
  onDeleteTask,
  onDuplicateTask,
  onToggleSubtask
}: BucketCardProps) => {
  const isDraggedOver = draggedOverBucketIndex === index && draggedBucket && !draggedBucket.is_default;
  const isTaskDraggedOver = draggedOverBucket === bucket.id && draggedTask;

  return (
    <div
      draggable={!bucket.is_default}
      onDragStart={(e) => onBucketDragStart(e, bucket)}
      onDragOver={(e) => {
        if (draggedTask) {
          onTaskDragOver(e, bucket.id);
        } else if (draggedBucket && !draggedBucket.is_default) {
          onBucketDragOver(e, index);
        }
      }}
      onDragLeave={(e) => {
        if (draggedTask) {
          onTaskDragLeave(e);
        } else if (draggedBucket && !draggedBucket.is_default) {
          onBucketDragLeave(e);
        }
      }}
      onDrop={(e) => {
        if (draggedTask) {
          onTaskDrop(e, bucket.id);
        } else if (draggedBucket && !draggedBucket.is_default) {
          onBucketDrop(e, index);
        }
      }}
      className={`
        rounded-lg border-2 p-4 min-h-[200px] transition-all duration-200
        ${isDraggedOver || isTaskDraggedOver
          ? 'border-blue-400 shadow-lg scale-105 border-solid' 
          : 'border-dashed border-gray-300 hover:border-gray-400'
        }
        ${!bucket.is_default ? 'cursor-grab' : ''}
      `}
      style={{ 
        backgroundColor: bucket.color + '15',
        borderColor: (isDraggedOver || isTaskDraggedOver) ? '#60a5fa' : bucket.color
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <BucketHeader
          bucket={bucket}
          taskCount={tasks.length}
          onUpdateBucket={onUpdateBucket}
          onDeleteBucket={onDeleteBucket}
        />
      </div>
      
      <div className="space-y-2">
        {tasks.map((task) => (
          <div 
            key={task.id}
            draggable
            onDragStart={(e) => onTaskDragStart(e, task)}
            className="cursor-grab"
          >
            <TaskItem
              task={task}
              onToggle={onToggleTask}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onDuplicate={onDuplicateTask}
              onToggleSubtask={onToggleSubtask}
              useDropdownActions={true}
            />
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">No tasks in this bucket</p>
            <p className="text-xs mt-1">Drag tasks here to organize them</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BucketCard;
