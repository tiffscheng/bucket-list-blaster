
import { format, isSameDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { Task } from '@/types/Task';
import { getTasksForDate, getPriorityColor } from './CalendarUtils';

interface MonthlyViewProps {
  selectedDate: Date;
  tasks: Task[];
  onDayClick: (date: Date) => void;
}

const MonthlyView = ({ selectedDate, tasks, onDayClick }: MonthlyViewProps) => {
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const startCalendar = startOfWeek(monthStart);
  const endCalendar = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startCalendar, end: endCalendar });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-7 gap-1 lg:gap-2 min-w-full overflow-x-auto">
        {/* Header row */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-semibold p-1 lg:p-2 bg-gray-100 rounded text-xs lg:text-sm">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {calendarDays.map((day) => {
          const dayTasks = getTasksForDate(tasks, day);
          const isCurrentMonth = day >= monthStart && day <= monthEnd;
          const isToday = isSameDay(day, new Date());
          const isSelected = isSameDay(day, selectedDate);

          return (
            <div 
              key={day.toString()} 
              className={`border rounded-lg p-1 lg:p-2 min-h-16 lg:min-h-24 cursor-pointer hover:bg-gray-50 ${
                isSelected ? 'bg-blue-50 border-blue-300' : 'bg-white'
              } ${!isCurrentMonth ? 'opacity-40' : ''} ${
                isToday ? 'ring-1 lg:ring-2 ring-blue-400' : ''
              }`}
              onClick={() => onDayClick(day)}
            >
              <div className={`text-xs lg:text-sm mb-1 ${isToday ? 'font-bold text-blue-600' : 'font-medium'}`}>
                {format(day, 'd')}
              </div>
              <div className="space-y-1">
                {dayTasks.slice(0, isCurrentMonth ? 2 : 1).map((task) => (
                  <div 
                    key={task.id} 
                    className={`text-xs p-1 rounded truncate ${getPriorityColor(task.priority)}`}
                  >
                    {task.title}
                  </div>
                ))}
                {dayTasks.length > (isCurrentMonth ? 2 : 1) && (
                  <div className="text-xs text-gray-500">+{dayTasks.length - (isCurrentMonth ? 2 : 1)}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthlyView;
