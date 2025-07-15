import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Smartphone } from 'lucide-react';

interface ScreenshotProps {
  title: string;
  description: string;
  iconType: 'dashboard' | 'payment' | 'loan';
  isActive?: boolean;
}

const Screenshot: React.FC<ScreenshotProps> = ({ title, description, iconType, isActive = true }) => {
  // Render different SVG content based on the icon type
  const renderIconContent = () => {
    switch (iconType) {
      case 'dashboard':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        );
      case 'payment':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        );
      case 'loan':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return <Smartphone className="h-8 w-8 text-primary-500" />;
    }
  };

  return (
    <div className={`flex flex-col items-center transition-all duration-500 ${isActive ? 'opacity-100 transform-none' : 'opacity-0 scale-95 absolute'}`}>
      <div className="relative group">
        {/* Phone frame */}
        <div className="bg-gray-900 rounded-[40px] p-3 shadow-xl w-full max-w-[280px] aspect-[9/19] overflow-hidden relative">
          {/* Screen bezel */}
          <div className="bg-black h-full w-full rounded-[32px] flex flex-col relative overflow-hidden">
            {/* Notch */}
            <div className="absolute top-0 left-0 right-0 h-7 flex justify-center items-start z-10">
              <div className="w-32 h-7 bg-black rounded-b-2xl flex items-center justify-center">
                <div className="w-16 h-1 bg-gray-800 rounded-full mt-1"></div>
              </div>
            </div>
            
            {/* Status bar */}
            <div className="bg-primary-700 h-10 w-full flex items-center justify-between px-6 pt-3">
              <div className="text-white text-xs">9:41 AM</div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full border border-white"></div>
                <div className="w-3 h-3 rounded-full border border-white"></div>
                <div className="w-3 h-3 rounded-full bg-white"></div>
              </div>
            </div>
            
            {/* App content */}
            <div className="flex-1 flex flex-col bg-gray-100">
              {/* Header */}
              <div className="bg-primary-600 text-white py-4 px-4">
                <div className="h-3 w-24 bg-white bg-opacity-30 rounded-full mb-2"></div>
                <div className="flex justify-between items-center">
                  <div className="h-5 w-32 bg-white rounded-md"></div>
                  <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center">
                    <div className="h-4 w-4 rounded-full bg-white"></div>
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-4 flex-1">
                <div className="bg-white rounded-xl shadow-sm p-4 mb-3">
                  <div className="h-3 w-3/4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 w-1/2 bg-primary-500 rounded mb-2"></div>
                  <div className="h-3 w-full bg-gray-200 rounded"></div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm p-4">
                  <div className="flex justify-between items-center mb-3">
                    <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
                    <div className="h-3 w-6 bg-secondary-500 rounded"></div>
                  </div>
                  <div className="h-20 w-full bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
                    {renderIconContent()}
                  </div>
                </div>
              </div>
              
              {/* Bottom nav */}
              <div className="bg-white border-t border-gray-200 p-2 flex justify-around">
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <div className="h-5 w-5 bg-primary-500 rounded-sm"></div>
                </div>
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <div className="h-5 w-5 bg-gray-300 rounded-sm"></div>
                </div>
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <div className="h-5 w-5 bg-gray-300 rounded-sm"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Reflection effect */}
        <div className="absolute inset-0 rounded-[40px] bg-gradient-to-br from-white to-transparent opacity-10 pointer-events-none"></div>
        
        {/* Highlight on hover */}
        <div className="absolute inset-0 rounded-[40px] bg-primary-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
      </div>
      
      <div className="mt-6 text-center">
        <h3 className="font-bold text-lg mb-1">{title}</h3>
        <p className="text-gray-600 text-sm max-w-xs">{description}</p>
      </div>
    </div>
  );
};

