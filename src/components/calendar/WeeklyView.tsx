
import { format, isSameDay, eachDayOfInterval } from 'date-fns';
import { Task } from '@/types/Task';
import { getTasksForDate, getPriorityColor } from './CalendarUtils';

interface WeeklyViewProps {
  selectedDate: Date;
  rangeStart: Date;
  rangeEnd: Date;
  tasks: Task[];
  onDayClick: (date: Date) => void;
}

const WeeklyView = ({ selectedDate, rangeStart, rangeEnd, tasks, onDayClick }: WeeklyViewProps) => {
  const weekDays = eachDayOfInterval({ start: rangeStart, end: rangeEnd });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-7 gap-1 lg:gap-2 min-w-full overflow-x-auto">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-semibold p-1 lg:p-2 bg-gray-100 rounded text-xs lg:text-sm">
            {day}
          </div>
        ))}
        {weekDays.map((day) => {
          const dayTasks = getTasksForDate(tasks, day);
          return (
            <div 
              key={day.toString()} 
              className={`border rounded-lg p-1 lg:p-3 min-h-20 lg:min-h-32 cursor-pointer hover:bg-gray-50 ${
                isSameDay(day, selectedDate) ? 'bg-blue-50 border-blue-300' : 'bg-white'
              }`}
              onClick={() => onDayClick(day)}
            >
              <div className="font-semibold text-xs lg:text-sm mb-1 lg:mb-2">{format(day, 'd')}</div>
              <div className="space-y-1">
                {dayTasks.slice(0, 2).map((task) => (
                  <div 
                    key={task.id} 
                    className={`text-xs p-1 rounded truncate ${getPriorityColor(task.priority)}`}
                  >
                    {task.title}
                  </div>
                ))}
                {dayTasks.length > 2 && (
                  <div className="text-xs text-gray-500">+{dayTasks.length - 2}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyView;
