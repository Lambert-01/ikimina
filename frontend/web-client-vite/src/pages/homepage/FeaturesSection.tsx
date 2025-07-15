import React from 'react';
import { Users, CreditCard, ClipboardCheck } from 'lucide-react';

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
}

const Feature: React.FC<FeatureProps> = ({ icon, title, description, delay = 0 }) => {
  return (
    <div 
      className="feature-card hover:border-primary-500 border-2 border-transparent"
      style={{ animationDelay: `${delay}ms` }}
      data-aos="fade-up"
      data-aos-delay={delay}
    >
      <div className="bg-primary-100 text-primary-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6 mx-auto md:mx-0">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-center md:text-left">{title}</h3>
      <p className="text-gray-600 text-center md:text-left">{description}</p>
      <div className="mt-6 h-1.5 w-12 bg-secondary-500 rounded-full mx-auto md:mx-0"></div>
    </div>
  );
};

const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: <Users size={28} strokeWidth={2} />,
      title: "Group Creation & Management",
      description: "Create or join savings groups, set contribution amounts and schedules, track member activity, and manage group rules digitally.",
      delay: 0
    },
    {
      icon: <CreditCard size={28} strokeWidth={2} />,
      title: "Mobile Payments Integration",
      description: "Seamlessly connect with MTN Mobile Money and Airtel Money for easy contributions and loan disbursements without handling cash.",
      delay: 200
    },
    {
      icon: <ClipboardCheck size={28} strokeWidth={2} />,
      title: "Digital Compliance Tracking",
      description: "Automatically track regulatory compliance for SACCOs and cooperatives with built-in reporting and documentation tools.",
      delay: 400
    }
  ];

  return (
    <section className="py-24 px-4 bg-white relative overflow-hidden">
      {/* Rwandan-inspired pattern background */}
      <div className="absolute inset-0 rwandan-pattern-bg" aria-hidden="true"></div>
      
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="text-center mb-16">
          <span className="inline-block py-1 px-3 rounded-full bg-primary-100 text-primary-700 font-medium text-sm mb-4">
            KEY FEATURES
          </span>
          <h2 className="section-title">Features Built for Rwandan Communities</h2>
          <p className="section-subtitle">
            Our platform combines traditional savings practices with modern technology to create a powerful tool for community financial empowerment.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Feature 
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={feature.delay}
            />
          ))}
        </div>
        
        <div className="mt-20 text-center">
          <a 
            href="#how-it-works" 
            className="inline-flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700 transition-colors"
          >
            <span>Learn how it works</span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="animate-bounce"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <polyline points="19 12 12 19 5 12"></polyline>
            </svg>
          </a>
        </div>
      </div>
      
      {/* Subtle diagonal divider */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-br from-white via-gray-50 to-gray-100"></div>
    </section>
  );
};

export default FeaturesSection; 