const AppScreenshots: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const screenshots = [
    {
      title: "Group Dashboard",
      description: "Track group savings, loans, and upcoming meetings at a glance",
      iconType: 'dashboard'
    },
    {
      title: "Mobile Payments",
      description: "Make contributions easily via MTN or Airtel Money",
      iconType: 'payment'
    },
    {
      title: "Loan Management",
      description: "Apply for loans and track repayments in one place",
      iconType: 'loan'
    }
  ];

  const nextScreenshot = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % screenshots.length);
  };

  const prevScreenshot = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + screenshots.length) % screenshots.length);
  };

  return (
    <section className="py-24 px-4 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary-50 rounded-bl-full -z-10"></div>
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-secondary-50 rounded-tr-full -z-10"></div>
      
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <span className="inline-block py-1 px-3 rounded-full bg-accent-100 text-accent-700 font-medium text-sm mb-4">
            MOBILE EXPERIENCE
          </span>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">IKIMINA Mobile Experience</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our mobile-first platform works seamlessly on any device, bringing the power of digital financial management to your fingertips.
          </p>
        </div>
        
        <div className="relative">
          {/* Desktop View - All screenshots side by side */}
          <div className="hidden md:grid md:grid-cols-3 gap-6">
            {screenshots.map((screenshot, index) => (
              <Screenshot
                key={index}
                title={screenshot.title}
                description={screenshot.description}
                iconType={screenshot.iconType as 'dashboard' | 'payment' | 'loan'}
              />
            ))}
          </div>
          
          {/* Mobile View - Carousel */}
          <div className="md:hidden relative h-[560px]">
            {screenshots.map((screenshot, index) => (
              <div key={index} className={`absolute inset-0 flex justify-center ${index === currentIndex ? '' : 'hidden'}`}>
                <Screenshot
                  title={screenshot.title}
                  description={screenshot.description}
                  iconType={screenshot.iconType as 'dashboard' | 'payment' | 'loan'}
                  isActive={index === currentIndex}
                />
              </div>
            ))}
            
            {/* Mobile controls */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-2 pb-4">
              {screenshots.map((_, index) => (
                <button 
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300
                    ${index === currentIndex ? 'bg-primary-600 scale-125' : 'bg-gray-300 hover:bg-gray-400'}`}
                  aria-label={`Go to screenshot ${index + 1}`}
                />
              ))}
            </div>
            
            {/* Navigation buttons */}
            <button 
              onClick={prevScreenshot}
              className="absolute top-1/2 -translate-y-1/2 left-0 bg-white rounded-full p-2 shadow-md hover:bg-primary-50 hover:text-primary-600 transition-colors"
              aria-label="Previous screenshot"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={nextScreenshot}
              className="absolute top-1/2 -translate-y-1/2 right-0 bg-white rounded-full p-2 shadow-md hover:bg-primary-50 hover:text-primary-600 transition-colors"
              aria-label="Next screenshot"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-6">
            Available on both Android and iOS devices
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="#" className="bg-black text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.21 2.33-.91 3.57-.84 1.5.09 2.63.68 3.35 1.76-2.92 1.85-2.46 5.96.51 7.33-.62 1.61-1.33 3.18-2.51 3.92zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.32 4.5-3.74 4.25z"/>
              </svg>
              <div className="text-left">
                <div className="text-xs">Download on the</div>
                <div className="font-bold">App Store</div>
              </div>
            </a>
            <a href="#" className="bg-black text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.5 20.5v-17c0-.84.65-1.5 1.5-1.5h.5v2h-.5v17h.5v2h-.5c-.85 0-1.5-.66-1.5-1.5zm16.5 1.5v-2h.5v-17H20v-2h.5c.85 0 1.5.66 1.5 1.5v17c0 .84-.65 1.5-1.5 1.5h-.5zM6.5 3v18l11-9-11-9z"/>
              </svg>
              <div className="text-left">
                <div className="text-xs">GET IT ON</div>
                <div className="font-bold">Google Play</div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppScreenshots; 