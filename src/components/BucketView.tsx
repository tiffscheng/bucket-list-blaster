
import { Task } from '@/types/Task';
import AddBucketDialog from './AddBucketDialog';
import BucketCard from './BucketCard';
import { useBucketOperations } from '@/hooks/useBucketOperations';
import { useBucketDragDrop } from '@/hooks/useBucketDragDrop';
import { useTaskDuplication } from './TaskDuplicationHandler';

interface BucketViewProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onDuplicateTask: (task: Task) => void;
  onReorderTasks: (tasks: Task[]) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
}

const BucketView = ({ 
  tasks, 
  onToggleTask, 
  onEditTask, 
  onDeleteTask, 
  onDuplicateTask,
  onReorderTasks,
  onToggleSubtask 
}: BucketViewProps) => {
  const {
    buckets,
    handleAddBucket,
    handleUpdateBucket,
    handleDeleteBucket,
    reorderBuckets,
    getFilteredTasksForBucket
  } = useBucketOperations();

  const {
    draggedTask,
    draggedOverBucket,
    draggedBucket,
    draggedOverBucketIndex,
    handleBucketDragStart,
    handleBucketDragOver,
    handleBucketDragLeave,
    handleBucketDrop,
    handleTaskDragStart,
    handleTaskDragOver,
    handleTaskDragLeave,
    handleTaskDrop
  } = useBucketDragDrop(buckets, tasks, onReorderTasks, reorderBuckets);

  const { handleDuplicateTask, TaskDuplicationForm } = useTaskDuplication({ onDuplicateTask });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Task Buckets</h2>
        <AddBucketDialog onAddBucket={handleAddBucket} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {buckets.map((bucket, index) => {
          const bucketTasks = getFilteredTasksForBucket(bucket, tasks);
          
          return (
            <BucketCard
              key={bucket.id}
              bucket={bucket}
              tasks={bucketTasks}
              index={index}
              draggedTask={draggedTask}
              draggedOverBucket={draggedOverBucket}
              draggedBucket={draggedBucket}
              draggedOverBucketIndex={draggedOverBucketIndex}
              onUpdateBucket={handleUpdateBucket}
              onDeleteBucket={handleDeleteBucket}
              onTaskDragStart={handleTaskDragStart}
              onTaskDragOver={handleTaskDragOver}
              onTaskDragLeave={handleTaskDragLeave}
              onTaskDrop={handleTaskDrop}
              onBucketDragStart={handleBucketDragStart}
              onBucketDragOver={handleBucketDragOver}
              onBucketDragLeave={handleBucketDragLeave}
              onBucketDrop={handleBucketDrop}
              onToggleTask={onToggleTask}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
              onDuplicateTask={handleDuplicateTask}
              onToggleSubtask={onToggleSubtask}
            />
          );
        })}
      </div>

      {TaskDuplicationForm}
    </div>
  );
};

export default BucketView;
