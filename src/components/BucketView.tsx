import { useState } from 'react';
import { useBuckets } from '@/hooks/useBuckets';
import { Task } from '@/types/Task';
import TaskForm from './TaskForm';
import AddBucketDialog from './AddBucketDialog';
import BucketCard from './BucketCard';

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
  const { buckets, addBucket, updateBucket, deleteBucket, reorderBuckets } = useBuckets();
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [draggedOverBucket, setDraggedOverBucket] = useState<string | null>(null);
  const [duplicatingTask, setDuplicatingTask] = useState<Task | null>(null);
  const [draggedBucket, setDraggedBucket] = useState<any>(null);
  const [draggedOverBucketIndex, setDraggedOverBucketIndex] = useState<number | null>(null);

  // Filter tasks for each bucket - General bucket shows tasks with no bucket_id
  const getFilteredTasksForBucket = (bucket: any) => {
    if (bucket.is_default) {
      return tasks.filter(task => !task.bucket_id);
    }
    return tasks.filter(task => task.bucket_id === bucket.id);
  };

  const handleAddBucket = (name: string, color: string) => {
    addBucket({
      name,
      color,
      order_index: buckets.length,
      is_default: false,
    });
  };

  const handleUpdateBucket = (bucketId: string, name: string, color: string) => {
    updateBucket(bucketId, { name, color });
  };

  const handleDeleteBucket = (bucketId: string) => {
    deleteBucket(bucketId);
  };

  // Bucket drag and drop handlers (only for non-default buckets)
  const handleBucketDragStart = (e: React.DragEvent, bucket: any) => {
    if (bucket.is_default) return;
    setDraggedBucket(bucket);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleBucketDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (!draggedBucket || draggedBucket.is_default) return;
    e.dataTransfer.dropEffect = 'move';
    setDraggedOverBucketIndex(index);
  };

  const handleBucketDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDraggedOverBucketIndex(null);
    }
  };

  const handleBucketDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (!draggedBucket || draggedBucket.is_default) return;

    const currentIndex = buckets.findIndex(b => b.id === draggedBucket.id);
    if (currentIndex === dropIndex) return;

    const reorderedBuckets = [...buckets];
    const [removed] = reorderedBuckets.splice(currentIndex, 1);
    reorderedBuckets.splice(dropIndex, 0, removed);

    const updatedBuckets = reorderedBuckets.map((bucket, index) => ({
      ...bucket,
      order_index: index
    }));

    reorderBuckets(updatedBuckets);
    setDraggedBucket(null);
    setDraggedOverBucketIndex(null);
  };

  // Task drag and drop handlers
  const handleTaskDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleTaskDragOver = (e: React.DragEvent, bucketId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDraggedOverBucket(bucketId);
  };

  const handleTaskDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDraggedOverBucket(null);
    }
  };

  const handleTaskDrop = (e: React.DragEvent, bucketId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedTask) return;

    const bucket = buckets.find(b => b.id === bucketId);
    
    // If dropping on the General bucket (is_default), set bucket_id to null
    // Otherwise, set bucket_id to the target bucket's id
    const newBucketId = bucket?.is_default ? null : bucketId;

    const updatedTask = { ...draggedTask, bucket_id: newBucketId };
    onReorderTasks(tasks.map(task => task.id === updatedTask.id ? updatedTask : task));

    setDraggedTask(null);
    setDraggedOverBucket(null);
  };

  const handleDuplicateTask = (task: Task) => {
    const duplicatedTaskData = {
      title: `${task.title} (Copy)`,
      description: task.description,
      priority: task.priority,
      effort: task.effort,
      labels: [...task.labels],
      due_date: task.due_date,
      bucket_id: task.bucket_id,
      subtasks: task.subtasks.map(subtask => ({
        id: crypto.randomUUID(),
        title: subtask.title,
        completed: false
      })),
      is_recurring: task.is_recurring,
      recurrence_interval: task.recurrence_interval,
      user_id: task.user_id,
      updated_at: task.updated_at,
    };
    
    setDuplicatingTask({
      ...duplicatedTaskData,
      id: 'duplicate-temp',
      completed: false,
      created_at: new Date(),
      order_index: 0
    });
  };

  const handleSubmitDuplicate = (taskData: Omit<Task, 'id' | 'completed' | 'created_at' | 'order_index'>) => {
    onDuplicateTask({
      ...taskData,
      id: crypto.randomUUID(),
      completed: false,
      created_at: new Date(),
      order_index: 0
    });
    setDuplicatingTask(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Task Buckets</h2>
        <AddBucketDialog onAddBucket={handleAddBucket} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {buckets.map((bucket, index) => {
          const bucketTasks = getFilteredTasksForBucket(bucket);
          
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

      {duplicatingTask && (
        <TaskForm
          task={duplicatingTask}
          onSubmit={handleSubmitDuplicate}
          onCancel={() => setDuplicatingTask(null)}
        />
      )}
    </div>
  );
};

export default BucketView;
