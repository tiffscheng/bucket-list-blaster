import { useState } from 'react';
import { useBuckets } from '@/hooks/useBuckets';
import { Task } from '@/types/Task';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit, X, GripVertical } from 'lucide-react';
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
  const [newBucketName, setNewBucketName] = useState('');
  const [newBucketColor, setNewBucketColor] = useState('#3b82f6');
  const [editingBucket, setEditingBucket] = useState<string | null>(null);
  const [editBucketName, setEditBucketName] = useState('');
  const [draggedBucket, setDraggedBucket] = useState<string | null>(null);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [draggedOverBucket, setDraggedOverBucket] = useState<string | null>(null);
  const [duplicatingTask, setDuplicatingTask] = useState<Task | null>(null);

  const getFilteredTasksForBucket = (bucket: any) => {
    if (bucket.is_default) {
      // General bucket shows tasks with no bucket_id or matching bucket_id
      return tasks.filter(task => !task.bucket_id || task.bucket_id === bucket.id);
    }
    return tasks.filter(task => task.bucket_id === bucket.id);
  };

  const handleAddBucket = () => {
    if (newBucketName.trim()) {
      addBucket({
        name: newBucketName.trim(),
        color: newBucketColor,
        order_index: buckets.length,
        is_default: false,
      });
      setNewBucketName('');
      setNewBucketColor('#3b82f6');
    }
  };

  const handleEditBucket = (bucketId: string) => {
    const bucket = buckets.find(b => b.id === bucketId);
    if (bucket) {
      setEditingBucket(bucketId);
      setEditBucketName(bucket.name);
    }
  };

  const handleSaveBucketEdit = (bucketId: string) => {
    if (editBucketName.trim()) {
      const bucket = buckets.find(b => b.id === bucketId);
      if (bucket) {
        updateBucket(bucketId, { ...bucket, name: editBucketName.trim() });
      }
    }
    setEditingBucket(null);
    setEditBucketName('');
  };

  const handleCancelBucketEdit = () => {
    setEditingBucket(null);
    setEditBucketName('');
  };

  const handleBucketDragStart = (e: React.DragEvent, bucketId: string) => {
    setDraggedBucket(bucketId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleBucketDragEnd = () => {
    setDraggedBucket(null);
  };

  const handleBucketDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleBucketDrop = (e: React.DragEvent, targetBucketId: string) => {
    e.preventDefault();
    if (!draggedBucket || draggedBucket === targetBucketId) return;

    const draggedIndex = buckets.findIndex(b => b.id === draggedBucket);
    const targetIndex = buckets.findIndex(b => b.id === targetBucketId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newBuckets = [...buckets];
    const [draggedBucketObj] = newBuckets.splice(draggedIndex, 1);
    newBuckets.splice(targetIndex, 0, draggedBucketObj);

    const reorderedBuckets = newBuckets.map((bucket, index) => ({
      ...bucket,
      order_index: index
    }));

    reorderBuckets(reorderedBuckets);
  };

  const handleTaskDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
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

    const bucket = buckets.find(b => b.id === bucketId);
    const newBucketId = bucket?.is_default ? undefined : bucketId;

    const updatedTask = { ...draggedTask, bucket_id: newBucketId };
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Task Buckets</h2>
      </div>

      {/* Bucket Management */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
        <h3 className="text-lg font-medium text-gray-700">Manage Buckets</h3>

        {/* Add New Bucket */}
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="New bucket name"
            value={newBucketName}
            onChange={(e) => setNewBucketName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddBucket()}
          />
          <Input
            type="color"
            value={newBucketColor}
            onChange={(e) => setNewBucketColor(e.target.value)}
            className="w-16"
          />
          <Button onClick={handleAddBucket} disabled={!newBucketName.trim()}>
            <Plus size={16} className="mr-2" />
            Add Bucket
          </Button>
        </div>

        {/* Existing Buckets */}
        <div className="space-y-2">
          {buckets.map((bucket) => (
            <div
              key={bucket.id}
              className={`flex items-center justify-between bg-white rounded-md p-3 shadow-sm cursor-move transition-all duration-200 ${
                draggedBucket === bucket.id ? 'opacity-50' : ''
              }`}
              draggable
              onDragStart={(e) => handleBucketDragStart(e, bucket.id)}
              onDragEnd={handleBucketDragEnd}
              onDragOver={handleBucketDragOver}
              onDrop={(e) => handleBucketDrop(e, bucket.id)}
            >
              <div className="flex items-center gap-3">
                <GripVertical size={16} className="text-gray-400" />
                {editingBucket === bucket.id ? (
                  <Input
                    type="text"
                    value={editBucketName}
                    onChange={(e) => setEditBucketName(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') handleSaveBucketEdit(bucket.id);
                      if (e.key === 'Escape') handleCancelBucketEdit();
                    }}
                    className="h-8"
                    autoFocus
                  />
                ) : (
                  <span className="font-medium text-gray-800">
                    {bucket.name} {bucket.is_default && '(Default)'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={bucket.color}
                  onChange={(e) => updateBucket(bucket.id, { ...bucket, color: e.target.value })}
                  className="w-10 h-8"
                />
                {editingBucket === bucket.id ? (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSaveBucketEdit(bucket.id)}
                      className="h-8 px-2"
                    >
                      Save
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelBucketEdit}
                      className="h-8 px-2"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditBucket(bucket.id)}
                      className="h-8 px-2"
                    >
                      <Edit size={14} />
                    </Button>
                    {!bucket.is_default && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteBucket(bucket.id)}
                        className="text-red-600 hover:bg-red-50 h-8 px-2"
                      >
                        <X size={14} />
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bucket Grid */}
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
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-700">{bucket.name}</h3>
                <div className="flex items-center gap-2">
                  <span
                    className="w-5 h-5 rounded-full"
                    style={{ backgroundColor: bucket.color }}
                  />
                  <span className="text-sm text-gray-500">({bucketTasks.length})</span>
                </div>
              </div>
              
              <div className="space-y-2">
                {bucketTasks.map((task) => (
                  <div 
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleTaskDragStart(e, task)}
                  >
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
                {bucketTasks.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <p className="text-sm">No tasks in this bucket</p>
                    <p className="text-xs mt-1">Drag tasks here to organize them</p>
                  </div>
                )}
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
