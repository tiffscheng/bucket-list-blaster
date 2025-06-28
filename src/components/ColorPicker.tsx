
import { Button } from '@/components/ui/button';

interface ColorPickerProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
  className?: string;
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

const ColorPicker = ({ selectedColor, onColorSelect, className = "" }: ColorPickerProps) => {
  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {colorOptions.map((color) => (
        <button
          key={color.value}
          type="button"
          className={`
            w-6 h-6 rounded-full border-2 transition-all duration-200
            ${selectedColor === color.value 
              ? 'border-gray-800 scale-110 shadow-lg' 
              : 'border-gray-300 hover:border-gray-500'
            }
          `}
          style={{ backgroundColor: color.value }}
          title={color.name}
          onClick={() => onColorSelect(color.value)}
        />
      ))}
    </div>
  );
};

export default ColorPicker;
