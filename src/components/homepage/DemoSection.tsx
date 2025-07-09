
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

/**
 * Demo section component that showcases TaskFlow with a large screenshot
 * Includes a call-to-action button to try the interactive demo
 */
interface DemoSectionProps {
  onTryDemo: () => void;
}

const DemoSection = ({ onTryDemo }: DemoSectionProps) => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            See TaskFlow in action
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Get a glimpse of how TaskFlow makes task management effortless
          </p>
          <Button 
            size="lg" 
            onClick={onTryDemo}
            className="text-lg px-8 py-3 bg-blue-600 hover:bg-blue-700"
          >
            <Play className="mr-2 h-5 w-5" />
            Try Interactive Demo
          </Button>
        </div>
        
        {/* Light background container with centered screenshot */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-b from-blue-50 to-white rounded-xl min-h-96 flex items-end justify-center">
            <div 
              className="bg-white rounded-t-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer transform hover:-translate-y-2 max-w-3xl"
              onClick={onTryDemo}
            >
              <div className="relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=800&fit=crop" 
                  alt="TaskFlow Task Management Interface"
                  className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="bg-white/90 rounded-full p-4">
                    <Play className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DemoSection;
