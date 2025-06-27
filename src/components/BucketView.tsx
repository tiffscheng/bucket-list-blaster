import { useState } from 'react';
import TaskItem from './TaskItem';
import { Task } from '@/types/Task';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, GripVertical } from 'lucide-react';
import { useBuckets } from '@/hooks/useBuckets';

interface BucketViewProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onReorderTasks: (tasks: Task[]) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
}

const BucketView = ({ 
  tasks, 
  onToggleTask, 
  onEditTask, 
  onDeleteTask, 
  onReorderTasks,
  onToggleSubtask 
}: BucketViewProps) => {
  const { buckets, addBucket, updateBucket, deleteBucket, reorderBuckets } = useBuckets();
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [draggedOverBucket, setDraggedOverBucket] = useState<string | null>(null);
  const [draggedBucket, setDraggedBucket] = useState<any>(null);
  const [draggedOverBucketOrder, setDraggedOverBucketOrder] = useState<number | null>(null);
  
  const [newBucketName, setNewBucketName] = useState('');
  const [newBucketColor, setNewBucketColor] = useState('#3b82f6');
  const [isAddingBucket, setIsAddingBucket] = useState(false);
  const [editingBucket, setEditingBucket] = useState<any>(null);

  const sortedBuckets = [...buckets].sort((a, b) => a.order_index - b.order_index);

  const getTasksForBucket = (bucket: any) => {
    if (bucket.is_default) {
      // Default bucket shows tasks without specific labels or with the bucket name as label
      return tasks.filter(task => 
        task.labels.length === 0 || 
        task.labels.includes(bucket.name) ||
        !buckets.some(b => !b.is_default && task.labels.includes(b.name))
      );
    }
    // For custom buckets, we'll use labels to categorize tasks
    return tasks.filter(task => task.labels.includes(bucket.name));
  };

  const addCustomBucket = () => {
    if (!newBucketName.trim()) return;
    
    const maxOrder = Math.max(...buckets.map(b => b.order_index), -1);
    addBucket({
      name: newBucketName.trim(),
      color: newBucketColor,
      order_index: maxOrder + 1,
      is_default: false,
    });
    
    setNewBucketName('');
    setNewBucketColor('#3b82f6');
    setIsAddingBucket(false);
  };

  const handleUpdateBucket = (bucketId: string, updates: any) => {
    updateBucket(bucketId, updates);
    setEditingBucket(null);
  };

  const handleDeleteBucket = (bucketId: string) => {
    const bucketToDelete = buckets.find(b => b.id === bucketId);
    if (bucketToDelete?.is_default) return; // Prevent deleting default bucket
    
    deleteBucket(bucketId);
  };

  const handleTaskDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', '');
  };

  const handleTaskDragOver = (e: React.DragEvent, bucketId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDraggedOverBucket(bucketId);
  };

  const handleTaskDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDraggedOverBucket(null);
    }
  };

  const handleTaskDrop = (e: React.DragEvent, bucket: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedTask) return;

    let updatedTask = { ...draggedTask };
    
    if (!bucket.is_default) {
      // For custom buckets, add the bucket name as a label
      if (!updatedTask.labels.includes(bucket.name)) {
        updatedTask.labels = [...updatedTask.labels, bucket.name];
      }
    }
    
    const otherTasks = tasks.filter(task => task.id !== draggedTask.id);
    const updatedTasks = [...otherTasks, updatedTask];
    
    onReorderTasks(updatedTasks);
    setDraggedTask(null);
    setDraggedOverBucket(null);
  };

  const handleBucketDragStart = (e: React.DragEvent, bucket: any) => {
    setDraggedBucket(bucket);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', '');
  };

  const handleBucketDragOver = (e: React.DragEvent, targetOrder: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDraggedOverBucketOrder(targetOrder);
  };

  const handleBucketDrop = (e: React.DragEvent, targetOrder: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedBucket || draggedBucket.order_index === targetOrder) return;

    const updatedBuckets = buckets.map(bucket => {
      if (bucket.id === draggedBucket.id) {
        return { ...bucket, order_index: targetOrder };
      }
      
      if (draggedBucket.order_index < targetOrder) {
        // Moving down: shift buckets between old and new position up
        if (bucket.order_index > draggedBucket.order_index && bucket.order_index <= targetOrder) {
          return { ...bucket, order_index: bucket.order_index - 1 };
        }
      } else {
        // Moving up: shift buckets between new and old position down
        if (bucket.order_index >= targetOrder && bucket.order_index < draggedBucket.order_index) {
          return { ...bucket, order_index: bucket.order_index + 1 };
        }
      }
      
      return bucket;
    });

    reorderBuckets(updatedBuckets);
    setDraggedBucket(null);
    setDraggedOverBucketOrder(null);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDraggedOverBucket(null);
    setDraggedBucket(null);
    setDraggedOverBucketOrder(null);
  };

  const colorOptions = [
    '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', 
    '#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b'
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Task Buckets</h3>
        <Dialog open={isAddingBucket} onOpenChange={setIsAddingBucket}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus size={16} className="mr-1" />
              Add Bucket
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Bucket</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="bucketName">Bucket Name</Label>
                <Input
                  id="bucketName"
                  value={newBucketName}
                  onChange={(e) => setNewBucketName(e.target.value)}
                  placeholder="Enter bucket name"
                />
              </div>
              <div>
                <Label>Color</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-all",
                        newBucketColor === color ? "border-gray-800 scale-110" : "border-gray-300"
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewBucketColor(color)}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={addCustomBucket} disabled={!newBucketName.trim()}>
                  Add Bucket
                </Button>
                <Button variant="outline" onClick={() => setIsAddingBucket(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sortedBuckets.map((bucket) => {
          const bucketTasks = getTasksForBucket(bucket);
          
          return (
            <div
              key={bucket.id}
              draggable
              onDragStart={(e) => handleBucketDragStart(e, bucket)}
              onDragOver={(e) => handleBucketDragOver(e, bucket.order_index)}
              onDrop={(e) => handleBucketDrop(e, bucket.order_index)}
              onDragEnd={handleDragEnd}
              className={cn(
                "p-4 rounded-lg border-2 border-dashed min-h-[200px] transition-all duration-200 cursor-grab active:cursor-grabbing",
                draggedOverBucket === bucket.id && draggedTask && !bucketTasks.some(t => t.id === draggedTask.id)
                  ? "border-blue-400 scale-102 shadow-lg"
                  : "border-gray-300",
                draggedTask && bucketTasks.some(t => t.id === draggedTask.id) && draggedOverBucket !== bucket.id
                  ? "opacity-75"
                  : "",
                draggedOverBucketOrder === bucket.order_index && draggedBucket
                  ? "border-blue-400 scale-105"
                  : ""
              )}
              style={{ 
                backgroundColor: `${bucket.color}10`,
                borderColor: bucket.color 
              }}
              onDragOverCapture={(e) => handleTaskDragOver(e, bucket.id)}
              onDragLeave={handleTaskDragLeave}
              onDropCapture={(e) => handleTaskDrop(e, bucket)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 flex-1">
                  <GripVertical size={16} className="text-gray-400" />
                  <h4 className="font-semibold text-gray-700 flex-1">
                    {bucket.name} ({bucketTasks.length})
                  </h4>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingBucket(bucket)}
                  >
                    <Edit size={14} />
                  </Button>
                  {!bucket.is_default && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteBucket(bucket.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                {bucketTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleTaskDragStart(e, task)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      "cursor-move transition-all duration-200 ease-in-out",
                      draggedTask?.id === task.id 
                        ? "opacity-50 scale-95 rotate-1 shadow-lg" 
                        : "opacity-100 scale-100 rotate-0 hover:shadow-sm"
                    )}
                  >
                    <TaskItem
                      task={task}
                      onToggle={onToggleTask}
                      onEdit={onEditTask}
                      onDelete={onDeleteTask}
                      onToggleSubtask={onToggleSubtask}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {editingBucket && (
        <Dialog open={!!editingBucket} onOpenChange={() => setEditingBucket(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Bucket</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="editBucketName">Bucket Name</Label>
                <Input
                  id="editBucketName"
                  value={editingBucket.name}
                  onChange={(e) => setEditingBucket({ ...editingBucket, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Color</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-all",
                        editingBucket.color === color ? "border-gray-800 scale-110" : "border-gray-300"
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => setEditingBucket({ ...editingBucket, color })}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleUpdateBucket(editingBucket.id, editingBucket)}>
                  Update
                </Button>
                <Button variant="outline" onClick={() => setEditingBucket(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default BucketView;
