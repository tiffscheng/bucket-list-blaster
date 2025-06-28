
import { useState } from 'react';
import { useBuckets } from '@/hooks/useBuckets';
import { Task } from '@/types/Task';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, GripVertical, Edit, Trash2, Check, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
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

const colorOptions = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#10b981' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Yellow', value: '#f59e0b' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Lime', value: '#84cc16' },
  { name: 'Emerald', value: '#059669' },
];

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
  const [showAddBucketDialog, setShowAddBucketDialog] = useState(false);
  const [newBucketName, setNewBucketName] = useState('');
  const [newBucketColor, setNewBucketColor] = useState('#3b82f6');
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [draggedOverBucket, setDraggedOverBucket] = useState<string | null>(null);
  const [duplicatingTask, setDuplicatingTask] = useState<Task | null>(null);
  const [editingBucket, setEditingBucket] = useState<string | null>(null);
  const [editBucketName, setEditBucketName] = useState('');
  const [editBucketColor, setEditBucketColor] = useState('');
  const [draggedBucket, setDraggedBucket] = useState<any>(null);
  const [draggedOverBucketIndex, setDraggedOverBucketIndex] = useState<number | null>(null);

  // Filter tasks for each bucket - General bucket shows tasks with no bucket_id
  const getFilteredTasksForBucket = (bucket: any) => {
    if (bucket.is_default) {
      // General bucket shows tasks with no bucket_id or null bucket_id
      return tasks.filter(task => !task.bucket_id);
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
      setShowAddBucketDialog(false);
    }
  };

  const handleEditBucket = (bucket: any) => {
    setEditingBucket(bucket.id);
    setEditBucketName(bucket.name);
    setEditBucketColor(bucket.color);
  };

  const handleSaveBucketEdit = (bucketId: string) => {
    if (editBucketName.trim()) {
      updateBucket(bucketId, {
        name: editBucketName.trim(),
        color: editBucketColor,
      });
      setEditingBucket(null);
    }
  };

  const handleCancelBucketEdit = () => {
    setEditingBucket(null);
    setEditBucketName('');
    setEditBucketColor('');
  };

  const handleDeleteBucket = (bucketId: string) => {
    deleteBucket(bucketId);
  };

  // Bucket drag and drop handlers
  const handleBucketDragStart = (e: React.DragEvent, bucket: any) => {
    setDraggedBucket(bucket);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleBucketDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDraggedOverBucketIndex(index);
  };

  const handleBucketDragLeave = () => {
    setDraggedOverBucketIndex(null);
  };

  const handleBucketDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (!draggedBucket) return;

    const currentIndex = buckets.findIndex(b => b.id === draggedBucket.id);
    if (currentIndex === dropIndex) return;

    const reorderedBuckets = [...buckets];
    const [removed] = reorderedBuckets.splice(currentIndex, 1);
    reorderedBuckets.splice(dropIndex, 0, removed);

    // Update order_index for all buckets
    const updatedBuckets = reorderedBuckets.map((bucket, index) => ({
      ...bucket,
      order_index: index
    }));

    reorderBuckets(updatedBuckets);
    setDraggedBucket(null);
    setDraggedOverBucketIndex(null);
  };

  // Task drag and drop handlers
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
        <Button onClick={() => setShowAddBucketDialog(true)}>
          <Plus size={16} className="mr-2" />
          Add Bucket
        </Button>
      </div>

      {/* Bucket Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {buckets.map((bucket, index) => {
          const bucketTasks = getFilteredTasksForBucket(bucket);
          const isEditing = editingBucket === bucket.id;
          const isDraggedOver = draggedOverBucketIndex === index && draggedBucket;
          
          return (
            <div
              key={bucket.id}
              draggable={!bucket.is_default && !isEditing}
              onDragStart={(e) => !bucket.is_default && handleBucketDragStart(e, bucket)}
              onDragOver={(e) => handleBucketDragOver(e, index)}
              onDragLeave={handleBucketDragLeave}
              onDrop={(e) => handleBucketDrop(e, index)}
              className={`
                rounded-lg border-2 border-dashed p-4 min-h-[200px] transition-all duration-200
                ${isDraggedOver 
                  ? 'border-blue-400 shadow-lg scale-105' 
                  : draggedOverBucket === bucket.id && draggedTask 
                    ? 'border-blue-400 shadow-lg scale-105' 
                    : 'border-gray-300 hover:border-gray-400'
                }
              `}
              style={{ 
                backgroundColor: bucket.color + '15', // Add transparency to the bucket color
                borderColor: isDraggedOver || (draggedOverBucket === bucket.id && draggedTask) ? '#60a5fa' : bucket.color
              }}
            >
              <div className="flex items-start justify-between mb-3">
                {isEditing ? (
                  <div className="flex-1 space-y-2">
                    <Input
                      value={editBucketName}
                      onChange={(e) => setEditBucketName(e.target.value)}
                      className="text-lg font-semibold max-w-full"
                      onKeyPress={(e) => e.key === 'Enter' && handleSaveBucketEdit(bucket.id)}
                    />
                    <div className="flex flex-wrap gap-1">
                      {colorOptions.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          className={`
                            w-6 h-6 rounded-full border-2 transition-all duration-200
                            ${editBucketColor === color.value 
                              ? 'border-gray-800 scale-110' 
                              : 'border-gray-300 hover:border-gray-500'
                            }
                          `}
                          style={{ backgroundColor: color.value }}
                          onClick={() => setEditBucketColor(color.value)}
                        />
                      ))}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        onClick={() => handleSaveBucketEdit(bucket.id)}
                        className="h-7 px-2"
                      >
                        <Check size={12} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelBucketEdit}
                        className="h-7 px-2"
                      >
                        <X size={12} />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      {!bucket.is_default && (
                        <GripVertical size={16} className="text-gray-400 cursor-grab" />
                      )}
                      <h3 className="text-lg font-semibold text-gray-700">{bucket.name}</h3>
                      <span className="text-sm text-gray-500">({bucketTasks.length})</span>
                    </div>
                    {!bucket.is_default && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditBucket(bucket)}
                          className="h-6 w-6 p-0 text-gray-500 hover:text-blue-600"
                        >
                          <Edit size={12} />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-gray-500 hover:text-red-600"
                            >
                              <Trash2 size={12} />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Bucket</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{bucket.name}"? Tasks in this bucket will be moved to the General bucket.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteBucket(bucket.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </>
                )}
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
                      useDropdownActions={true}
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

      {/* Add Bucket Dialog */}
      <Dialog open={showAddBucketDialog} onOpenChange={setShowAddBucketDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Bucket</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="bucket-name" className="block text-sm font-medium text-gray-700 mb-1">
                Bucket Name
              </label>
              <Input
                id="bucket-name"
                type="text"
                placeholder="Enter bucket name"
                value={newBucketName}
                onChange={(e) => setNewBucketName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddBucket()}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bucket Color
              </label>
              <div className="flex flex-wrap gap-1">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    className={`
                      w-6 h-6 rounded-full border-2 transition-all duration-200
                      ${newBucketColor === color.value 
                        ? 'border-gray-800 scale-110 shadow-lg' 
                        : 'border-gray-300 hover:border-gray-500'
                      }
                    `}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                    onClick={() => setNewBucketColor(color.value)}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddBucketDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddBucket} disabled={!newBucketName.trim()}>
              Add Bucket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
