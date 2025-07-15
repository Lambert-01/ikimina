import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

interface TestimonialProps {
  quote: string;
  author: string;
  role: string;
  group?: string;
  image?: string;
  isActive?: boolean;
  onNext?: () => void;
  onPrev?: () => void;
}

const Testimonial: React.FC<TestimonialProps> = ({ 
  quote, 
  author, 
  role, 
  group, 
  image, 
  isActive = true,
  onNext,
  onPrev
}) => {
  return (
    <div 
      className={`bg-white rounded-xl shadow-card p-8 relative transition-all duration-500 transform
        ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-95 absolute'}`}
    >
      <div className="absolute -top-5 left-8 bg-primary-500 rounded-full p-3 shadow-lg">
        <Quote size={24} className="text-white" />
      </div>
      
      {/* Rwandan-inspired decoration */}
      <div className="absolute top-0 right-0 border-t-[32px] border-r-[32px] border-t-secondary-500 border-r-transparent"></div>

      <div className="pt-6 md:flex md:items-start gap-6">
        <div className="md:flex-1">
          <p className="text-gray-700 italic mb-6 leading-relaxed text-lg">"<span className="text-primary-600 font-semibold">{quote.substring(0, 20)}...</span>{quote.substring(20)}"</p>
          <div className="flex items-center gap-4">
            <div className="bg-gray-100 w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center border-2 border-primary-100">
              {image ? (
                <img src={image} alt={author} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-bold text-primary-500">{author.charAt(0)}</span>
              )}
            </div>
            <div>
              <p className="font-bold text-gray-900">{author}</p>
              <p className="text-gray-600 text-sm">{role}{group && <span>, <span className="text-primary-600">{group}</span></span>}</p>
            </div>
          </div>
        </div>

        {/* Navigation controls for larger screens */}
        <div className="hidden md:flex items-center gap-3 mt-6 md:mt-0">
          <button 
            onClick={onPrev}
            className="bg-gray-100 rounded-full p-3 hover:bg-primary-50 hover:text-primary-600 transition-colors"
            aria-label="Previous testimonial"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={onNext}
            className="bg-gray-100 rounded-full p-3 hover:bg-primary-50 hover:text-primary-600 transition-colors"
            aria-label="Next testimonial"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

const Testimonials: React.FC = () => {
  const testimonials = [
    {
      quote: "IKIMINA has transformed how our village savings group operates. No more cash handling issues, and everyone gets notified automatically about contributions and meetings.",
      author: "Jean Bosco Mugabo",
      role: "Group Leader",
      group: "Kigali Youth Savers",
      image: "" // In a real app, this would be a proper image path
    },
    {
      quote: "As a cooperative leader, the compliance tracking feature has saved us countless hours of paperwork. We can focus on helping our members instead of administrative tasks.",
      author: "Marie Claire Uwamahoro",
      role: "Treasurer",
      group: "Women's Empowerment SACCO",
      image: ""
    },
    {
      quote: "The loan approval process is transparent and fair. Everyone can see the group's finances and vote on loan applications. It's built trust in our community.",
      author: "Emmanuel Ndayisaba",
      role: "Member",
      group: "Muhanga Farmers Group",
      image: ""
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const nextTestimonial = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };

  const prevTestimonial = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      nextTestimonial();
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-24 px-4 bg-green-50 relative">
      {/* Imigongo-inspired pattern background */}
      <div className="absolute top-0 left-0 w-full h-full rwandan-pattern-bg opacity-10" aria-hidden="true"></div>
      
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="text-center mb-16">
          <span className="inline-block py-1 px-3 rounded-full bg-primary-100 text-primary-700 font-medium text-sm mb-4">
            TESTIMONIALS
          </span>
          <h2 className="section-title">What Our Users Say</h2>
          <p className="section-subtitle">
            IKIMINA is helping thousands of Rwandans achieve their financial goals through community savings.
          </p>
        </div>
        
        <div className="relative mx-auto max-w-4xl">
          {testimonials.map((testimonial, index) => (
            <div key={index} className={index === currentIndex ? '' : 'hidden'}>
              <Testimonial 
                quote={testimonial.quote}
                author={testimonial.author}
                role={testimonial.role}
                group={testimonial.group}
                image={testimonial.image}
                isActive={index === currentIndex}
                onNext={nextTestimonial}
                onPrev={prevTestimonial}
              />
            </div>
          ))}
          
          {/* Mobile navigation controls */}
          <div className="flex justify-center mt-8 md:hidden gap-2">
            <button 
              onClick={prevTestimonial}
              className="bg-white rounded-full p-3 shadow-sm hover:bg-primary-50 hover:text-primary-600 transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="flex justify-center items-center gap-2 mx-4">
              {testimonials.map((_, index) => (
                <button 
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300
                    ${index === currentIndex ? 'bg-primary-600 scale-125' : 'bg-gray-300 hover:bg-gray-400'}`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
            
            <button 
              onClick={nextTestimonial}
              className="bg-white rounded-full p-3 shadow-sm hover:bg-primary-50 hover:text-primary-600 transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Decorative wave shape at bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" className="w-full h-auto fill-white">
          <path d="M0,64L60,69.3C120,75,240,85,360,80C480,75,600,53,720,48C840,43,960,53,1080,58.7C1200,64,1320,64,1380,64L1440,64L1440,100L1380,100C1320,100,1200,100,1080,100C960,100,840,100,720,100C600,100,480,100,360,100C240,100,120,100,60,100L0,100Z"></path>
        </svg>
      </div>
    </section>
  );
};

export default Testimonials; 