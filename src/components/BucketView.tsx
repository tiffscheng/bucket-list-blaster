import { useState } from 'react';
import { useBuckets } from '@/hooks/useBuckets';
import { Task } from '@/types/Task';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Settings, X } from 'lucide-react';
import TaskItem from './TaskItem';
import TaskForm from './TaskForm';

interface BucketViewProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onDuplicateTask: (task: Task) => void;
  onReorderTasks: (tasks: Task[]) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
}

const BucketView = ({ 
  tasks, 
  onToggleTask, 
  onEditTask, 
  onDeleteTask, 
  onDuplicateTask,
  onReorderTasks,
  onToggleSubtask 
}: BucketViewProps) => {
  const { buckets, addBucket, updateBucket, deleteBucket, reorderBuckets } = useBuckets();
  const [showSettings, setShowSettings] = useState(false);
  const [newBucketName, setNewBucketName] = useState('');
  const [newBucketColor, setNewBucketColor] = useState('#3b82f6');
  const [draggedBucket, setDraggedBucket] = useState<string | null>(null);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [draggedOverBucket, setDraggedOverBucket] = useState<string | null>(null);
  const [duplicatingTask, setDuplicatingTask] = useState<Task | null>(null);

  const getFilteredTasksForBucket = (bucket: any) => {
    return tasks.filter(task => task.bucket_id === bucket.id);
  };

  const handleBucketDragStart = (e: React.DragEvent, bucketId: string) => {
    setDraggedBucket(bucketId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', bucketId);
  };

  const handleBucketDragEnd = () => {
    setDraggedBucket(null);
  };

  const handleBucketDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const targetBucketId = e.currentTarget.id;
    if (!draggedBucket || !targetBucketId || draggedBucket === targetBucketId) {
      return;
    }

    const newBucketOrder = buckets.map(bucket => bucket.id);
    const draggedIndex = newBucketOrder.indexOf(draggedBucket);
    const targetIndex = newBucketOrder.indexOf(targetBucketId);

    newBucketOrder.splice(draggedIndex, 1);
    newBucketOrder.splice(targetIndex, 0, draggedBucket);

    const reordered = newBucketOrder.map((bucketId, index) => {
      const bucket = buckets.find(b => b.id === bucketId);
      return { ...bucket, order_index: index };
    });

    reorderBuckets(reordered);
    setDraggedBucket(null);
  };

  const handleTaskDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task.id);
  };

  const handleTaskDragOver = (e: React.DragEvent, bucketId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDraggedOverBucket(bucketId);
  };

  const handleTaskDragLeave = () => {
    setDraggedOverBucket(null);
  };

  const handleTaskDrop = (e: React.DragEvent, bucketId: string) => {
    e.preventDefault();
    if (!draggedTask) return;

    const updatedTask = { ...draggedTask, bucket_id: bucketId };
    onReorderTasks(tasks.map(task => task.id === updatedTask.id ? updatedTask : task));

    setDraggedTask(null);
    setDraggedOverBucket(null);
  };

  const handleDuplicateTask = (task: Task) => {
    const duplicatedTaskData = {
      title: `${task.title} (Copy)`,
      description: task.description,
      priority: task.priority,
      effort: task.effort,
      labels: [...task.labels],
      due_date: task.due_date,
      bucket_id: task.bucket_id,
      subtasks: task.subtasks.map(subtask => ({
        id: crypto.randomUUID(),
        title: subtask.title,
        completed: false
      })),
      is_recurring: task.is_recurring,
      recurrence_interval: task.recurrence_interval,
      user_id: task.user_id,
      updated_at: task.updated_at,
    };
    
    // Create a mock task object for the form
    setDuplicatingTask({
      ...duplicatedTaskData,
      id: 'duplicate-temp',
      completed: false,
      created_at: new Date(),
      order_index: 0
    });
  };

  const handleSubmitDuplicate = (taskData: Omit<Task, 'id' | 'completed' | 'created_at' | 'order_index'>) => {
    onDuplicateTask({
      ...taskData,
      id: crypto.randomUUID(),
      completed: false,
      created_at: new Date(),
      order_index: 0
    });
    setDuplicatingTask(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Task Buckets</h2>
        <Button variant="outline" size="sm" onClick={() => setShowSettings(!showSettings)}>
          <Settings size={16} className="mr-2" />
          Settings
        </Button>
      </div>

      {showSettings && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <h3 className="text-lg font-medium text-gray-700">Bucket Settings</h3>

          <div className="flex items-center gap-2">
            <Input
              type="text"
              placeholder="Bucket name"
              value={newBucketName}
              onChange={(e) => setNewBucketName(e.target.value)}
            />
            <Input
              type="color"
              value={newBucketColor}
              onChange={(e) => setNewBucketColor(e.target.value)}
            />
            <Button
              onClick={() => {
                if (newBucketName) {
                  addBucket({
                    name: newBucketName,
                    color: newBucketColor,
                    order_index: buckets.length,
                    is_default: false,
                  });
                  setNewBucketName('');
                }
              }}
            >
              <Plus size={16} className="mr-2" />
              Add Bucket
            </Button>
          </div>

          <div className="space-y-2">
            {buckets.map((bucket) => (
              <div
                key={bucket.id}
                id={bucket.id}
                className="flex items-center justify-between bg-white rounded-md p-3 shadow-sm"
                draggable
                onDrop={handleBucketDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                <span className="font-medium text-gray-800">{bucket.name}</span>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={bucket.color}
                    onChange={(e) => updateBucket(bucket.id, { ...bucket, color: e.target.value })}
                    className="w-10 h-8"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteBucket(bucket.id)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <X size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {buckets.map((bucket) => {
          const bucketTasks = getFilteredTasksForBucket(bucket);
          
          return (
            <div
              key={bucket.id}
              className={`
                bg-white rounded-lg border-2 p-4 min-h-[200px] transition-all duration-200
                ${draggedOverBucket === bucket.id && draggedTask 
                  ? 'border-blue-400 bg-blue-50 shadow-lg' 
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
              onDragOver={(e) => handleTaskDragOver(e, bucket.id)}
              onDragLeave={handleTaskDragLeave}
              onDrop={(e) => handleTaskDrop(e, bucket.id)}
              draggable
              onDragStart={(e) => handleBucketDragStart(e, bucket.id)}
              onDragEnd={handleBucketDragEnd}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-700">{bucket.name}</h3>
                <span
                  className="w-5 h-5 rounded-full"
                  style={{ backgroundColor: bucket.color }}
                />
              </div>
              
              <div className="space-y-2">
                {bucketTasks.map((task) => (
                  <div key={task.id}>
                    <TaskItem
                      task={task}
                      onToggle={onToggleTask}
                      onEdit={onEditTask}
                      onDelete={onDeleteTask}
                      onDuplicate={handleDuplicateTask}
                      onToggleSubtask={onToggleSubtask}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {duplicatingTask && (
        <TaskForm
          task={duplicatingTask}
          onSubmit={handleSubmitDuplicate}
          onCancel={() => setDuplicatingTask(null)}
        />
      )}
    </div>
  );
};

export default BucketView;
