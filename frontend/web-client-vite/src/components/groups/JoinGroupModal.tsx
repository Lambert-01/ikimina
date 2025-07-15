import React, { useState, useEffect } from 'react';
import { X, Upload, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import useAuthStore from '../../store/authStore';

interface JoinGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: JoinGroupRequestData) => void;
  groupId: string;
  groupName: string;
  isLoading?: boolean;
}

export interface JoinGroupRequestData {
  groupId: string;
  motivation: string;
  identificationDocument?: File | null;
  phoneNumber: string;
  email: string;
  agreeToRules: boolean;
}

const JoinGroupModal: React.FC<JoinGroupModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  groupId,
  groupName,
  isLoading = false
}) => {
  const { user } = useAuthStore();
  
  const [formData, setFormData] = useState<JoinGroupRequestData>({
    groupId,
    motivation: '',
    identificationDocument: null,
    phoneNumber: user?.phone || '',
    email: user?.email || '',
    agreeToRules: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form data when user or groupId changes
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        groupId,
        // Use the correct property name 'phone' instead of 'phoneNumber'
        phoneNumber: user.phone || prev.phoneNumber,
        email: user.email || prev.email
      }));
    }
  }, [user, groupId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, identificationDocument: file }));
    
    // Clear error when field is edited
    if (errors.identificationDocument) {
      setErrors(prev => ({ ...prev, identificationDocument: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.motivation.trim()) {
      newErrors.motivation = 'Please provide your motivation for joining';
    }
    
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\+?[0-9]{10,15}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.agreeToRules) {
      newErrors.agreeToRules = 'You must agree to the group rules';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Join {groupName}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="motivation" className="block text-sm font-medium text-gray-700 mb-1">
                Why do you want to join this group? *
              </label>
              <textarea
                id="motivation"
                name="motivation"
                rows={3}
                className={`block w-full rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 ${
                  errors.motivation ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Explain your motivation for joining this savings group..."
                value={formData.motivation}
                onChange={handleInputChange}
                aria-invalid={!!errors.motivation}
                aria-describedby={errors.motivation ? "motivation-error" : undefined}
              />
              {errors.motivation && (
                <p id="motivation-error" className="mt-1 text-sm text-red-600">
                  {errors.motivation}
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                className={`block w-full rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 ${
                  errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="+250..."
                value={formData.phoneNumber}
                onChange={handleInputChange}
                aria-invalid={!!errors.phoneNumber}
                aria-describedby={errors.phoneNumber ? "phone-error" : undefined}
              />
              {errors.phoneNumber && (
                <p id="phone-error" className="mt-1 text-sm text-red-600">
                  {errors.phoneNumber}
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className={`block w-full rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={handleInputChange}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && (
                <p id="email-error" className="mt-1 text-sm text-red-600">
                  {errors.email}
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="identificationDocument" className="block text-sm font-medium text-gray-700 mb-1">
                Upload ID Document (Optional)
              </label>
              <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
                errors.identificationDocument ? 'border-red-500' : 'border-gray-300'
              }`}>
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md font-medium text-primary-600 hover:text-primary-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="identificationDocument"
                        type="file"
                        className="sr-only"
                        onChange={handleFileChange}
                        accept="image/*,.pdf"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                  {formData.identificationDocument && (
                    <p className="text-sm text-gray-700">
                      Selected: {formData.identificationDocument.name}
                    </p>
                  )}
                </div>
              </div>
              {errors.identificationDocument && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.identificationDocument}
                </p>
              )}
            </div>
            
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="agreeToRules"
                  name="agreeToRules"
                  type="checkbox"
                  className={`h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded ${
                    errors.agreeToRules ? 'border-red-500' : ''
                  }`}
                  checked={formData.agreeToRules}
                  onChange={handleInputChange}
                  aria-invalid={!!errors.agreeToRules}
                  aria-describedby={errors.agreeToRules ? "rules-error" : undefined}
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="agreeToRules" className="font-medium text-gray-700">
                  I agree to the group rules and terms *
                </label>
                {errors.agreeToRules && (
                  <p id="rules-error" className="mt-1 text-sm text-red-600">
                    {errors.agreeToRules}
                  </p>
                )}
              </div>
            </div>
            
            <div className="bg-yellow-50 p-3 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Important Information
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Your request to join will be reviewed by the group manager. 
                      You'll receive a notification once your request is processed.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinGroupModal; 