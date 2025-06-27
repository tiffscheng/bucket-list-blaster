
import { useState } from 'react';
import TaskManager from '@/components/TaskManager';
import CalendarView from '@/components/CalendarView';
import RandomTaskGenerator from '@/components/RandomTaskGenerator';
import { Button } from '@/components/ui/button';
import { ListIcon, Calendar, Shuffle } from 'lucide-react';

const Index = () => {
  const [currentView, setCurrentView] = useState<'list' | 'calendar' | 'random'>('list');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Task<span className="text-blue-600">Flow</span>
          </h1>
          <p className="text-gray-600">Organize your tasks, manage your time, achieve your goals</p>
        </div>

        <div className="flex flex-wrap gap-4 mb-8">
          <Button
            onClick={() => setCurrentView('list')}
            variant={currentView === 'list' ? 'default' : 'outline'}
            className="flex items-center gap-2"
          >
            <ListIcon size={18} />
            List View
          </Button>
          <Button
            onClick={() => setCurrentView('calendar')}
            variant={currentView === 'calendar' ? 'default' : 'outline'}
            className="flex items-center gap-2"
          >
            <Calendar size={18} />
            Calendar View
          </Button>
          <Button
            onClick={() => setCurrentView('random')}
            variant={currentView === 'random' ? 'default' : 'outline'}
            className="flex items-center gap-2"
          >
            <Shuffle size={18} />
            Random Task
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {currentView === 'list' && <TaskManager />}
          {currentView === 'calendar' && <CalendarView />}
          {currentView === 'random' && <RandomTaskGenerator />}
        </div>
      </div>
    </div>
  );
};

export default Index;
