
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ListIcon, Calendar, Shuffle, Lock, ArrowRight, AlertTriangle, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TaskManager from '@/components/TaskManager';
import CalendarView from '@/components/CalendarView';

/**
 * Demo page component - Shows a locked version of the TaskFlow app
 * Displays the real app interface with sample tasks and locked functionality
 * 
 * Features:
 * - Real TaskManager and CalendarView components
 * - Sample tasks displayed in actual interface
 * - Warning banner to encourage authentication
 * - Locked Add Task button and Random Task Generator
 * - Sign-up prompts for locked features
 */
const Demo = () => {
  const [currentView, setCurrentView] = useState<'list' | 'calendar' | 'random'>('list');
  const navigate = useNavigate();

  /**
   * Navigate to authentication page for user sign-up
   */
  const handleSignUp = () => {
    navigate('/auth');
  };

  /**
   * Navigate back to homepage
   */
  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header with demo badge */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src="/lovable-uploads/a9b35cdb-10d4-4b2d-834a-fb18ef99eb4a.png" 
                alt="TaskFlow" 
                className="h-6"
              />
              <span className="text-sm text-gray-500 bg-yellow-100 px-2 py-1 rounded-full">
                Demo Mode
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={handleBackToHome}>
                Back to Home
              </Button>
              <Button onClick={handleSignUp}>
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Warning banner for demo mode */}
        <Alert className="mb-6 border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>Demo Mode:</strong> Sign up or sign in to save tasks and unlock the full TaskFlow experience.
          </AlertDescription>
        </Alert>

        {/* View switcher with locked random task generator */}
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
            disabled
          >
            <Lock size={16} />
            Random Task
          </Button>
        </div>

        {/* Real app content */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {currentView === 'list' && <TaskManager isDemo={true} />}
          {currentView === 'calendar' && <CalendarView isDemo={true} />}
          {currentView === 'random' && (
            <div className="p-8 text-center">
              <div className="bg-blue-50 rounded-lg p-6 mb-6">
                <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="font-medium mb-2 text-gray-600">Feature Locked</h4>
                <p className="text-lg text-gray-500 mb-4">Sign up to use the Random Task Generator</p>
                <Button onClick={handleSignUp} className="w-full">
                  Sign Up Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Demo;
