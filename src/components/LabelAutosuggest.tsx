
import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';

interface LabelAutosuggestProps {
  labels: string[];
  onLabelsChange: (labels: string[]) => void;
  maxLength?: number;
}

const LabelAutosuggest = ({ labels, onLabelsChange, maxLength = 50 }: LabelAutosuggestProps) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const { tasks } = useTasks();

  // Get all unique labels from existing tasks
  const allLabels = Array.from(new Set(tasks.flatMap(task => task.labels)));

  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = allLabels.filter(label => 
        label.toLowerCase().includes(inputValue.toLowerCase()) &&
        !labels.includes(label)
      );
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
    setActiveSuggestionIndex(-1);
  }, [inputValue, labels, allLabels]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (activeSuggestionIndex >= 0 && suggestions[activeSuggestionIndex]) {
        addLabel(suggestions[activeSuggestionIndex]);
      } else if (inputValue.trim()) {
        addLabel(inputValue.trim());
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestionIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setActiveSuggestionIndex(-1);
    }
  };

  const addLabel = (label: string) => {
    if (label && !labels.includes(label)) {
      onLabelsChange([...labels, label]);
      setInputValue('');
      setShowSuggestions(false);
      setActiveSuggestionIndex(-1);
    }
  };

  const removeLabel = (labelToRemove: string) => {
    onLabelsChange(labels.filter(label => label !== labelToRemove));
  };

  const handleSuggestionClick = (suggestion: string) => {
    addLabel(suggestion);
    inputRef.current?.focus();
  };

  const handleAddClick = () => {
    if (inputValue.trim()) {
      addLabel(inputValue.trim());
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Add label..."
            maxLength={maxLength}
            onFocus={() => inputValue.trim() && setShowSuggestions(suggestions.length > 0)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />
          <Button type="button" onClick={handleAddClick} variant="outline">
            Add
          </Button>
        </div>
        
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion}
                type="button"
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
                  index === activeSuggestionIndex ? 'bg-gray-100' : ''
                }`}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {labels.map((label) => (
          <span
            key={label}
            className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center gap-1"
          >
            {label}
            <X
              size={14}
              className="cursor-pointer hover:text-blue-600"
              onClick={() => removeLabel(label)}
            />
          </span>
        ))}
      </div>
    </div>
  );
};

export default LabelAutosuggest;
