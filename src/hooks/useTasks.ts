import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Task, Subtask } from '@/types/Task';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const LOCAL_STORAGE_KEY = 'taskflow-tasks';

export const useTasks = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [localTasks, setLocalTasks] = useState<Task[]>([]);

  // Load local tasks from localStorage on mount
  useEffect(() => {
    if (!user) {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        try {
          const parsedTasks = JSON.parse(stored).map((task: any) => ({
            ...task,
            due_date: task.due_date ? new Date(task.due_date) : undefined,
            created_at: new Date(task.created_at),
            updated_at: task.updated_at ? new Date(task.updated_at) : undefined,
            last_completed_at: task.last_completed_at ? new Date(task.last_completed_at) : undefined,
          }));
          setLocalTasks(parsedTasks);
        } catch (error) {
          console.error('Error parsing local tasks:', error);
          setLocalTasks([]);
        }
      }
    }
  }, [user]);

  // Save local tasks to localStorage
  const saveLocalTasks = (tasks: Task[]) => {
    setLocalTasks(tasks);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
  };

  // Fetch tasks from Supabase (only for authenticated users)
  const { data: supabaseTasks = [], isLoading } = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('order_index', { ascending: true });

      if (tasksError) throw tasksError;

      const { data: subtasksData, error: subtasksError } = await supabase
        .from('subtasks')
        .select('*')
        .in('task_id', tasksData.map(task => task.id));

      if (subtasksError) throw subtasksError;

      const tasksWithSubtasks: Task[] = tasksData.map(task => ({
        ...task,
        priority: task.priority as 'low' | 'medium' | 'high' | 'urgent',
        effort: task.effort as 'quick' | 'medium' | 'long' | 'massive',
        recurrence_interval: task.recurrence_interval as 'daily' | 'weekly' | 'monthly' | 'yearly' | undefined,
        due_date: task.due_date ? new Date(task.due_date) : undefined,
        created_at: new Date(task.created_at),
        updated_at: task.updated_at ? new Date(task.updated_at) : undefined,
        last_completed_at: task.last_completed_at ? new Date(task.last_completed_at) : undefined,
        subtasks: subtasksData.filter(subtask => subtask.task_id === task.id).map(subtask => ({
          id: subtask.id,
          title: subtask.title,
          completed: subtask.completed
        }))
      }));

      return tasksWithSubtasks;
    },
    enabled: !!user,
  });

  // Use either Supabase tasks or local tasks
  const tasks = user ? supabaseTasks : localTasks;

  // Local task operations
  const addLocalTask = (taskData: Omit<Task, 'id' | 'completed' | 'created_at' | 'order_index'>) => {
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      completed: false,
      created_at: new Date(),
      order_index: localTasks.length,
    };
    saveLocalTasks([...localTasks, newTask]);
    toast({
      title: "Task added locally",
      description: "Sign in to save your tasks permanently",
    });
  };

  const updateLocalTask = (id: string, updates: Partial<Task>) => {
    const updatedTasks = localTasks.map(task => 
      task.id === id ? { ...task, ...updates, updated_at: new Date() } : task
    );
    saveLocalTasks(updatedTasks);
  };

  const deleteLocalTask = (id: string) => {
    const updatedTasks = localTasks.filter(task => task.id !== id);
    saveLocalTasks(updatedTasks);
    toast({
      title: "Task deleted",
      description: "Task removed from local storage",
    });
  };

  // Supabase mutations (only for authenticated users)
  const addTaskMutation = useMutation({
    mutationFn: async (taskData: Omit<Task, 'id' | 'completed' | 'created_at' | 'order_index'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .insert([
          {
            user_id: user.id,
            title: taskData.title,
            description: taskData.description,
            priority: taskData.priority,
            effort: taskData.effort,
            labels: taskData.labels,
            due_date: taskData.due_date?.toISOString(),
            bucket_id: taskData.bucket_id,
            order_index: tasks.length,
            is_recurring: taskData.is_recurring,
            recurrence_interval: taskData.recurrence_interval,
          },
        ])
        .select()
        .single();

      if (taskError) throw taskError;

      if (taskData.subtasks.length > 0) {
        const { error: subtasksError } = await supabase
          .from('subtasks')
          .insert(
            taskData.subtasks.map(subtask => ({
              task_id: task.id,
              title: subtask.title,
              completed: subtask.completed,
            }))
          );

        if (subtasksError) throw subtasksError;
      }

      return task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
      toast({
        title: "Success",
        description: "Task created successfully",
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

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Task> }) => {
      const { error } = await supabase
        .from('tasks')
        .update({
          title: updates.title,
          description: updates.description,
          priority: updates.priority,
          effort: updates.effort,
          labels: updates.labels,
          due_date: updates.due_date?.toISOString(),
          completed: updates.completed,
          bucket_id: updates.bucket_id,
          is_recurring: updates.is_recurring,
          recurrence_interval: updates.recurrence_interval,
          last_completed_at: updates.last_completed_at?.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
      toast({
        title: "Success",
        description: "Task deleted successfully",
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

  // Toggle subtask mutation
  const toggleSubtaskMutation = useMutation({
    mutationFn: async ({ taskId, subtaskId }: { taskId: string; subtaskId: string }) => {
      const { data: subtask, error: getError } = await supabase
        .from('subtasks')
        .select('completed')
        .eq('id', subtaskId)
        .single();

      if (getError) throw getError;

      const { error: updateError } = await supabase
        .from('subtasks')
        .update({ completed: !subtask.completed })
        .eq('id', subtaskId);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
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
  const addTask = (taskData: Omit<Task, 'id' | 'completed' | 'created_at' | 'order_index'>) => {
    if (user) {
      addTaskMutation.mutate(taskData);
    } else {
      addLocalTask(taskData);
    }
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    if (user) {
      updateTaskMutation.mutate({ id, updates });
    } else {
      updateLocalTask(id, updates);
    }
  };

  const deleteTask = (id: string) => {
    if (user) {
      deleteTaskMutation.mutate(id);
    } else {
      deleteLocalTask(id);
    }
  };

  const toggleTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      let updates: Partial<Task> = { completed: !task.completed };
      
      if (!task.completed && task.is_recurring) {
        updates = {
          completed: false,
          last_completed_at: new Date(),
        };
      }
      
      updateTask(id, updates);
    }
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    if (user) {
      toggleSubtaskMutation.mutate({ taskId, subtaskId });
    } else {
      const updatedTasks = localTasks.map(task => {
        if (task.id === taskId) {
          const updatedSubtasks = task.subtasks.map(subtask => 
            subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask
          );
          return { ...task, subtasks: updatedSubtasks };
        }
        return task;
      });
      saveLocalTasks(updatedTasks);
    }
  };

  const reorderTasks = async (newTasks: Task[]) => {
    if (user) {
      const updates = newTasks.map((task, index) => ({
        id: task.id,
        order_index: index,
        bucket_id: task.bucket_id,
      }));

      for (const update of updates) {
        await supabase
          .from('tasks')
          .update({ 
            order_index: update.order_index,
            bucket_id: update.bucket_id 
          })
          .eq('id', update.id);
      }

      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
    } else {
      const reorderedTasks = newTasks.map((task, index) => ({ ...task, order_index: index }));
      saveLocalTasks(reorderedTasks);
    }
  };

  return {
    tasks,
    isLoading: user ? isLoading : false,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    toggleSubtask,
    reorderTasks,
  };
};
