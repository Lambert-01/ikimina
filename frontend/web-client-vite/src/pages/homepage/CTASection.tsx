import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/button';

const CTASection: React.FC = () => {
  return (
    <section className="bg-primary-600 py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:flex lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Ready to transform your savings group?
            </h2>
            <p className="mt-3 text-lg text-primary-100 max-w-md">
              Join thousands of Rwandans who are already using Ikimina to manage their community savings groups.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
              <Link to="/register">
                <Button size="lg" className="bg-white text-primary-600 hover:bg-primary-50 w-full sm:w-auto">
                  Create Your Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-primary-700 w-full sm:w-auto">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
          <div className="mt-10 lg:mt-0 lg:ml-8 lg:flex-shrink-0">
            <div className="relative overflow-hidden rounded-lg shadow-lg">
              <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg p-6 sm:p-8 rounded-lg">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-white mb-2">Start for free</h3>
                  <p className="text-primary-100 mb-6">No credit card required</p>
                  <div className="flex flex-col space-y-4">
                    {[
                      'Create or join a group in minutes',
                      'Track contributions and loans',
                      'Secure mobile money integration',
                      'Multilingual support'
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <svg className="h-5 w-5 text-primary-300" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="ml-2 text-white">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection; 