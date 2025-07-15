import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { toast } from 'react-toastify';
import { Smartphone, Plus, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';

interface WalletProvider {
  id: string;
  name: string;
  code: string;
  logo: string;
  isAvailable: boolean;
}

interface LinkedWallet {
  id: string;
  providerId: string;
  providerName: string;
  phoneNumber: string;
  isDefault: boolean;
  dateLinked: string;
}

interface MobileMoneySettingsProps {
  onLinkWallet?: (providerId: string, phoneNumber: string) => Promise<void>;
  onUnlinkWallet?: (walletId: string) => Promise<void>;
  onSetDefaultWallet?: (walletId: string) => Promise<void>;
  className?: string;
}

const MobileMoneySettings: React.FC<MobileMoneySettingsProps> = ({
  onLinkWallet,
  onUnlinkWallet,
  onSetDefaultWallet,
  className = '',
}) => {
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState<WalletProvider[]>([]);
  const [linkedWallets, setLinkedWallets] = useState<LinkedWallet[]>([]);
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [linking, setLinking] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // In a real app, this would be an API call
        // For demo purposes, we'll simulate data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock wallet providers
        const mockProviders: WalletProvider[] = [
          {
            id: 'mtn',
            name: 'MTN Mobile Money',
            code: 'MTN',
            logo: 'mtn-logo.png',
            isAvailable: true
          },
          {
            id: 'airtel',
            name: 'Airtel Money',
            code: 'AIRTEL',
            logo: 'airtel-logo.png',
            isAvailable: true
          },
          {
            id: 'tigo',
            name: 'Tigo Cash',
            code: 'TIGO',
            logo: 'tigo-logo.png',
            isAvailable: false
          }
        ];
        
        // Mock linked wallets
        const mockLinkedWallets: LinkedWallet[] = [
          {
            id: 'w1',
            providerId: 'mtn',
            providerName: 'MTN Mobile Money',
            phoneNumber: '+250781234567',
            isDefault: true,
            dateLinked: '2023-01-15'
          }
        ];
        
        setProviders(mockProviders);
        setLinkedWallets(mockLinkedWallets);
      } catch (error) {
        console.error('Error fetching wallet data:', error);
        toast.error('Failed to load mobile money settings');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!selectedProvider) {
      newErrors.provider = 'Please select a provider';
    }
    
    if (!phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\+?[0-9]{10,15}$/.test(phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    } else if (linkedWallets.some(wallet => wallet.phoneNumber === phoneNumber)) {
      newErrors.phoneNumber = 'This phone number is already linked';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLinkWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLinking(true);
      
      if (onLinkWallet) {
        await onLinkWallet(selectedProvider, phoneNumber);
      } else {
        // In a real app, this would call the API to link the wallet
        // For demo purposes, we'll simulate a delay
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      // Add the new wallet to the list
      const provider = providers.find(p => p.id === selectedProvider);
      if (provider) {
        const newWallet: LinkedWallet = {
          id: `w${Date.now()}`,
          providerId: provider.id,
          providerName: provider.name,
          phoneNumber,
          isDefault: linkedWallets.length === 0, // Make default if it's the first wallet
          dateLinked: new Date().toISOString().split('T')[0]
        };
        
        setLinkedWallets([...linkedWallets, newWallet]);
      }
      
      toast.success('Mobile money wallet linked successfully');
      
      // Reset form
      setShowAddWallet(false);
      setSelectedProvider('');
      setPhoneNumber('');
      setErrors({});
    } catch (error) {
      console.error('Error linking wallet:', error);
      toast.error('Failed to link mobile money wallet');
    } finally {
      setLinking(false);
    }
  };

  const handleUnlinkWallet = async (walletId: string) => {
    try {
      // Check if it's the default wallet
      const wallet = linkedWallets.find(w => w.id === walletId);
      if (wallet?.isDefault) {
        toast.error('Cannot remove default wallet. Please set another wallet as default first.');
        return;
      }
      
      if (onUnlinkWallet) {
        await onUnlinkWallet(walletId);
      } else {
        // In a real app, this would call the API to unlink the wallet
        // For demo purposes, we'll simulate a delay
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Remove the wallet from the list
      setLinkedWallets(linkedWallets.filter(w => w.id !== walletId));
      toast.success('Mobile money wallet unlinked successfully');
    } catch (error) {
      console.error('Error unlinking wallet:', error);
      toast.error('Failed to unlink mobile money wallet');
    }
  };

  const handleSetDefaultWallet = async (walletId: string) => {
    try {
      if (onSetDefaultWallet) {
        await onSetDefaultWallet(walletId);
      } else {
        // In a real app, this would call the API to set the default wallet
        // For demo purposes, we'll simulate a delay
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Update the default wallet in the list
      setLinkedWallets(linkedWallets.map(wallet => ({
        ...wallet,
        isDefault: wallet.id === walletId
      })));
      
      toast.success('Default payment method updated');
    } catch (error) {
      console.error('Error setting default wallet:', error);
      toast.error('Failed to update default payment method');
    }
  };

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading payment methods...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Mobile Money Settings</CardTitle>
        <CardDescription>
          Manage your linked mobile money accounts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Linked Wallets */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Linked Accounts</h3>
            <Button
              size="sm"
              onClick={() => setShowAddWallet(true)}
              disabled={showAddWallet}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          </div>
          
          {linkedWallets.length > 0 ? (
            <div className="space-y-4">
              {linkedWallets.map(wallet => (
                <div key={wallet.id} className="border rounded-md p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          wallet.providerId === 'mtn' ? 'bg-yellow-400' : 
                          wallet.providerId === 'airtel' ? 'bg-red-600' : 
                          'bg-blue-600'
                        }`}>
                          <span className={`font-bold text-sm ${
                            wallet.providerId === 'mtn' ? 'text-black' : 'text-white'
                          }`}>
                            {wallet.providerId.toUpperCase().slice(0, 3)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{wallet.providerName}</p>
                        <p className="text-xs text-gray-500">{wallet.phoneNumber}</p>
                        <p className="text-xs text-gray-500">Linked on {formatDate(wallet.dateLinked)}</p>
                        {wallet.isDefault && (
                          <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Default
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {!wallet.isDefault && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSetDefaultWallet(wallet.id)}
                        >
                          Set as Default
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => handleUnlinkWallet(wallet.id)}
                        disabled={wallet.isDefault}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-md">
              <Smartphone className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-sm font-medium text-gray-900">No linked accounts</h3>
              <p className="mt-1 text-xs text-gray-500">
                Link your mobile money account to make payments easily
              </p>
              <div className="mt-4">
                <Button
                  size="sm"
                  onClick={() => setShowAddWallet(true)}
                  disabled={showAddWallet}
                >
                  Link Account
                </Button>
              </div>
            </div>
          )}
        </div>
        
        {/* Add Wallet Form */}
        {showAddWallet && (
          <div className="border rounded-md p-4 bg-gray-50">
            <h3 className="text-md font-medium text-gray-900 mb-4">Link New Account</h3>
            <form onSubmit={handleLinkWallet} className="space-y-4">
              {/* Provider Selection */}
              <div>
                <label htmlFor="provider" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Provider *
                </label>
                <select
                  id="provider"
                  name="provider"
                  className={`block w-full rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                    errors.provider ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                >
                  <option value="">Select a provider</option>
                  {providers.filter(p => p.isAvailable).map(provider => (
                    <option key={provider.id} value={provider.id}>{provider.name}</option>
                  ))}
                </select>
                {errors.provider && (
                  <p className="mt-1 text-sm text-red-600">{errors.provider}</p>
                )}
              </div>
              
              {/* Phone Number */}
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  className={`block w-full rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                    errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="+250..."
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
                {errors.phoneNumber ? (
                  <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
                ) : (
                  <p className="mt-1 text-xs text-gray-500">
                    Enter the phone number registered with your mobile money account
                  </p>
                )}
              </div>
              
              {/* Information Notice */}
              <div className="bg-blue-50 p-3 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      You will receive a verification code on this phone number to confirm ownership.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Form Actions */}
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddWallet(false);
                    setSelectedProvider('');
                    setPhoneNumber('');
                    setErrors({});
                  }}
                  disabled={linking}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={linking}
                >
                  {linking ? 'Linking...' : 'Link Account'}
                </Button>
              </div>
            </form>
          </div>
        )}
        
        {/* Information Section */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">About Mobile Money Payments</h3>
          
          <div className="space-y-4 text-sm text-gray-600">
            <p>
              Mobile money accounts allow you to make and receive payments directly from your phone.
              Linking your accounts enables seamless contributions and loan repayments.
            </p>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="font-medium text-gray-900 mb-2">Benefits</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Make instant contributions to your savings groups</li>
                <li>Receive loan disbursements directly to your mobile wallet</li>
                <li>Set up automatic repayments for your loans</li>
                <li>Track all your transactions in one place</li>
              </ul>
            </div>
            
            <p className="text-xs">
              Note: Standard mobile money transaction fees may apply based on your provider's terms.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileMoneySettings; 