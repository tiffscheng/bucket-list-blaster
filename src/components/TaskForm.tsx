
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { X, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Task, Subtask } from '@/types/Task';
import { sanitizeTextInput, INPUT_LIMITS, containsOnlyAllowedChars } from '@/utils/security';
import { useToast } from '@/hooks/use-toast';
import TaskFormBasicFields from './TaskFormBasicFields';

interface TaskFormProps {
  task?: Task | null;
  onSubmit: (task: Omit<Task, 'id' | 'completed' | 'created_at' | 'order_index'>) => void;
  onCancel: () => void;
}

const TaskForm = ({ task, onSubmit, onCancel }: TaskFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    effort: 'medium' as 'quick' | 'medium' | 'long' | 'massive',
    labels: [] as string[],
    due_date: undefined as Date | undefined,
    subtasks: [] as Subtask[],
    is_recurring: false,
    recurrence_interval: undefined as 'daily' | 'weekly' | 'monthly' | 'yearly' | undefined,
    user_id: undefined as string | undefined,
    updated_at: undefined as Date | undefined,
    bucket_id: undefined as string | undefined,
  });
  const [newLabel, setNewLabel] = useState('');
  const [newSubtask, setNewSubtask] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const { toast } = useToast();

  // Check if this is a duplicate task (has a temporary ID)
  const isDuplicateTask = task?.id === 'duplicate-temp';
  const isEditingTask = task && !isDuplicateTask;

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        effort: task.effort,
        labels: [...task.labels],
        due_date: task.due_date,
        subtasks: [...task.subtasks],
        is_recurring: task.is_recurring,
        recurrence_interval: task.recurrence_interval,
        user_id: task.user_id,
        updated_at: task.updated_at,
        bucket_id: task.bucket_id,
      });
    }
  }, [task]);

  const validateInput = (field: string, value: string, maxLength: number): string | null => {
    try {
      if (!containsOnlyAllowedChars(value)) {
        return 'Contains invalid characters';
      }
      
      if (value.length > maxLength) {
        return `Must be ${maxLength} characters or less`;
      }
      
      return null;
    } catch (error) {
      return 'Invalid input';
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const error = validateInput('title', value, INPUT_LIMITS.TITLE);
    
    setErrors(prev => ({ ...prev, title: error || '' }));
    setFormData(prev => ({ ...prev, title: value }));
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const error = validateInput('description', value, INPUT_LIMITS.DESCRIPTION);
    
    setErrors(prev => ({ ...prev, description: error || '' }));
    setFormData(prev => ({ ...prev, description: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const sanitizedTitle = sanitizeTextInput(formData.title, INPUT_LIMITS.TITLE);
      const sanitizedDescription = sanitizeTextInput(formData.description, INPUT_LIMITS.DESCRIPTION);
      
      if (!sanitizedTitle.trim()) {
        toast({
          title: "Validation Error",
          description: "Title is required",
          variant: "destructive",
        });
        return;
      }

      const sanitizedLabels = formData.labels.map(label => 
        sanitizeTextInput(label, INPUT_LIMITS.LABEL)
      );

      const sanitizedSubtasks = formData.subtasks.map(subtask => ({
        ...subtask,
        title: sanitizeTextInput(subtask.title, INPUT_LIMITS.SUBTASK_TITLE)
      }));

      const sanitizedFormData = {
        ...formData,
        title: sanitizedTitle,
        description: sanitizedDescription,
        labels: sanitizedLabels,
        subtasks: sanitizedSubtasks,
      };

      onSubmit(sanitizedFormData);
    } catch (error: any) {
      toast({
        title: "Validation Error",
        description: error.message || "Please check your input",
        variant: "destructive",
      });
    }
  };

  const addLabel = () => {
    try {
      const sanitizedLabel = sanitizeTextInput(newLabel, INPUT_LIMITS.LABEL);
      
      if (sanitizedLabel && !formData.labels.includes(sanitizedLabel)) {
        setFormData(prev => ({
          ...prev,
          labels: [...prev.labels, sanitizedLabel]
        }));
        setNewLabel('');
      }
    } catch (error: any) {
      toast({
        title: "Validation Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const removeLabel = (label: string) => {
    setFormData(prev => ({
      ...prev,
      labels: prev.labels.filter(l => l !== label)
    }));
  };

  const addSubtask = () => {
    try {
      const sanitizedSubtask = sanitizeTextInput(newSubtask, INPUT_LIMITS.SUBTASK_TITLE);
      
      if (sanitizedSubtask) {
        const subtask: Subtask = {
          id: crypto.randomUUID(),
          title: sanitizedSubtask,
          completed: false,
        };
        setFormData(prev => ({
          ...prev,
          subtasks: [...prev.subtasks, subtask]
        }));
        setNewSubtask('');
      }
    } catch (error: any) {
      toast({
        title: "Validation Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const removeSubtask = (subtaskId: string) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.filter(s => s.id !== subtaskId)
    }));
  };

  const hasErrors = Object.values(errors).some(error => error);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">
          {isEditingTask ? 'Edit Task' : 'Add New Task'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <TaskFormBasicFields
            formData={formData}
            errors={errors}
            onTitleChange={handleTitleChange}
            onDescriptionChange={handleDescriptionChange}
            onPriorityChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}
            onEffortChange={(value: any) => setFormData(prev => ({ ...prev, effort: value }))}
          />

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
                    !formData.due_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.due_date ? format(formData.due_date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.due_date}
                  onSelect={(date) => setFormData(prev => ({ ...prev, due_date: date }))}
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
                maxLength={INPUT_LIMITS.LABEL}
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
                maxLength={INPUT_LIMITS.SUBTASK_TITLE}
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
            <Button type="submit" className="flex-1" disabled={hasErrors}>
              {isEditingTask ? 'Update Task' : 'Add Task'}
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
