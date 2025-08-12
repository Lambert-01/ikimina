import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Smartphone, 
  Mail, 
  MapPin, 
  Phone, 
  Shield, 
  FileText, 
  HelpCircle,
  Download
} from 'lucide-react';

// Data URIs for fallback images
const MTN_LOGO = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDgwIDMyIj48cmVjdCB3aWR0aD0iODAiIGhlaWdodD0iMzIiIGZpbGw9IiNmZmNjMDAiLz48dGV4dCB4PSI0MCIgeT0iMTgiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzAwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+TVROIExvZ288L3RleHQ+PC9zdmc+";
const AIRTEL_LOGO = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDgwIDMyIj48cmVjdCB3aWR0aD0iODAiIGhlaWdodD0iMzIiIGZpbGw9IiNlNjAwMTIiLz48dGV4dCB4PSI0MCIgeT0iMTgiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+QWlydGVsPC90ZXh0Pjwvc3ZnPg==";
const BOK_LOGO = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDgwIDMyIj48cmVjdCB3aWR0aD0iODAiIGhlaWdodD0iMzIiIGZpbGw9IiMwMDRhODAiLz48dGV4dCB4PSI0MCIgeT0iMTgiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+Qm9LPC90ZXh0Pjwvc3ZnPg==";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-6">
              <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center">
                <span className="text-xl font-bold text-white">IK</span>
              </div>
              <span className="ml-2 text-xl font-bold">IKIMINA</span>
            </div>
            <p className="text-gray-400 mb-6">
              Digitizing traditional savings groups for a more inclusive financial future in Rwanda and beyond.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary-500"
              >
                <Facebook size={20} />
                <span className="sr-only">Facebook</span>
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary-500"
              >
                <Twitter size={20} />
                <span className="sr-only">Twitter</span>
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary-500"
              >
                <Instagram size={20} />
                <span className="sr-only">Instagram</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-400 hover:text-primary-500 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="#how-it-works" className="text-gray-400 hover:text-primary-500 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/create-group" className="text-gray-400 hover:text-primary-500 transition-colors">
                  Create a Group
                </Link>
              </li>
              <li>
                <Link to="/join-group" className="text-gray-400 hover:text-primary-500 transition-colors">
                  Join a Group
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-primary-500 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-primary-500 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Legal & Support</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/privacy-policy" className="text-gray-400 hover:text-primary-500 transition-colors flex items-center">
                  <Shield size={16} className="mr-2" />
                  <span>Privacy Policy (Law Nº 058/2021)</span>
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-400 hover:text-primary-500 transition-colors flex items-center">
                  <FileText size={16} className="mr-2" />
                  <span>Terms of Service</span>
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-gray-400 hover:text-primary-500 transition-colors flex items-center">
                  <HelpCircle size={16} className="mr-2" />
                  <span>Contact Support</span>
                </Link>
              </li>
              <li>
                <Link to="/download" className="text-gray-400 hover:text-primary-500 transition-colors flex items-center">
                  <Download size={16} className="mr-2" />
                  <span>Download Mobile App</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin size={20} className="text-primary-500 mr-3 mt-1 flex-shrink-0" />
                <span className="text-gray-400">Kigali Heights, KG 7 Ave, Kigali, Rwanda</span>
              </li>
              <li className="flex items-center">
                <Phone size={20} className="text-primary-500 mr-3 flex-shrink-0" />
                <span className="text-gray-400">+250 788 123 456</span>
              </li>
              <li className="flex items-center">
                <Mail size={20} className="text-primary-500 mr-3 flex-shrink-0" />
                <a href="mailto:info@ikimina.rw" className="text-gray-400 hover:text-primary-500">
                  info@ikimina.rw
                </a>
              </li>
              <li className="flex items-center">
                <Smartphone size={20} className="text-primary-500 mr-3 flex-shrink-0" />
                <span className="text-gray-400">USSD: *182*4#</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800 py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} Ikimina. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0">
              <div className="flex items-center space-x-4">
                <img 
                  src="/images/mtn-mobile-money.png" 
                  alt="MTN Mobile Money" 
                  className="h-8"
                  onError={(e) => {
                    e.currentTarget.src = MTN_LOGO;
                  }}
                />
                <img 
                  src="/images/airtel-money.png" 
                  alt="Airtel Money" 
                  className="h-8"
                  onError={(e) => {
                    e.currentTarget.src = AIRTEL_LOGO;
                  }}
                />
                <img 
                  src="/images/bank-of-kigali.png" 
                  alt="Bank of Kigali" 
                  className="h-8"
                  onError={(e) => {
                    e.currentTarget.src = BOK_LOGO;
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 