
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Task } from '@/types/Task';

interface CalendarSidebarProps {
  recurringTasks: Task[];
  upcomingTasks: Task[];
}

const CalendarSidebar = ({ recurringTasks, upcomingTasks }: CalendarSidebarProps) => {
  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Recurring Tasks */}
      <div>
        <h4 className="text-lg font-semibold mb-3">Recurring Tasks</h4>
        <div className="space-y-2">
          {recurringTasks.length === 0 ? (
            <p className="text-gray-500 text-sm">No recurring tasks</p>
          ) : (
            recurringTasks.map((task) => (
              <div key={task.id} className="p-3 border rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span className="font-medium text-sm truncate">{task.title}</span>
                  <Badge variant="secondary" className="text-xs w-fit">
                    {task.recurrence_interval}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Upcoming Tasks */}
      <div>
        <h4 className="text-lg font-semibold mb-3">Upcoming Tasks</h4>
        <div className="space-y-2">
          {upcomingTasks.length === 0 ? (
            <p className="text-gray-500 text-sm">No upcoming tasks</p>
          ) : (
            upcomingTasks.map((task) => (
              <div key={task.id} className="p-3 border rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span className="font-medium text-sm truncate">{task.title}</span>
                  <span className="text-xs text-gray-500">
                    {task.due_date && format(task.due_date, 'MMM d')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarSidebar;
