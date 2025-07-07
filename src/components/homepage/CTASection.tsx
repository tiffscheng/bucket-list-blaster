
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

/**
 * Call-to-action section component for final user conversion
 * Encourages users to sign up with compelling messaging
 */
interface CTASectionProps {
  onGetStarted: () => void;
}

const CTASection = ({ onGetStarted }: CTASectionProps) => {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to transform your productivity?
        </h2>
        <p className="text-xl mb-8 opacity-90">
          Join thousands of users who have already organized their lives with TaskFlow
        </p>
        <Button 
          size="lg" 
          variant="secondary" 
          onClick={onGetStarted}
          className="text-lg px-8 py-3"
        >
          Get Started for Free
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </section>
  );
};

export default CTASection;
