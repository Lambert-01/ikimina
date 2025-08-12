import React from 'react';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import HowItWorksSection from './HowItWorksSection';
import Footer from './Footer';
import Testimonials from './Testimonials';
import Partners from './Partners';
import PlatformStats from './PlatformStats';
import AppScreenshots from './AppScreenshots';
import DownloadSection from './DownloadSection';
import CTASection from './CTASection';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <PlatformStats />
        <Testimonials />
        <AppScreenshots />
        <Partners />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage; 