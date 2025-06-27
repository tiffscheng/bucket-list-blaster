
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { INPUT_LIMITS } from '@/utils/security';

interface TaskFormBasicFieldsProps {
  formData: {
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    effort: 'quick' | 'medium' | 'long' | 'massive';
  };
  errors: {[key: string]: string};
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDescriptionChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onPriorityChange: (value: any) => void;
  onEffortChange: (value: any) => void;
}

const TaskFormBasicFields = ({ 
  formData, 
  errors, 
  onTitleChange, 
  onDescriptionChange, 
  onPriorityChange, 
  onEffortChange 
}: TaskFormBasicFieldsProps) => {
  return (
    <>
      <div>
        <Label htmlFor="title">Title * ({formData.title.length}/{INPUT_LIMITS.TITLE})</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={onTitleChange}
          placeholder="Enter task title..."
          maxLength={INPUT_LIMITS.TITLE}
          required
          className={errors.title ? 'border-red-500' : ''}
        />
        {errors.title && (
          <p className="text-sm text-red-600 mt-1">{errors.title}</p>
        )}
      </div>

      <div>
        <Label htmlFor="description">Description ({formData.description.length}/{INPUT_LIMITS.DESCRIPTION})</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={onDescriptionChange}
          placeholder="Enter task description..."
          maxLength={INPUT_LIMITS.DESCRIPTION}
          rows={3}
          className={errors.description ? 'border-red-500' : ''}
        />
        {errors.description && (
          <p className="text-sm text-red-600 mt-1">{errors.description}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Priority</Label>
          <Select value={formData.priority} onValueChange={onPriorityChange}>
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
          <Select value={formData.effort} onValueChange={onEffortChange}>
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
    </>
  );
};

export default TaskFormBasicFields;
