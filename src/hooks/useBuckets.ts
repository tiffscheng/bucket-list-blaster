
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Bucket {
  id: string;
  name: string;
  color: string;
  order_index: number;
  is_default: boolean;
  user_id?: string;
}

const LOCAL_STORAGE_KEY = 'taskflow-buckets';

export const useBuckets = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [localBuckets, setLocalBuckets] = useState<Bucket[]>([]);

  // Load local buckets from localStorage on mount
  useEffect(() => {
    if (!user) {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        try {
          const parsedBuckets = JSON.parse(stored);
          setLocalBuckets(parsedBuckets);
        } catch (error) {
          console.error('Error parsing local buckets:', error);
          // Create default bucket if parsing fails
          const defaultBucket: Bucket = {
            id: 'default-general',
            name: 'General',
            color: '#3b82f6',
            order_index: 0,
            is_default: true,
          };
          setLocalBuckets([defaultBucket]);
        }
      } else {
        // Create default bucket if no stored buckets
        const defaultBucket: Bucket = {
          id: 'default-general',
          name: 'General',
          color: '#3b82f6',
          order_index: 0,
          is_default: true,
        };
        setLocalBuckets([defaultBucket]);
      }
    }
  }, [user]);

  // Save local buckets to localStorage
  const saveLocalBuckets = (buckets: Bucket[]) => {
    setLocalBuckets(buckets);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(buckets));
  };

  // Fetch buckets from Supabase (only for authenticated users)
  const { data: supabaseBuckets = [], isLoading } = useQuery({
    queryKey: ['buckets', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('buckets')
        .select('*')
        .eq('user_id', user.id)
        .order('order_index', { ascending: true });

      if (error) throw error;

      // If no buckets exist, create a default one
      if (data.length === 0) {
        const { data: newBucket, error: createError } = await supabase
          .from('buckets')
          .insert([{
            user_id: user.id,
            name: 'General',
            color: '#3b82f6',
            order_index: 0,
            is_default: true,
          }])
          .select()
          .single();

        if (createError) throw createError;
        return [newBucket];
      }

      return data;
    },
    enabled: !!user,
  });

  // Use either Supabase buckets or local buckets
  const buckets = user ? supabaseBuckets : localBuckets;

  // Local bucket operations
  const addLocalBucket = (bucketData: Omit<Bucket, 'id'>) => {
    const newBucket: Bucket = {
      ...bucketData,
      id: crypto.randomUUID(),
    };
    saveLocalBuckets([...localBuckets, newBucket]);
    toast({
      title: "Bucket added locally",
      description: "Sign in to save your buckets permanently",
    });
  };

  const updateLocalBucket = (id: string, updates: Partial<Bucket>) => {
    const updatedBuckets = localBuckets.map(bucket => 
      bucket.id === id ? { ...bucket, ...updates } : bucket
    );
    saveLocalBuckets(updatedBuckets);
  };

  const deleteLocalBucket = (id: string) => {
    const updatedBuckets = localBuckets.filter(bucket => bucket.id !== id);
    saveLocalBuckets(updatedBuckets);
    toast({
      title: "Bucket deleted",
      description: "Bucket removed from local storage",
    });
  };

  // Supabase mutations (only for authenticated users)
  const addBucketMutation = useMutation({
    mutationFn: async (bucketData: Omit<Bucket, 'id'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('buckets')
        .insert([{
          user_id: user.id,
          name: bucketData.name,
          color: bucketData.color,
          order_index: bucketData.order_index,
          is_default: bucketData.is_default,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buckets', user?.id] });
      toast({
        title: "Success",
        description: "Bucket created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update bucket mutation
  const updateBucketMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Bucket> }) => {
      const { error } = await supabase
        .from('buckets')
        .update({
          name: updates.name,
          color: updates.color,
          order_index: updates.order_index,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buckets', user?.id] });
      toast({
        title: "Success",
        description: "Bucket updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete bucket mutation
  const deleteBucketMutation = useMutation({
    mutationFn: async (id: string) => {
      // First, move all tasks from this bucket to the default bucket
      const { data: defaultBucket } = await supabase
        .from('buckets')
        .select('id')
        .eq('user_id', user?.id)
        .eq('is_default', true)
        .single();

      if (defaultBucket) {
        await supabase
          .from('tasks')
          .update({ bucket_id: defaultBucket.id })
          .eq('bucket_id', id);
      }

      // Then delete the bucket
      const { error } = await supabase
        .from('buckets')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buckets', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
      toast({
        title: "Success",
        description: "Bucket deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Main functions that handle both authenticated and non-authenticated users
  const addBucket = (bucketData: Omit<Bucket, 'id'>) => {
    if (user) {
      addBucketMutation.mutate(bucketData);
    } else {
      addLocalBucket(bucketData);
    }
  };

  const updateBucket = (id: string, updates: Partial<Bucket>) => {
    if (user) {
      updateBucketMutation.mutate({ id, updates });
    } else {
      updateLocalBucket(id, updates);
    }
  };

  const deleteBucket = (id: string) => {
    if (user) {
      deleteBucketMutation.mutate(id);
    } else {
      deleteLocalBucket(id);
    }
  };

  return {
    buckets,
    isLoading: user ? isLoading : false,
    addBucket,
    updateBucket,
    deleteBucket,
  };
};
