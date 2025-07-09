
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Task } from '@/types/Task';
import { getPriorityColor } from './CalendarUtils';

interface DailyViewProps {
  selectedDate: Date;
  tasks: Task[];
}

const DailyView = ({ selectedDate, tasks }: DailyViewProps) => {
  return (
    <div className="space-y-4">
      <div className="text-center p-8 border rounded-lg bg-gray-50">
        <h3 className="text-xl font-semibold mb-4">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</h3>
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <p className="text-gray-500">No tasks for this day</p>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className="p-3 border rounded-lg bg-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{task.title}</span>
                  <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
                {task.description && (
                  <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                )}
                {task.labels && task.labels.length > 0 && (
                  <div className="flex gap-1">
                    {task.labels.map((label, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {label}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyView;
