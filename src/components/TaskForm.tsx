import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { X, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Task, Subtask } from '@/types/Task';

interface TaskFormProps {
  task?: Task | null;
  onSubmit: (task: Omit<Task, 'id' | 'completed' | 'createdAt' | 'order'>) => void;
  onCancel: () => void;
}

const TaskForm = ({ task, onSubmit, onCancel }: TaskFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    effort: 'medium' as 'quick' | 'medium' | 'long' | 'massive',
    labels: [] as string[],
    dueDate: undefined as Date | undefined,
    subtasks: [] as Subtask[],
    is_recurring: false,
    recurrence_interval: undefined as 'daily' | 'weekly' | 'monthly' | 'yearly' | undefined,
  });
  const [newLabel, setNewLabel] = useState('');
  const [newSubtask, setNewSubtask] = useState('');

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        effort: task.effort,
        labels: [...task.labels],
        dueDate: task.dueDate,
        subtasks: [...task.subtasks],
        is_recurring: task.is_recurring,
        recurrence_interval: task.recurrence_interval,
      });
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    
    onSubmit(formData);
  };

  const addLabel = () => {
    if (newLabel.trim() && !formData.labels.includes(newLabel.trim())) {
      setFormData(prev => ({
        ...prev,
        labels: [...prev.labels, newLabel.trim()]
      }));
      setNewLabel('');
    }
  };

  const removeLabel = (label: string) => {
    setFormData(prev => ({
      ...prev,
      labels: prev.labels.filter(l => l !== label)
    }));
  };

  const addSubtask = () => {
    if (newSubtask.trim()) {
      const subtask: Subtask = {
        id: crypto.randomUUID(),
        title: newSubtask.trim(),
        completed: false,
      };
      setFormData(prev => ({
        ...prev,
        subtasks: [...prev.subtasks, subtask]
      }));
      setNewSubtask('');
    }
  };

  const removeSubtask = (subtaskId: string) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.filter(s => s.id !== subtaskId)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">
          {task ? 'Edit Task' : 'Add New Task'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter task title..."
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter task description..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Priority</Label>
              <Select value={formData.priority} onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Effort</Label>
              <Select value={formData.effort} onValueChange={(value: any) => setFormData(prev => ({ ...prev, effort: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quick">Quick (&lt; 30min)</SelectItem>
                  <SelectItem value="medium">Medium (1-2 hours)</SelectItem>
                  <SelectItem value="long">Long (half day)</SelectItem>
                  <SelectItem value="massive">Massive (full day+)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Recurring Task Section */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Switch
                id="recurring"
                checked={formData.is_recurring}
                onCheckedChange={(checked) => setFormData(prev => ({ 
                  ...prev, 
                  is_recurring: checked,
                  recurrence_interval: checked ? 'weekly' : undefined
                }))}
              />
              <Label htmlFor="recurring">Recurring Task</Label>
            </div>
            
            {formData.is_recurring && (
              <div>
                <Label>Recurrence Interval</Label>
                <Select 
                  value={formData.recurrence_interval} 
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, recurrence_interval: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select interval" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div>
            <Label>Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.dueDate ? format(formData.dueDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.dueDate}
                  onSelect={(date) => setFormData(prev => ({ ...prev, dueDate: date }))}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label>Labels</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Add label..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLabel())}
              />
              <Button type="button" onClick={addLabel} variant="outline">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.labels.map((label) => (
                <span
                  key={label}
                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center gap-1"
                >
                  {label}
                  <X
                    size={14}
                    className="cursor-pointer hover:text-blue-600"
                    onClick={() => removeLabel(label)}
                  />
                </span>
              ))}
            </div>
          </div>

          <div>
            <Label>Subtasks</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                placeholder="Add subtask..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
              />
              <Button type="button" onClick={addSubtask} variant="outline">
                <Plus size={16} />
              </Button>
            </div>
            <div className="space-y-2">
              {formData.subtasks.map((subtask) => (
                <div
                  key={subtask.id}
                  className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md"
                >
                  <span className="text-sm">{subtask.title}</span>
                  <X
                    size={14}
                    className="cursor-pointer hover:text-red-600"
                    onClick={() => removeSubtask(subtask.id)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {task ? 'Update Task' : 'Add Task'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
