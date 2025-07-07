
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

/**
 * Hero section component for the homepage
 * Displays the main headline, description, and primary call-to-action buttons
 */
interface HeroSectionProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

const HeroSection = ({ onGetStarted, onSignIn }: HeroSectionProps) => {
  return (
    <section className="relative py-20 lg:py-32">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Organize your tasks,<br />
            <span className="text-blue-600">achieve your goals</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            TaskFlow helps you manage your tasks with smart organization, calendar views, 
            and intelligent features that boost your productivity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={onGetStarted} className="text-lg px-8 py-3">
              Start Organizing Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" onClick={onSignIn} className="text-lg px-8 py-3">
              Sign In
            </Button>
          </div>
        </div>
      </div>
      
      {/* Decorative background elements */}
      <div className="absolute top-20 left-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 right-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
    </section>
  );
};

export default HeroSection;
