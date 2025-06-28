
import { useState } from 'react';
import TaskManager from '@/components/TaskManager';
import CalendarView from '@/components/CalendarView';
import RandomTaskGenerator from '@/components/RandomTaskGenerator';
import { Button } from '@/components/ui/button';
import { ListIcon, Calendar, Shuffle, LogOut, LogIn, LockKeyhole } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const [currentView, setCurrentView] = useState<'list' | 'calendar' | 'random'>('list');
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSignIn = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
            <div className="flex-1">
              <img 
                src="/lovable-uploads/a9b35cdb-10d4-4b2d-834a-fb18ef99eb4a.png" 
                alt="TaskFlow" 
                className="h-10 mb-4"
              />
              <p className="text-gray-600 mb-4 lg:mb-0">Organize your tasks, manage your time, achieve your goals</p>
              {!user && (
                <p className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200 max-w-2xl">
                  💡 Please sign in to save your tasks and unlock the full experience.
                </p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 lg:items-end lg:flex-col lg:gap-2">
              {user ? (
                <>
                  <span className="text-sm text-gray-600 order-2 sm:order-1">Welcome, {user.email}</span>
                  <Button variant="outline" size="sm" onClick={handleSignOut} className="order-1 sm:order-2">
                    <LogOut size={16} className="mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button variant="outline" size="sm" onClick={handleSignIn}>
                  <LogIn size={16} className="mr-2" />
                  Sign In
                </Button>
              )}
            </div>
          </div>
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
            disabled={!user}
            title={!user ? 'Please sign in to use this feature' : ''}
          >
            {!user ? <LockKeyhole size={18} /> : <Shuffle size={18} />}
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
