
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Task, Subtask } from '@/types/Task';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useTasks = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch tasks
  const { data: tasks = [], isLoading } = useQuery({
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

      const tasksWithSubtasks = tasksData.map(task => ({
        ...task,
        dueDate: task.due_date ? new Date(task.due_date) : undefined,
        createdAt: new Date(task.created_at),
        updatedAt: task.updated_at ? new Date(task.updated_at) : undefined,
        lastCompletedAt: task.last_completed_at ? new Date(task.last_completed_at) : undefined,
        order: task.order_index,
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

  // Add task mutation
  const addTaskMutation = useMutation({
    mutationFn: async (taskData: Omit<Task, 'id' | 'completed' | 'createdAt' | 'order'>) => {
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
            due_date: taskData.dueDate?.toISOString(),
            order_index: tasks.length,
            is_recurring: taskData.is_recurring,
            recurrence_interval: taskData.recurrence_interval,
          },
        ])
        .select()
        .single();

      if (taskError) throw taskError;

      // Add subtasks if any
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
          due_date: updates.dueDate?.toISOString(),
          completed: updates.completed,
          is_recurring: updates.is_recurring,
          recurrence_interval: updates.recurrence_interval,
          last_completed_at: updates.lastCompletedAt?.toISOString(),
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

  const addTask = (taskData: Omit<Task, 'id' | 'completed' | 'createdAt' | 'order'>) => {
    addTaskMutation.mutate(taskData);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    updateTaskMutation.mutate({ id, updates });
  };

  const deleteTask = (id: string) => {
    deleteTaskMutation.mutate(id);
  };

  const toggleTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      let updates: Partial<Task> = { completed: !task.completed };
      
      // If completing a recurring task, set last_completed_at and reset completed to false
      if (!task.completed && task.is_recurring) {
        updates = {
          completed: false,
          lastCompletedAt: new Date(),
        };
      }
      
      updateTask(id, updates);
    }
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    toggleSubtaskMutation.mutate({ taskId, subtaskId });
  };

  const reorderTasks = async (newTasks: Task[]) => {
    const updates = newTasks.map((task, index) => ({
      id: task.id,
      order_index: index,
    }));

    for (const update of updates) {
      await supabase
        .from('tasks')
        .update({ order_index: update.order_index })
        .eq('id', update.id);
    }

    queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
  };

  return {
    tasks,
    isLoading,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    toggleSubtask,
    reorderTasks,
  };
};
