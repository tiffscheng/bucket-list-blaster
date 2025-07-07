
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ListIcon, Calendar, Shuffle, Lock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Demo = () => {
  const [currentView, setCurrentView] = useState<'list' | 'calendar' | 'random'>('list');
  const navigate = useNavigate();

  const handleSignUp = () => {
    navigate('/auth');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const mockTasks = [
    { id: 1, title: "Complete project proposal", bucket: "Work", priority: "High" },
    { id: 2, title: "Review quarterly reports", bucket: "Work", priority: "Medium" },
    { id: 3, title: "Plan weekend trip", bucket: "Personal", priority: "Low" },
    { id: 4, title: "Buy groceries", bucket: "Personal", priority: "Medium" },
    { id: 5, title: "Schedule team meeting", bucket: "Work", priority: "High" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src="/lovable-uploads/a9b35cdb-10d4-4b2d-834a-fb18ef99eb4a.png" 
                alt="TaskFlow" 
                className="h-8"
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
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">TaskFlow Demo</h1>
          <p className="text-gray-600">Experience the power of TaskFlow task management</p>
        </div>

        {/* View Switcher */}
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

        {/* Demo Content with Overlay */}
        <div className="relative bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Blurred Content */}
          <div className="filter blur-sm opacity-50 p-6">
            {currentView === 'list' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Your Tasks</h3>
                {mockTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{task.title}</h4>
                      <p className="text-sm text-gray-600">{task.bucket}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      task.priority === 'High' ? 'bg-red-100 text-red-800' :
                      task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            {currentView === 'calendar' && (
              <div className="p-8">
                <h3 className="text-lg font-semibold mb-4">Calendar View</h3>
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="p-2 text-center font-medium text-gray-600">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 35 }, (_, i) => (
                    <div key={i} className="aspect-square border rounded p-1 text-sm">
                      {i > 4 && i < 32 ? (i - 4).toString() : ''}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {currentView === 'random' && (
              <div className="p-8 text-center">
                <h3 className="text-lg font-semibold mb-4">Random Task Generator</h3>
                <div className="bg-blue-50 rounded-lg p-6 mb-6">
                  <Shuffle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h4 className="font-medium mb-2">Your Next Task:</h4>
                  <p className="text-lg">{mockTasks[2].title}</p>
                </div>
                <Button disabled className="opacity-50">
                  Generate Another Task
                </Button>
              </div>
            )}
          </div>

          {/* Lock Overlay */}
          <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
            <div className="text-center max-w-md mx-auto p-8">
              <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Lock className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Please sign in for the full experience
              </h3>
              <p className="text-gray-600 mb-6">
                Create your free account to unlock all TaskFlow features and start organizing your tasks like a pro.
              </p>
              <div className="space-y-3">
                <Button onClick={handleSignUp} size="lg" className="w-full">
                  Sign Up Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <p className="text-sm text-gray-500">
                  Already have an account?{' '}
                  <button 
                    onClick={handleSignUp}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Sign in here
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Demo;
