import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Users, 
  Wallet, 
  CreditCard, 
  BarChart3, 
  FileText, 
  Smartphone, 
  Globe, 
  Lock, 
  CheckCircle2, 
  ChevronRight,
  Sun,
  Moon
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

const LandingPage: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-white'}`}>
      {/* Navigation */}
      <header className={`sticky top-0 z-50 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img 
                src="/logo.svg" 
                alt="Ikimina Logo" 
                className="h-10 w-auto"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/40x40?text=Ikimina';
                }}
              />
              <span className={`ml-2 text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Ikimina</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className={`text-sm font-medium ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>Features</a>
              <a href="#roles" className={`text-sm font-medium ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>Roles</a>
              <a href="#compliance" className={`text-sm font-medium ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>Compliance</a>
              <a href="#mobile" className={`text-sm font-medium ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>Mobile Access</a>
              <button 
                onClick={toggleDarkMode}
                className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-100 text-gray-700'}`}
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="outline" className={darkMode ? 'border-gray-600 text-white hover:bg-gray-800' : ''}>
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-primary-600 hover:bg-primary-700 text-white">
                  Register
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className={`py-16 md:py-24 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-r from-blue-50 to-indigo-50'}`}>
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10">
                <h1 className={`text-4xl md:text-5xl font-bold leading-tight mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Digitizing Rwandan Community Savings Groups
                </h1>
                <p className={`text-lg mb-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Ikimina brings traditional savings circles into the digital age with secure, 
                  transparent, and accessible financial tools for communities.
                </p>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <Link to="/register">
                    <Button className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white">
                      Get Started
                    </Button>
                  </Link>
                  <a href="#features">
                    <Button variant="outline" className={`w-full sm:w-auto ${darkMode ? 'border-gray-600 text-white hover:bg-gray-800' : ''}`}>
                      Learn More
                    </Button>
                  </a>
                </div>
              </div>
              <div className="md:w-1/2">
                <img 
                  src="/hero-image.png" 
                  alt="Ikimina Platform" 
                  className="rounded-lg shadow-xl"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/600x400?text=Ikimina+Platform';
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className={`py-16 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className={`text-3xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Advanced Platform Features</h2>
              <p className={`max-w-2xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Our platform combines traditional savings practices with modern financial technology
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <Wallet className={`h-8 w-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />,
                  title: 'Group Wallets',
                  description: 'Secure digital wallets for group savings with transparent transaction history'
                },
                {
                  icon: <CreditCard className={`h-8 w-8 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />,
                  title: 'Smart Loan Rules',
                  description: 'Customizable loan parameters with automated approval workflows'
                },
                {
                  icon: <Shield className={`h-8 w-8 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />,
                  title: 'KYC Compliance',
                  description: 'Built-in KYC workflows compliant with Rwandan regulations'
                },
                {
                  icon: <Globe className={`h-8 w-8 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />,
                  title: 'Multi-currency Support',
                  description: 'Support for RWF, USD, EUR and other currencies with real-time conversion'
                },
                {
                  icon: <FileText className={`h-8 w-8 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />,
                  title: 'Audit Logs',
                  description: 'Comprehensive audit trails for all transactions and system changes'
                },
                {
                  icon: <Smartphone className={`h-8 w-8 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />,
                  title: 'USSD & PWA Access',
                  description: 'Multiple access options for both smartphone and feature phone users'
                }
              ].map((feature, index) => (
                <Card key={index} className={`h-full ${darkMode ? 'bg-gray-700 border-gray-600' : ''}`}>
                  <CardContent className="p-6">
                    <div className="mb-4">{feature.icon}</div>
                    <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{feature.title}</h3>
                    <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Role-based Features */}
        <section id="roles" className={`py-16 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className={`text-3xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Role-Based Features</h2>
              <p className={`max-w-2xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Tailored experiences for every user role in your savings group
              </p>
            </div>
            
            <Tabs defaultValue="member" className="w-full max-w-4xl mx-auto">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="member" className={darkMode ? 'data-[state=active]:bg-primary-600 data-[state=active]:text-white' : ''}>Member</TabsTrigger>
                <TabsTrigger value="manager" className={darkMode ? 'data-[state=active]:bg-primary-600 data-[state=active]:text-white' : ''}>Manager</TabsTrigger>
                <TabsTrigger value="admin" className={darkMode ? 'data-[state=active]:bg-primary-600 data-[state=active]:text-white' : ''}>Admin</TabsTrigger>
              </TabsList>
              
              <TabsContent value="member" className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Member Features</h3>
                <ul className="space-y-3">
                  {[
                    'Personal contribution tracking and history',
                    'Loan application with customizable terms',
                    'Contribution reminders and notifications',
                    'Group activity feed and announcements',
                    'Mobile money integration for easy payments',
                    'Offline access to critical information'
                  ].map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle2 className={`h-5 w-5 mr-2 flex-shrink-0 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{feature}</span>
                    </li>
                  ))}
                </ul>
              </TabsContent>
              
              <TabsContent value="manager" className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Manager Features</h3>
                <ul className="space-y-3">
                  {[
                    'Group management dashboard with member overview',
                    'Contribution approval and tracking',
                    'Loan review and approval workflow',
                    'Group financial reports and analytics',
                    'Member communication tools',
                    'Customizable group rules and parameters'
                  ].map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle2 className={`h-5 w-5 mr-2 flex-shrink-0 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{feature}</span>
                    </li>
                  ))}
                </ul>
              </TabsContent>
              
              <TabsContent value="admin" className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Admin Features</h3>
                <ul className="space-y-3">
                  {[
                    'Platform-wide analytics and reporting',
                    'User management and access control',
                    'System configuration and customization',
                    'Compliance monitoring and reporting',
                    'White-labeling options for partners',
                    'API management for third-party integrations'
                  ].map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle2 className={`h-5 w-5 mr-2 flex-shrink-0 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{feature}</span>
                    </li>
                  ))}
                </ul>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Security & Compliance */}
        <section id="compliance" className={`py-16 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10">
                <h2 className={`text-3xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Security & Legal Compliance</h2>
                <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Ikimina is built with security and compliance at its core, ensuring your data is protected
                  and operations adhere to Rwanda's Data Protection Law Nº 058/2021 and international standards.
                </p>
                <ul className="space-y-4">
                  {[
                    {
                      title: 'Two-Factor Authentication',
                      desc: 'SMS and email verification for secure account access'
                    },
                    {
                      title: 'Encrypted Data Storage',
                      desc: 'End-to-end encryption for all sensitive information'
                    },
                    {
                      title: 'Consent Management',
                      desc: 'Transparent data usage policies with user consent controls'
                    },
                    {
                      title: 'Regular Security Audits',
                      desc: 'Continuous security testing and vulnerability assessments'
                    }
                  ].map((item, index) => (
                    <li key={index} className="flex">
                      <div className={`flex-shrink-0 h-6 w-6 rounded-full ${darkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-600'} flex items-center justify-center mr-3`}>
                        <Lock className="h-3 w-3" />
                      </div>
                      <div>
                        <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{item.title}</h4>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="md:w-1/2">
                <div className={`rounded-lg p-6 ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                  <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Compliance Framework</h3>
                  <div className={`space-y-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <p>
                      Our platform is designed to meet the requirements of:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Rwanda's Data Protection Law Nº 058/2021</li>
                      <li>National Bank of Rwanda (BNR) financial regulations</li>
                      <li>GDPR principles for international operations</li>
                      <li>ISO 27001 information security standards</li>
                    </ul>
                    <div className={`mt-6 p-4 rounded-lg ${darkMode ? 'bg-gray-600' : 'bg-white'} shadow-sm`}>
                      <h4 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Compliance Dashboard</h4>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Access detailed compliance reports, data privacy settings, and audit logs through our
                        comprehensive compliance dashboard.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mobile & Offline Access */}
        <section id="mobile" className={`py-16 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className={`text-3xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Mobile & Offline Access</h2>
              <p className={`max-w-2xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Access Ikimina anywhere, anytime - even with limited connectivity
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <img 
                  src="/mobile-app.png" 
                  alt="Ikimina Mobile App" 
                  className="rounded-lg shadow-xl mx-auto"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/300x600?text=Mobile+App';
                  }}
                />
              </div>
              
              <div className="space-y-6">
                <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                  <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Progressive Web App</h3>
                  <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                    Install Ikimina directly to your device for app-like experience without app store downloads.
                    Works across all modern smartphones and tablets.
                  </p>
                </div>
                
                <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                  <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>USSD Access</h3>
                  <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                    Access core features via USSD codes on any phone - perfect for rural areas with limited
                    smartphone access or data connectivity.
                  </p>
                </div>
                
                <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                  <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Offline Functionality</h3>
                  <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                    View your contributions, loan status, and group information even without internet connection.
                    Changes sync automatically when connectivity is restored.
                  </p>
                </div>
                
                <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                  <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Mobile Money Integration</h3>
                  <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                    Seamless integration with MTN Mobile Money and Airtel Money for easy contributions
                    and loan disbursements.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={`py-16 ${darkMode ? 'bg-primary-900' : 'bg-primary-600'} text-white`}>
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to transform your savings group?</h2>
            <p className="max-w-2xl mx-auto mb-8 text-primary-100">
              Join thousands of Rwandans who are already using Ikimina to manage their community savings groups.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/register">
                <Button className="w-full sm:w-auto bg-white text-primary-600 hover:bg-primary-50">
                  Create Your Account
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-primary-700">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={`py-12 ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Ikimina</h3>
              <p className="mb-4">Digitizing traditional savings groups for a more inclusive financial future.</p>
              <div className="flex space-x-4">
                {/* Social media icons would go here */}
              </div>
            </div>
            
            <div>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Product</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="hover:underline">Features</a></li>
                <li><a href="#roles" className="hover:underline">Roles</a></li>
                <li><a href="#compliance" className="hover:underline">Compliance</a></li>
                <li><a href="#mobile" className="hover:underline">Mobile Access</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:underline">Documentation</a></li>
                <li><a href="#" className="hover:underline">API Reference</a></li>
                <li><a href="#" className="hover:underline">Community Forum</a></li>
                <li><a href="#" className="hover:underline">Help Center</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:underline">About Us</a></li>
                <li><a href="#" className="hover:underline">Careers</a></li>
                <li><a href="#" className="hover:underline">Contact</a></li>
                <li><a href="#" className="hover:underline">Partners</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p>&copy; {new Date().getFullYear()} Ikimina. All rights reserved.</p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <a href="#" className="hover:underline">Privacy Policy</a>
              <a href="#" className="hover:underline">Terms of Service</a>
              <a href="#" className="hover:underline">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 