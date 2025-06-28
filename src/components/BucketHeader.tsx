
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GripVertical, Edit, Trash2, Check, X } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import ColorPicker from './ColorPicker';

interface BucketHeaderProps {
  bucket: any;
  taskCount: number;
  onUpdateBucket: (bucketId: string, name: string, color: string) => void;
  onDeleteBucket: (bucketId: string) => void;
}

const BucketHeader = ({ bucket, taskCount, onUpdateBucket, onDeleteBucket }: BucketHeaderProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(bucket.name);
  const [editColor, setEditColor] = useState(bucket.color);

  const handleSaveEdit = () => {
    if (editName.trim()) {
      onUpdateBucket(bucket.id, editName.trim(), editColor);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditName(bucket.name);
    setEditColor(bucket.color);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditName(bucket.name);
    setEditColor(bucket.color);
  };

  if (isEditing) {
    return (
      <div className="flex-1 space-y-2">
        <Input
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          className="text-lg font-semibold"
          onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
        />
        <ColorPicker
          selectedColor={editColor}
          onColorSelect={setEditColor}
        />
        <div className="flex gap-1">
          <Button
            size="sm"
            onClick={handleSaveEdit}
            className="h-7 px-2"
          >
            <Check size={12} />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCancelEdit}
            className="h-7 px-2"
          >
            <X size={12} />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {!bucket.is_default && (
          <GripVertical size={16} className="text-gray-400 cursor-grab" />
        )}
        <h3 className="text-lg font-semibold text-gray-700">{bucket.name}</h3>
        <span className="text-sm text-gray-500">({taskCount})</span>
      </div>
      {!bucket.is_default && (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
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
                <AlertDialogAction onClick={() => onDeleteBucket(bucket.id)}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </>
  );
};

export default BucketHeader;
