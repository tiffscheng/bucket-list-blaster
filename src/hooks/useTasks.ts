import { useState, useEffect } from 'react';
import { Task } from '@/types/Task';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  // Load tasks from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('taskflow-tasks');
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks);
      // Convert date strings back to Date objects and ensure subtasks exist
      const tasksWithDates = parsedTasks.map((task: any) => ({
        ...task,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        createdAt: new Date(task.createdAt),
        subtasks: task.subtasks || [], // Ensure subtasks exist for backward compatibility
      }));
      setTasks(tasksWithDates);
    }
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('taskflow-tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (taskData: Omit<Task, 'id' | 'completed' | 'createdAt' | 'order'>) => {
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      completed: false,
      createdAt: new Date(),
      order: tasks.length,
    };
    setTasks(prev => [...prev, newTask]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId 
        ? {
            ...task,
            subtasks: task.subtasks.map(subtask =>
              subtask.id === subtaskId 
                ? { ...subtask, completed: !subtask.completed }
                : subtask
            )
          }
        : task
    ));
  };

  const reorderTasks = (newTasks: Task[]) => {
    const tasksWithOrder = newTasks.map((task, index) => ({
      ...task,
      order: index,
    }));
    setTasks(tasksWithOrder);
  };

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    toggleSubtask,
    reorderTasks,
  };
};
