
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Bucket {
  id: string;
  name: string;
  color: string;
  order_index: number;
  is_default: boolean;
  user_id: string;
  created_at: Date;
  updated_at: Date;
}

export const useBuckets = () => {
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchBuckets();
    } else {
      // Set default General bucket for guest users
      setBuckets([{
        id: 'general',
        name: 'General',
        color: '#6b7280',
        order_index: 0,
        is_default: true,
        user_id: '',
        created_at: new Date(),
        updated_at: new Date()
      }]);
    }
  }, [user]);

  const fetchBuckets = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('buckets')
        .select('*')
        .eq('user_id', user.id)
        .order('order_index');

      if (error) throw error;

      const bucketsWithDates = data.map(bucket => ({
        ...bucket,
        created_at: new Date(bucket.created_at),
        updated_at: new Date(bucket.updated_at)
      }));

      setBuckets(bucketsWithDates);
    } catch (error) {
      console.error('Error fetching buckets:', error);
      toast.error('Failed to load buckets');
    }
  };

  const addBucket = async (bucketData: Omit<Bucket, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('buckets')
        .insert([{
          ...bucketData,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      const newBucket = {
        ...data,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at)
      };

      setBuckets(prev => [...prev, newBucket]);
      toast.success('Bucket created successfully');
    } catch (error) {
      console.error('Error adding bucket:', error);
      toast.error('Failed to create bucket');
    }
  };

  const updateBucket = async (bucketId: string, updates: Partial<Bucket>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('buckets')
        .update(updates)
        .eq('id', bucketId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      const updatedBucket = {
        ...data,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at)
      };

      setBuckets(prev => prev.map(bucket => 
        bucket.id === bucketId ? updatedBucket : bucket
      ));
      toast.success('Bucket updated successfully');
    } catch (error) {
      console.error('Error updating bucket:', error);
      toast.error('Failed to update bucket');
    }
  };

  const deleteBucket = async (bucketId: string) => {
    if (!user) return;

    try {
      // First, move all tasks from this bucket to the general bucket
      const { error: tasksError } = await supabase
        .from('tasks')
        .update({ bucket_id: null })
        .eq('bucket_id', bucketId)
        .eq('user_id', user.id);

      if (tasksError) throw tasksError;

      // Then delete the bucket
      const { error } = await supabase
        .from('buckets')
        .delete()
        .eq('id', bucketId)
        .eq('user_id', user.id);

      if (error) throw error;

      setBuckets(prev => prev.filter(bucket => bucket.id !== bucketId));
      toast.success('Bucket deleted successfully');
    } catch (error) {
      console.error('Error deleting bucket:', error);
      toast.error('Failed to delete bucket');
    }
  };

  const reorderBuckets = async (reorderedBuckets: Bucket[]) => {
    if (!user) return;

    try {
      // Update the local state immediately for better UX
      setBuckets(reorderedBuckets);

      // Update the order_index for all buckets in the database
      const updates = reorderedBuckets.map(bucket => ({
        id: bucket.id,
        order_index: bucket.order_index
      }));

      for (const update of updates) {
        if (update.id !== 'general') { // Skip the default general bucket
          await supabase
            .from('buckets')
            .update({ order_index: update.order_index })
            .eq('id', update.id)
            .eq('user_id', user.id);
        }
      }

      toast.success('Buckets reordered successfully');
    } catch (error) {
      console.error('Error reordering buckets:', error);
      toast.error('Failed to reorder buckets');
      // Revert the local state if the update failed
      fetchBuckets();
    }
  };

  return {
    buckets,
    addBucket,
    updateBucket,
    deleteBucket,
    reorderBuckets
  };
};
