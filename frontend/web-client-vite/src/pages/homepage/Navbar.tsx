import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Globe, ChevronDown } from 'lucide-react';
import { Button } from '../../components/ui/button';

interface Language {
  code: string;
  name: string;
  flag: string;
}

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>({
    code: 'en',
    name: 'English',
    flag: '🇬🇧'
  });

  const languages: Language[] = [
    { code: 'rw', name: 'Kinyarwanda', flag: '🇷🇼' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLanguageChange = (language: Language) => {
    setSelectedLanguage(language);
    setShowLanguageDropdown(false);
    // In a real app, this would change the app's language
    // For demo purposes, we'll just log it
    console.log(`Language changed to: ${language.name}`);
  };

  const handleNavigation = (path: string, isAnchor = false) => {
    if (isAnchor) {
      // Handle anchor navigation
      const element = document.getElementById(path.replace('#', ''));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Handle regular navigation
      navigate(path);
    }
    // Close mobile menu if open
    if (isOpen) {
      setIsOpen(false);
    }
  };

  return (
    <nav 
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled ? 'bg-white shadow-md' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center">
                <span className="text-xl font-bold text-white">IK</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">IKIMINA</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:justify-between md:flex-1 md:ml-10">
            <div className="flex space-x-8">
              <Link to="/" className="text-base font-medium text-gray-900 hover:text-primary-600">
                Home
              </Link>
              <button 
                onClick={() => handleNavigation('#how-it-works', true)} 
                className="text-base font-medium text-gray-900 hover:text-primary-600"
              >
                How It Works
              </button>
              <button 
                onClick={() => handleNavigation('/login')} 
                className="text-base font-medium text-gray-900 hover:text-primary-600"
              >
                Create or Join a Group
              </button>
            </div>
            <div className="flex items-center space-x-6">
              {/* Language Selector */}
              <div className="relative">
                <button 
                  className="flex items-center text-base font-medium text-gray-900 hover:text-primary-600"
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                >
                  <Globe className="h-5 w-5 mr-1" />
                  <span className="mr-1">{selectedLanguage.flag}</span>
                  <span className="hidden sm:inline">{selectedLanguage.name}</span>
                  <ChevronDown className="h-4 w-4 ml-1" />
                </button>
                
                {showLanguageDropdown && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                      {languages.map((language) => (
                        <button
                          key={language.code}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                            selectedLanguage.code === language.code ? 'bg-gray-100' : ''
                          }`}
                          onClick={() => handleLanguageChange(language)}
                        >
                          <span className="mr-2">{language.flag}</span>
                          {language.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Authentication Links */}
              <Button 
                variant="outline" 
                className="text-primary-600 border-primary-600"
                onClick={() => handleNavigation('/login')}
              >
                Login
              </Button>
              <Button 
                className="bg-primary-600 hover:bg-primary-700 text-white"
                onClick={() => handleNavigation('/register')}
              >
                Register
              </Button>
            </div>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              onClick={() => setIsOpen(!isOpen)}
            >
              <span className="sr-only">{isOpen ? 'Close menu' : 'Open menu'}</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <button 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-100 w-full text-left"
              onClick={() => handleNavigation('/')}
            >
              Home
            </button>
            <button 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-100 w-full text-left"
              onClick={() => handleNavigation('#how-it-works', true)}
            >
              How It Works
            </button>
            <button 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-100 w-full text-left"
              onClick={() => handleNavigation('/login')}
            >
              Create or Join a Group
            </button>
          </div>
          
          {/* Language Selector (Mobile) */}
          <div className="px-5 py-3 border-t border-gray-200">
            <div className="flex items-center">
              <Globe className="h-5 w-5 mr-2 text-gray-500" />
              <span className="text-sm font-medium text-gray-900">Language</span>
            </div>
            <div className="mt-2 space-y-1">
              {languages.map((language) => (
                <button
                  key={language.code}
                  className={`w-full flex items-center px-2 py-2 text-sm rounded-md ${
                    selectedLanguage.code === language.code ? 'bg-gray-100' : ''
                  }`}
                  onClick={() => handleLanguageChange(language)}
                >
                  <span className="mr-2">{language.flag}</span>
                  {language.name}
                </button>
              ))}
            </div>
          </div>
          
          {/* Authentication Links (Mobile) */}
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-5">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-primary-700 font-bold">IK</span>
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">Ikimina User</div>
                <div className="text-sm font-medium text-gray-500">Join our community</div>
              </div>
            </div>
            <div className="mt-3 px-2 space-y-1">
              <Button 
                variant="outline"
                className="w-full justify-center border-primary-600 text-primary-600"
                onClick={() => handleNavigation('/login')}
              >
                Login
              </Button>
              <Button 
                className="w-full justify-center bg-primary-600 text-white hover:bg-primary-700"
                onClick={() => handleNavigation('/register')}
              >
                Register
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 