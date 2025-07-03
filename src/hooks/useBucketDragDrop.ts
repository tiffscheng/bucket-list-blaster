import { useState } from 'react';
import { Task } from '@/types/Task';

export const useBucketDragDrop = (
  buckets: any[],
  tasks: Task[],
  onReorderTasks: (tasks: Task[]) => void,
  reorderBuckets: (buckets: any[]) => void
) => {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [draggedOverBucket, setDraggedOverBucket] = useState<string | null>(null);
  const [draggedBucket, setDraggedBucket] = useState<any>(null);
  const [draggedOverBucketIndex, setDraggedOverBucketIndex] = useState<number | null>(null);

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

  return {
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
  };
};
