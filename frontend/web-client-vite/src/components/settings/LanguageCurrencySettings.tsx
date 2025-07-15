import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { toast } from 'react-toastify';
import { Globe, DollarSign, Check } from 'lucide-react';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  isAvailable: boolean;
}

interface Currency {
  code: string;
  name: string;
  symbol: string;
  isAvailable: boolean;
}

interface LanguageCurrencySettingsProps {
  onSave?: (language: string, currency: string) => Promise<void>;
  className?: string;
}

const LanguageCurrencySettings: React.FC<LanguageCurrencySettingsProps> = ({
  onSave,
  className = '',
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // In a real app, this would be an API call
        // For demo purposes, we'll simulate data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock languages
        const mockLanguages: Language[] = [
          {
            code: 'en',
            name: 'English',
            nativeName: 'English',
            flag: '🇺🇸',
            isAvailable: true
          },
          {
            code: 'fr',
            name: 'French',
            nativeName: 'Français',
            flag: '🇫🇷',
            isAvailable: true
          },
          {
            code: 'rw',
            name: 'Kinyarwanda',
            nativeName: 'Ikinyarwanda',
            flag: '🇷🇼',
            isAvailable: true
          },
          {
            code: 'sw',
            name: 'Swahili',
            nativeName: 'Kiswahili',
            flag: '🇹🇿',
            isAvailable: true
          },
          {
            code: 'ar',
            name: 'Arabic',
            nativeName: 'العربية',
            flag: '🇸🇦',
            isAvailable: false
          }
        ];
        
        // Mock currencies
        const mockCurrencies: Currency[] = [
          {
            code: 'RWF',
            name: 'Rwandan Franc',
            symbol: 'RWF',
            isAvailable: true
          },
          {
            code: 'USD',
            name: 'US Dollar',
            symbol: '$',
            isAvailable: true
          },
          {
            code: 'EUR',
            name: 'Euro',
            symbol: '€',
            isAvailable: true
          },
          {
            code: 'KES',
            name: 'Kenyan Shilling',
            symbol: 'KSh',
            isAvailable: false
          },
          {
            code: 'UGX',
            name: 'Ugandan Shilling',
            symbol: 'USh',
            isAvailable: false
          }
        ];
        
        setLanguages(mockLanguages);
        setCurrencies(mockCurrencies);
        
        // Set default selected values
        setSelectedLanguage('en');
        setSelectedCurrency('RWF');
      } catch (error) {
        console.error('Error fetching language and currency settings:', error);
        toast.error('Failed to load language and currency settings');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Track changes
  useEffect(() => {
    if (!loading && (selectedLanguage !== 'en' || selectedCurrency !== 'RWF')) {
      setHasChanges(true);
    } else {
      setHasChanges(false);
    }
  }, [selectedLanguage, selectedCurrency, loading]);

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      
      if (onSave) {
        await onSave(selectedLanguage, selectedCurrency);
      } else {
        // In a real app, this would call the API to save the settings
        // For demo purposes, we'll simulate a delay
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      toast.success('Language and currency settings saved successfully');
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving language and currency settings:', error);
      toast.error('Failed to save language and currency settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading language and currency settings...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Language & Currency</CardTitle>
        <CardDescription>
          Customize your language and currency preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Language Selection */}
        <div>
          <div className="flex items-center mb-4">
            <Globe className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Language</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {languages
              .filter(lang => lang.isAvailable)
              .map(language => (
                <div 
                  key={language.code}
                  className={`border rounded-md p-3 cursor-pointer transition-colors ${
                    selectedLanguage === language.code ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedLanguage(language.code)}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 text-2xl mr-3">
                      {language.flag}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{language.name}</p>
                      <p className="text-xs text-gray-500">{language.nativeName}</p>
                    </div>
                    {selectedLanguage === language.code && (
                      <div className="ml-auto">
                        <Check className="h-5 w-5 text-primary-600" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
          
          {/* Coming Soon Languages */}
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-2">Coming Soon</p>
            <div className="flex flex-wrap gap-2">
              {languages
                .filter(lang => !lang.isAvailable)
                .map(language => (
                  <div 
                    key={language.code}
                    className="border rounded-md px-3 py-1.5 text-gray-400 bg-gray-50 cursor-not-allowed"
                  >
                    <div className="flex items-center">
                      <div className="text-lg mr-2">{language.flag}</div>
                      <span className="text-xs">{language.name}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
        
        {/* Currency Selection */}
        <div className="border-t pt-6">
          <div className="flex items-center mb-4">
            <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Currency</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {currencies
              .filter(curr => curr.isAvailable)
              .map(currency => (
                <div 
                  key={currency.code}
                  className={`border rounded-md p-3 cursor-pointer transition-colors ${
                    selectedCurrency === currency.code ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedCurrency(currency.code)}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 font-bold text-lg mr-3 w-8 text-center">
                      {currency.symbol}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{currency.code}</p>
                      <p className="text-xs text-gray-500">{currency.name}</p>
                    </div>
                    {selectedCurrency === currency.code && (
                      <div className="ml-auto">
                        <Check className="h-5 w-5 text-primary-600" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
          
          {/* Coming Soon Currencies */}
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-2">Coming Soon</p>
            <div className="flex flex-wrap gap-2">
              {currencies
                .filter(curr => !curr.isAvailable)
                .map(currency => (
                  <div 
                    key={currency.code}
                    className="border rounded-md px-3 py-1.5 text-gray-400 bg-gray-50 cursor-not-allowed"
                  >
                    <div className="flex items-center">
                      <div className="font-bold mr-2">{currency.symbol}</div>
                      <span className="text-xs">{currency.code}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
        
        {/* Information Section */}
        <div className="border-t pt-6">
          <div className="bg-gray-50 p-4 rounded-md text-sm text-gray-600">
            <p className="mb-2">
              <strong>Note about language selection:</strong>
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Changing your language will translate the user interface and system messages.</li>
              <li>Some user-generated content may remain in its original language.</li>
              <li>Date and number formats will adjust to match your selected language's conventions.</li>
            </ul>
            
            <p className="mt-4 mb-2">
              <strong>Note about currency selection:</strong>
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Changing your currency is for display purposes only.</li>
              <li>All transactions will still be processed in Rwandan Francs (RWF).</li>
              <li>Exchange rates are updated daily for accurate conversions.</li>
            </ul>
          </div>
        </div>
        
        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button
            onClick={handleSaveSettings}
            disabled={saving || !hasChanges}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LanguageCurrencySettings; 