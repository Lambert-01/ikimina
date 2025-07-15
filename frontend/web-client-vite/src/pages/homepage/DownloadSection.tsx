import React from 'react';
import { Smartphone, Download, MessageSquare } from 'lucide-react';

const DownloadSection: React.FC = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Access Ikimina Anywhere</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Use Ikimina on any device or through USSD for areas with limited connectivity
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Mobile App */}
          <div className={`rounded-xl p-6 text-center ${
            'bg-gradient-to-br from-primary-50 to-blue-50 border border-primary-100'
          }`}>
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 text-primary-600 mb-6">
              <Smartphone size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Mobile App</h3>
            <p className="text-gray-600 mb-6">
              Download our mobile app for the best experience with offline capabilities
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-3">
              <a 
                href="#" 
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.9,2.1c-4.6,0.5-8.3,4.2-8.8,8.7c-0.5,4.7,2.2,8.9,6.3,10.5C8.7,21.4,9,21.2,9,20.8v-1.6c0,0-0.4,0.1-0.9,0.1 c-1.4,0-2-1.2-2.1-1.9c-0.1-0.4-0.3-0.7-0.6-1C5.1,16.3,5,16.3,5,16.2C5,16,5.3,16,5.4,16c0.6,0,1.1,0.7,1.3,1c0.5,0.8,1.1,1,1.4,1 c0.4,0,0.7-0.1,0.9-0.2c0.1-0.7,0.4-1.4,1-1.8c-2.3-0.5-4-1.8-4-4c0-1.1,0.5-2.2,1.2-3C7.1,8.8,7,8.3,7,7.6C7,7.2,7,6.6,7.3,6 c0,0,1.4,0,2.8,1.3C10.6,7.1,11.3,7,12,7s1.4,0.1,2,0.3C15.3,6,16.8,6,16.8,6C17,6.6,17,7.2,17,7.6c0,0.8-0.1,1.2-0.2,1.4 c0.7,0.8,1.2,1.8,1.2,3c0,2.2-1.7,3.5-4,4c0.6,0.5,1,1.4,1,2.3v2.6c0,0.3,0.3,0.6,0.7,0.5c3.7-1.5,6.3-5.1,6.3-9.3 C22,6.1,16.9,1.4,10.9,2.1z" />
                </svg>
                Google Play
              </a>
              <a 
                href="#" 
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.5,12.2c-0.3-0.8-1.1-1.4-1.9-1.4c-0.1,0-0.2,0-0.3,0c-0.2,0-0.5-0.1-0.7-0.2c-0.2-0.1-0.4-0.3-0.6-0.5 c-0.2-0.2-0.3-0.4-0.4-0.6c-0.1-0.2-0.1-0.5-0.1-0.7c0-0.3,0.1-0.5,0.2-0.8c0.1-0.2,0.3-0.4,0.5-0.6c0.2-0.2,0.4-0.3,0.7-0.4 c0.3-0.1,0.5-0.1,0.8-0.1c0.1,0,0.2,0,0.3,0c0.8-0.1,1.6-0.6,1.9-1.4c0.3-0.8,0.2-1.7-0.4-2.4c-0.4-0.4-0.9-0.7-1.5-0.9 c-0.6-0.2-1.2-0.2-1.8,0C14.1,2.5,13.5,3,13,3.6L7,12.4c-0.5,0.7-0.7,1.6-0.4,2.4c0.3,0.8,1.1,1.4,1.9,1.4c0.1,0,0.2,0,0.3,0 c0.3,0,0.5,0.1,0.8,0.2c0.2,0.1,0.5,0.3,0.6,0.5c0.2,0.2,0.3,0.4,0.4,0.6c0.1,0.2,0.1,0.5,0.1,0.7c0,0.3-0.1,0.5-0.2,0.8 c-0.1,0.2-0.3,0.5-0.5,0.6c-0.2,0.2-0.4,0.3-0.7,0.4c-0.3,0.1-0.5,0.1-0.8,0.1c-0.1,0-0.2,0-0.3,0c-0.8,0.1-1.6,0.6-1.9,1.4 c-0.3,0.8-0.2,1.7,0.4,2.4c0.4,0.4,0.9,0.7,1.5,0.9c0.3,0.1,0.6,0.1,0.9,0.1c0.3,0,0.6,0,0.9-0.1c0.6-0.2,1.1-0.5,1.5-0.9L17,12.4 C17.6,11.9,17.8,11,17.5,12.2z" />
                </svg>
                App Store
              </a>
            </div>
          </div>
          
          {/* USSD Access */}
          <div className={`rounded-xl p-6 text-center ${
            'bg-gradient-to-br from-green-50 to-teal-50 border border-green-100'
          }`}>
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-600 mb-6">
              <MessageSquare size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">USSD Access</h3>
            <p className="text-gray-600 mb-6">
              Access Ikimina from any phone using our USSD code - perfect for areas with limited connectivity
            </p>
            <div className="inline-block px-6 py-4 bg-white rounded-lg shadow-sm border border-gray-200">
              <span className="text-2xl font-mono font-bold text-gray-800">*182*4#</span>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              Available on MTN and Airtel networks
            </p>
          </div>
          
          {/* Web Platform */}
          <div className={`rounded-xl p-6 text-center ${
            'bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100'
          }`}>
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-purple-100 text-purple-600 mb-6">
              <Download size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Web Platform</h3>
            <p className="text-gray-600 mb-6">
              Use our progressive web app on any device with a browser - no installation required
            </p>
            <button 
              className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
            >
              <Download className="h-5 w-5 mr-2" />
              Install Web App
            </button>
            <p className="mt-4 text-sm text-gray-500">
              Works offline after first visit
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DownloadSection; 