import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { ArrowRight } from 'lucide-react';

const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      number: 1,
      title: 'Create or Join an IKIMINA',
      description: 'Start your own digital savings group or join an existing one. Invite friends, family, or colleagues to join your community of savers.'
    },
    {
      number: 2,
      title: 'Set Contribution Rules',
      description: 'Define how much each member contributes and how often. Set clear terms for savings, loans, and payouts that work for everyone.'
    },
    {
      number: 3,
      title: 'Make Regular Contributions',
      description: 'Easily contribute your share via MTN Mobile Money or Airtel Money with just a few taps. Get reminders before each due date.'
    },
    {
      number: 4,
      title: 'Watch Your Savings Grow',
      description: 'Track your contributions, group savings, and see your financial progress over time with clear visualizations.'
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block py-1 px-3 rounded-full bg-primary-100 text-primary-700 font-medium text-sm mb-4">
            HOW IT WORKS
          </span>
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">Simple Steps to Financial Growth</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            IKIMINA brings traditional community savings into the digital age with a simple, transparent process
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {steps.map((step) => (
            <div key={step.number} className="relative">
              {/* Step number */}
              <div className="absolute -top-6 left-0 right-0 flex justify-center">
                <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-xl">
                  {step.number}
                </div>
              </div>
              
              {/* Content */}
              <div className="bg-white rounded-lg shadow-md p-6 pt-10 h-full border border-gray-100">
                <h3 className="font-bold text-lg mb-3 text-center">{step.title}</h3>
                <p className="text-gray-600 text-center">{step.description}</p>
              </div>
              
              {/* Connector (hide on last item and on mobile) */}
              {step.number < steps.length && (
                <div className="hidden lg:block absolute top-1/3 -right-4 transform translate-x-1/2">
                  <ArrowRight className="h-6 w-6 text-primary-300" />
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <Link to="/register">
            <Button size="lg" className="bg-primary-600 hover:bg-primary-700 text-white">
              Start Your Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection; 