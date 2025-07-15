import React, { useEffect } from 'react';
import Navbar from '../components/homepage/Navbar';
import HeroSection from '../components/homepage/HeroSection';
import FeaturesSection from '../components/homepage/FeaturesSection';
import PlatformStats from '../components/homepage/PlatformStats';
import HowItWorksSection from '../components/homepage/HowItWorksSection';
import Partners from '../components/homepage/Partners';
import Testimonials from '../components/homepage/Testimonials';
import AppScreenshots from '../components/homepage/AppScreenshots';
import Footer from '../components/homepage/Footer';

const HomePage: React.FC = () => {
  // Scroll to section when navigating via anchor links
  useEffect(() => {
    // Wait for page to load completely
    window.addEventListener('load', () => {
      // Check for hash in URL
      if (window.location.hash) {
        // Find element by id (without the # symbol)
        const id = window.location.hash.substring(1);
        const element = document.getElementById(id);
        if (element) {
          // Wait for animations to complete
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      }
    });

    // Handle smooth scrolling for all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e: Event) => {
        e.preventDefault();
        const link = e.currentTarget as HTMLAnchorElement;
        const href = link.getAttribute('href');
        const id = href?.substring(1);
        if (id) {
          const element = document.getElementById(id);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            // Update URL without reloading the page
            window.history.pushState(null, '', `#${id}`);
          }
        }
      });
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow">
        <HeroSection />
        
        <div id="features">
          <FeaturesSection />
        </div>
        
        <PlatformStats />
        
        <div id="how-it-works">
          <HowItWorksSection />
        </div>
        
        <AppScreenshots />
        
        <Testimonials />
        
        <div id="partners">
          <Partners />
        </div>
      </main>
      
      <Footer />
      
      {/* Back to top button */}
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-5 right-5 bg-primary-500 text-white p-3 rounded-full shadow-lg hover:bg-primary-600 transition-colors z-50"
        aria-label="Back to top"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="18 15 12 9 6 15"></polyline>
        </svg>
      </button>
    </div>
  );
};

export default HomePage; 