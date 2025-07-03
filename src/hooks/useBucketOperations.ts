
import { useBuckets } from '@/hooks/useBuckets';

export const useBucketOperations = () => {
  const { buckets, addBucket, updateBucket, deleteBucket, reorderBuckets } = useBuckets();

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

  // Filter tasks for each bucket - General bucket shows tasks with no bucket_id
  const getFilteredTasksForBucket = (bucket: any, tasks: any[]) => {
    if (bucket.is_default) {
      return tasks.filter(task => !task.bucket_id);
    }
    return tasks.filter(task => task.bucket_id === bucket.id);
  };

  return {
    buckets,
    handleAddBucket,
    handleUpdateBucket,
    handleDeleteBucket,
    reorderBuckets,
    getFilteredTasksForBucket
  };
};
