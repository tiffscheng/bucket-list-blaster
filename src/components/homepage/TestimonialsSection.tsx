
import { Star } from 'lucide-react';

/**
 * Testimonials section component displaying user reviews and ratings
 * Shows social proof through customer testimonials
 */
const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Product Manager",
      content: "TaskFlow has completely transformed how I manage my daily tasks. The bucket system is brilliant!",
      rating: 5
    },
    {
      name: "Mike Chen",
      role: "Freelancer",
      content: "The random task generator is a game-changer when I can't decide what to work on next.",
      rating: 5
    },
    {
      name: "Emily Davis",
      role: "Student",
      content: "Simple, clean, and exactly what I needed. No bloat, just pure productivity.",
      rating: 5
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Loved by productivity enthusiasts
          </h2>
          <p className="text-xl text-gray-600">
            See what our users have to say about TaskFlow
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-4 italic">
                "{testimonial.content}"
              </p>
              <div>
                <p className="font-semibold text-gray-900">{testimonial.name}</p>
                <p className="text-gray-600 text-sm">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
