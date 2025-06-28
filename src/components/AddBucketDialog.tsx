
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import ColorPicker from './ColorPicker';

interface AddBucketDialogProps {
  onAddBucket: (name: string, color: string) => void;
}

const AddBucketDialog = ({ onAddBucket }: AddBucketDialogProps) => {
  const [showDialog, setShowDialog] = useState(false);
  const [bucketName, setBucketName] = useState('');
  const [bucketColor, setBucketColor] = useState('#3b82f6');

  const handleAddBucket = () => {
    if (bucketName.trim()) {
      onAddBucket(bucketName.trim(), bucketColor);
      setBucketName('');
      setBucketColor('#3b82f6');
      setShowDialog(false);
    }
  };

  return (
    <>
      <Button onClick={() => setShowDialog(true)}>
        <Plus size={16} className="mr-2" />
        Add Bucket
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
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
                value={bucketName}
                onChange={(e) => setBucketName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddBucket()}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bucket Color
              </label>
              <ColorPicker
                selectedColor={bucketColor}
                onColorSelect={setBucketColor}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddBucket} disabled={!bucketName.trim()}>
              Add Bucket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddBucketDialog;
