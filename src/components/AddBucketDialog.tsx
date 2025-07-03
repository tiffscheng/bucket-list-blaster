
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import ColorPicker from './ColorPicker';

interface AddBucketDialogProps {
  onAddBucket: (name: string, color: string) => void;
}

const AddBucketDialog = ({ onAddBucket }: AddBucketDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3b82f6');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAddBucket(name.trim(), color);
      setName('');
      setColor('#3b82f6');
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-700 hover:bg-emerald-800 text-white">
          <Plus size={16} className="mr-2" />
          Add Bucket
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Bucket</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="bucket-name">Bucket Name</Label>
            <Input
              id="bucket-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter bucket name"
              className="mt-1"
            />
          </div>
          <div>
            <Label>Bucket Color</Label>
            <ColorPicker
              selectedColor={color}
              onColorSelect={setColor}
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600"
            >
              Create Bucket
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddBucketDialog;
