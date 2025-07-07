
import { CheckCircle, Calendar, Users, Shuffle } from 'lucide-react';

/**
 * Features section component that displays the main features of TaskFlow
 * Shows four key features with icons and descriptions
 */
const FeaturesSection = () => {
  const features = [
    {
      icon: CheckCircle,
      title: "Smart Task Management",
      description: "Organize your tasks with custom buckets, priorities, and labels for maximum productivity."
    },
    {
      icon: Calendar,
      title: "Calendar Integration", 
      description: "View your tasks in a beautiful calendar format with due dates and scheduling."
    },
    {
      icon: Shuffle,
      title: "Random Task Generator",
      description: "Break through decision paralysis with our intelligent random task picker."
    },
    {
      icon: Users,
      title: "Personal Workspace",
      description: "Your tasks are private and secure, accessible only to you across all devices."
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything you need to stay organized
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            TaskFlow combines powerful features with an intuitive design to help you 
            manage your tasks efficiently.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <feature.icon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
