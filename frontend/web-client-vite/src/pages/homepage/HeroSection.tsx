import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { ArrowRight } from 'lucide-react';

const HeroSection: React.FC = () => {
  return (
    <div className="relative bg-gradient-to-r from-primary-50 to-blue-50 overflow-hidden">
      {/* Background pattern */}
      <div className="hidden lg:block lg:absolute lg:inset-0">
        <svg
          className="absolute left-0 top-0 h-full w-full text-gray-100 opacity-30"
          fill="none"
          viewBox="0 0 800 800"
        >
          <defs>
            <pattern
              id="e813992c-7d03-4cc4-a2bd-151760b470a0"
              x="0"
              y="0"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <rect x="0" y="0" width="4" height="4" className="text-primary-100" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="800" height="800" fill="url(#e813992c-7d03-4cc4-a2bd-151760b470a0)" />
        </svg>
      </div>
      
      <div className="relative pt-16 pb-20 sm:pt-24 sm:pb-24 lg:pt-32 lg:pb-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <h1>
                <span className="block text-sm font-semibold uppercase tracking-wide text-primary-600">
                  Welcome to Ikimina
                </span>
                <span className="mt-1 block text-4xl tracking-tight font-extrabold sm:text-5xl xl:text-6xl">
                  <span className="block text-gray-900">Save Together.</span>
                  <span className="block text-primary-600">Grow Together.</span>
                </span>
              </h1>
              <p className="mt-3 text-base text-gray-600 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                Digitize Your Ikimina Group Today. Join thousands of Rwandans who are transforming traditional savings circles into secure, transparent, and accessible digital groups.
              </p>
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                <div className="flex flex-col sm:flex-row sm:justify-center lg:justify-start gap-4">
                  <Link to="/register">
                    <Button size="lg" className="bg-primary-600 hover:bg-primary-700 text-white">
                      Get Started
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="#how-it-works">
                    <Button size="lg" variant="outline" className="border-primary-600 text-primary-600 hover:bg-primary-50">
                      Learn How It Works
                    </Button>
                  </Link>
                </div>
                <p className="mt-3 text-sm text-gray-500">
                  No credit card required. Start saving in minutes.
                </p>
              </div>
            </div>
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              <div className="relative mx-auto w-full rounded-lg shadow-lg lg:max-w-md">
                <div className="relative block w-full bg-white rounded-lg overflow-hidden">
                  {/* Replace the image with a simple div placeholder */}
                  <div 
                    className="w-full aspect-[4/3] bg-gradient-to-r from-primary-100 to-primary-200 flex items-center justify-center"
                  >
                    <div className="text-center p-6">
                      <div className="h-20 w-20 bg-primary-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-primary-700 font-medium">Ikimina Savings Group</p>
                    </div>
                  </div>
                  <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                    <svg className="h-20 w-20 text-primary-500" fill="currentColor" viewBox="0 0 84 84">
                      <circle opacity="0.9" cx="42" cy="42" r="42" fill="white" />
                      <path d="M55.5039 40.3359L37.1094 28.0729C35.7803 27.1869 34 28.1396 34 29.737V54.263C34 55.8604 35.7803 56.8131 37.1094 55.9271L55.5038 43.6641C56.6913 42.8725 56.6913 41.1275 55.5039 40.3359Z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Curved divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-lg font-medium text-gray-900">Trusted by communities across Rwanda</span>
        </div>
      </div>
    </div>
  );
};

export default HeroSection; 