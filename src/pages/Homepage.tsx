
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import HeroSection from '@/components/homepage/HeroSection';
import FeaturesSection from '@/components/homepage/FeaturesSection';
import DemoSection from '@/components/homepage/DemoSection';
import TestimonialsSection from '@/components/homepage/TestimonialsSection';
import CTASection from '@/components/homepage/CTASection';

/**
 * Homepage component - Main landing page for unauthenticated users
 * Showcases TaskFlow features and encourages sign-up
 * 
 * Features:
 * - Navigation header with logo and auth buttons
 * - Hero section with main value proposition
 * - Features overview
 * - Interactive demo section
 * - Customer testimonials
 * - Call-to-action section
 * - Footer with copyright information
 */
const Homepage = () => {
  const navigate = useNavigate();

  /**
   * Navigate to authentication page for new user registration
   */
  const handleGetStarted = () => {
    navigate('/auth');
  };

  /**
   * Navigate to authentication page for existing user login
   */
  const handleSignIn = () => {
    navigate('/auth');
  };

  /**
   * Navigate to demo page to showcase app functionality
   */
  const handleTryDemo = () => {
    navigate('/demo');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <img 
                src="/lovable-uploads/a9b35cdb-10d4-4b2d-834a-fb18ef99eb4a.png" 
                alt="TaskFlow" 
                className="h-6"
              />
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={handleSignIn}>
                Sign In
              </Button>
              <Button onClick={handleGetStarted}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Sections */}
      <HeroSection onGetStarted={handleGetStarted} onSignIn={handleSignIn} />
      <FeaturesSection />
      <DemoSection onTryDemo={handleTryDemo} />
      <TestimonialsSection />
      <CTASection onGetStarted={handleGetStarted} />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-2">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-gray-400">© 2025 TaskFlow</p>
            <p className="text-gray-400">
               All rights reserved
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;
