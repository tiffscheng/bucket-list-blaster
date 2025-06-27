
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Bucket {
  id: string;
  name: string;
  color: string;
  order_index: number;
  is_default: boolean;
  created_at: Date;
  updated_at: Date;
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
          const parsedBuckets = JSON.parse(stored).map((bucket: any) => ({
            ...bucket,
            created_at: new Date(bucket.created_at),
            updated_at: new Date(bucket.updated_at),
          }));
          setLocalBuckets(parsedBuckets);
        } catch (error) {
          console.error('Error parsing local buckets:', error);
          setLocalBuckets([{ 
            id: 'default', 
            name: 'General Tasks', 
            color: '#3b82f6', 
            order_index: 0, 
            is_default: true,
            created_at: new Date(),
            updated_at: new Date()
          }]);
        }
      } else {
        // Create default bucket if none exists
        const defaultBucket = { 
          id: 'default', 
          name: 'General Tasks', 
          color: '#3b82f6', 
          order_index: 0, 
          is_default: true,
          created_at: new Date(),
          updated_at: new Date()
        };
        setLocalBuckets([defaultBucket]);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([defaultBucket]));
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

      return data.map(bucket => ({
        ...bucket,
        created_at: new Date(bucket.created_at),
        updated_at: new Date(bucket.updated_at),
      }));
    },
    enabled: !!user,
  });

  // Use either Supabase buckets or local buckets
  const buckets = user ? supabaseBuckets : localBuckets;

  // Local bucket operations
  const addLocalBucket = (bucketData: Omit<Bucket, 'id' | 'created_at' | 'updated_at'>) => {
    const newBucket: Bucket = {
      ...bucketData,
      id: crypto.randomUUID(),
      created_at: new Date(),
      updated_at: new Date(),
    };
    saveLocalBuckets([...localBuckets, newBucket]);
  };

  const updateLocalBucket = (id: string, updates: Partial<Bucket>) => {
    const updatedBuckets = localBuckets.map(bucket => 
      bucket.id === id ? { ...bucket, ...updates, updated_at: new Date() } : bucket
    );
    saveLocalBuckets(updatedBuckets);
  };

  const deleteLocalBucket = (id: string) => {
    const updatedBuckets = localBuckets.filter(bucket => bucket.id !== id);
    saveLocalBuckets(updatedBuckets);
  };

  // Supabase mutations
  const addBucketMutation = useMutation({
    mutationFn: async (bucketData: Omit<Bucket, 'id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('buckets')
        .insert([
          {
            user_id: user.id,
            name: bucketData.name,
            color: bucketData.color,
            order_index: bucketData.order_index,
            is_default: bucketData.is_default,
          },
        ])
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

  const updateBucketMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Bucket> }) => {
      const { error } = await supabase
        .from('buckets')
        .update({
          name: updates.name,
          color: updates.color,
          order_index: updates.order_index,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buckets', user?.id] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteBucketMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('buckets')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buckets', user?.id] });
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

  // Main functions
  const addBucket = (bucketData: Omit<Bucket, 'id' | 'created_at' | 'updated_at'>) => {
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

  const reorderBuckets = async (newBuckets: Bucket[]) => {
    if (user) {
      const updates = newBuckets.map((bucket, index) => ({
        id: bucket.id,
        order_index: index,
      }));

      for (const update of updates) {
        await supabase
          .from('buckets')
          .update({ order_index: update.order_index })
          .eq('id', update.id);
      }

      queryClient.invalidateQueries({ queryKey: ['buckets', user?.id] });
    } else {
      const reorderedBuckets = newBuckets.map((bucket, index) => ({ 
        ...bucket, 
        order_index: index,
        updated_at: new Date()
      }));
      saveLocalBuckets(reorderedBuckets);
    }
  };

  return {
    buckets,
    isLoading: user ? isLoading : false,
    addBucket,
    updateBucket,
    deleteBucket,
    reorderBuckets,
  };
};
