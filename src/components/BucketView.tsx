
import { useState } from 'react';
import TaskItem from './TaskItem';
import { Task } from '@/types/Task';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface CustomBucket {
  id: string;
  name: string;
  color: string;
  priority?: string;
}

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
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [draggedOverBucket, setDraggedOverBucket] = useState<string | null>(null);
  const [customBuckets, setCustomBuckets] = useState<CustomBucket[]>([]);
  const [newBucketName, setNewBucketName] = useState('');
  const [newBucketColor, setNewBucketColor] = useState('#3b82f6');
  const [isAddingBucket, setIsAddingBucket] = useState(false);
  const [editingBucket, setEditingBucket] = useState<CustomBucket | null>(null);

  const defaultBuckets: CustomBucket[] = [
    { id: 'urgent', name: 'Urgent', color: '#ef4444', priority: 'urgent' },
    { id: 'high', name: 'High Priority', color: '#f97316', priority: 'high' },
    { id: 'medium', name: 'Medium Priority', color: '#eab308', priority: 'medium' },
    { id: 'low', name: 'Low Priority', color: '#22c55e', priority: 'low' },
  ];

  const allBuckets = [...defaultBuckets, ...customBuckets];

  const getTasksForBucket = (bucket: CustomBucket) => {
    if (bucket.priority) {
      return tasks.filter(task => task.priority === bucket.priority);
    }
    // For custom buckets, we'll use labels to categorize tasks
    return tasks.filter(task => task.labels.includes(bucket.name));
  };

  const addCustomBucket = () => {
    if (!newBucketName.trim()) return;
    
    const newBucket: CustomBucket = {
      id: crypto.randomUUID(),
      name: newBucketName.trim(),
      color: newBucketColor,
    };
    
    setCustomBuckets([...customBuckets, newBucket]);
    setNewBucketName('');
    setNewBucketColor('#3b82f6');
    setIsAddingBucket(false);
  };

  const updateBucket = (bucketId: string, updates: Partial<CustomBucket>) => {
    setCustomBuckets(buckets => 
      buckets.map(bucket => 
        bucket.id === bucketId ? { ...bucket, ...updates } : bucket
      )
    );
    setEditingBucket(null);
  };

  const deleteBucket = (bucketId: string) => {
    setCustomBuckets(buckets => buckets.filter(bucket => bucket.id !== bucketId));
  };

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', '');
  };

  const handleDragOver = (e: React.DragEvent, bucketId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDraggedOverBucket(bucketId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDraggedOverBucket(null);
    }
  };

  const handleDrop = (e: React.DragEvent, bucket: CustomBucket) => {
    e.preventDefault();
    if (!draggedTask) return;

    let updatedTask = { ...draggedTask };
    
    if (bucket.priority) {
      updatedTask.priority = bucket.priority as Task['priority'];
    } else {
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

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDraggedOverBucket(null);
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
        {allBuckets.map((bucket) => {
          const bucketTasks = getTasksForBucket(bucket);
          const isDefaultBucket = bucket.priority !== undefined;
          
          return (
            <div
              key={bucket.id}
              className={cn(
                "p-4 rounded-lg border-2 border-dashed min-h-[200px] transition-all duration-200",
                draggedOverBucket === bucket.id && draggedTask && !bucketTasks.some(t => t.id === draggedTask.id)
                  ? "border-blue-400 scale-102 shadow-lg"
                  : "border-gray-300",
                draggedTask && bucketTasks.some(t => t.id === draggedTask.id) && draggedOverBucket !== bucket.id
                  ? "opacity-75"
                  : ""
              )}
              style={{ 
                backgroundColor: `${bucket.color}10`,
                borderColor: bucket.color 
              }}
              onDragOver={(e) => handleDragOver(e, bucket.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, bucket)}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-700 flex-1">
                  {bucket.name} ({bucketTasks.length})
                </h4>
                {!isDefaultBucket && (
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingBucket(bucket)}
                    >
                      <Edit size={14} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteBucket(bucket.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                {bucketTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task)}
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
                <Button onClick={() => updateBucket(editingBucket.id, editingBucket)}>
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
