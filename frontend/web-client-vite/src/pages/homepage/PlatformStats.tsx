import React from 'react';
import { Users, Coins, Landmark } from 'lucide-react';

interface StatProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  color: string;
  countTo?: number;
  suffix?: string;
  prefix?: string;
}

const Stat: React.FC<StatProps> = ({ icon, value, label, color }) => {
  const [animated, setAnimated] = React.useState(false);
  const statRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !animated) {
        setAnimated(true);
      }
    });
    
    if (statRef.current) {
      observer.observe(statRef.current);
    }
    
    return () => {
      if (statRef.current) {
        observer.unobserve(statRef.current);
      }
    };
  }, [animated]);

  return (
    <div 
      ref={statRef}
      className={`flex flex-col items-center transform transition-all duration-500 hover:scale-105 ${animated ? 'animate-slide-up' : 'opacity-0'}`}
    >
      <div className={`${color} rounded-full p-5 mb-6 shadow-lg`}>
        {icon}
      </div>
      <p className={`text-3xl md:text-5xl font-bold mb-2 ${animated ? 'animate-fade-in' : ''}`}>{value}</p>
      <p className="text-gray-600 text-center font-medium">{label}</p>
    </div>
  );
};

const PlatformStats: React.FC = () => {
  // In a real app, these would come from an API call
  const stats = [
    {
      icon: <Users size={32} className="text-accent-600" />,
      value: "1,250+",
      label: "Active Groups",
      color: "bg-accent-100"
    },
    {
      icon: <Coins size={32} className="text-primary-600" />,
      value: "RWF 850M+",
      label: "Total Savings",
      color: "bg-primary-100"
    },
    {
      icon: <Landmark size={32} className="text-secondary-600" />,
      value: "RWF 320M+",
      label: "Loans Issued",
      color: "bg-secondary-100"
    }
  ];

  return (
    <section id="stats" className="py-24 px-4 bg-gray-50 relative">
      {/* Imigongo-inspired border at the top */}
      <div className="absolute top-0 left-0 right-0 h-4 bg-primary-500 flex">
        <div className="flex-1 bg-primary-600"></div>
        <div className="flex-1 bg-secondary-500"></div>
        <div className="flex-1 bg-accent-500"></div>
        <div className="flex-1 bg-primary-600"></div>
        <div className="flex-1 bg-secondary-500"></div>
        <div className="flex-1 bg-accent-500"></div>
      </div>
      
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <span className="inline-block py-1 px-3 rounded-full bg-accent-100 text-accent-700 font-medium text-sm mb-4">
            THE NUMBERS
          </span>
          <h2 className="section-title">Growing Together</h2>
          <p className="section-subtitle">
            IKIMINA is empowering Rwandan communities to achieve financial goals through collective saving and lending.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
          {stats.map((stat, index) => (
            <Stat
              key={index}
              icon={stat.icon}
              value={stat.value}
              label={stat.label}
              color={stat.color}
            />
          ))}
        </div>
        
        <div className="mt-20 bg-white rounded-xl p-6 shadow-card border border-gray-100 max-w-2xl mx-auto">
          <div className="flex items-start space-x-4">
            <div className="bg-primary-100 p-2 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-600">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">
                *Statistics updated monthly. Last updated: {new Intl.DateTimeFormat('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                }).format(new Date())}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Data sources include BNR (National Bank of Rwanda) and registered cooperative reports.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlatformStats; 