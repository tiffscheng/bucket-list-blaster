
import { useState } from 'react';
import TaskManager from '@/components/TaskManager';
import CalendarView from '@/components/CalendarView';
import RandomTaskGenerator from '@/components/RandomTaskGenerator';
import { Button } from '@/components/ui/button';
import { ListIcon, Calendar, Shuffle, LogOut, LogIn, LockKeyhole, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const [currentView, setCurrentView] = useState<'list' | 'calendar' | 'random'>('list');
  const [showBanner, setShowBanner] = useState(true);
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
      {!user && showBanner && (
        <div className="sticky top-0 z-50 bg-amber-100 border-b border-amber-200 px-4 py-3">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-amber-600">💡</div>
              <p className="text-amber-800 font-medium">
                Please sign in to save your tasks and unlock the full experience.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignIn}
                className="bg-white hover:bg-amber-50 border-amber-300 text-amber-700"
              >
                <LogIn size={16} className="mr-2" />
                Sign In
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBanner(false)}
              className="text-amber-600 hover:bg-amber-200 p-1"
            >
              <X size={16} />
            </Button>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="flex-1">
              <img 
                src="/lovable-uploads/a9b35cdb-10d4-4b2d-834a-fb18ef99eb4a.png" 
                alt="TaskFlow" 
                className="h-10 mb-4"
              />
              <p className="text-gray-600 mb-4 sm:mb-0">Organize your tasks, manage your time, achieve your goals</p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
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
