
interface TaskEffortIndicatorProps {
  effort: 'quick' | 'medium' | 'long' | 'massive';
}

const TaskEffortIndicator = ({ effort }: TaskEffortIndicatorProps) => {
  const getEffortIcon = (effort: string) => {
    switch (effort) {
      case 'quick': return '⚡';
      case 'medium': return '⏰';
      case 'long': return '📅';
      case 'massive': return '🏔️';
      default: return '⏰';
    }
  };

  return (
    <span className="text-sm text-gray-500 flex items-center gap-1">
      {getEffortIcon(effort)} {effort}
    </span>
  );
};

export default TaskEffortIndicator;
