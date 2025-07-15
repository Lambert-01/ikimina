import React, { useState, useEffect } from 'react';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '../../ui/button';
import type { GroupFormData } from '../CreateGroupWizard';

interface ComplianceSettingsStepProps {
  data: GroupFormData;
  updateData: (data: Partial<GroupFormData>) => void;
  validateStep: (isValid: boolean) => void;
}

const ComplianceSettingsStep: React.FC<ComplianceSettingsStepProps> = ({
  data,
  updateData,
  validateStep
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validate on mount and when fields change
  useEffect(() => {
    validateForm();
  }, [data.enableKYC, data.adminContacts]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    // Validate admin contacts
    if (data.adminContacts.length === 0) {
      newErrors.adminContacts = 'At least one admin contact is required';
      isValid = false;
    } else {
      // Check each admin contact
      data.adminContacts.forEach((contact, index) => {
        if (!contact.name.trim()) {
          newErrors[`adminName_${index}`] = 'Name is required';
          isValid = false;
        }
        
        if (contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
          newErrors[`adminEmail_${index}`] = 'Invalid email format';
          isValid = false;
        }
        
        if (contact.phone && !/^\+?[0-9]{10,15}$/.test(contact.phone)) {
          newErrors[`adminPhone_${index}`] = 'Invalid phone number format';
          isValid = false;
        }
        
        if (!contact.email && !contact.phone) {
          newErrors[`adminContact_${index}`] = 'Either email or phone is required';
          isValid = false;
        }
      });
    }

    setErrors(newErrors);
    validateStep(isValid);
    return isValid;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    index?: number
  ) => {
    const { name, value, type } = e.target;
    
    // Handle checkbox inputs
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      updateData({ [name]: checked });
      return;
    }
    
    // Handle admin contact fields
    if (index !== undefined) {
      const updatedContacts = [...data.adminContacts];
      updatedContacts[index] = {
        ...updatedContacts[index],
        [name]: value
      };
      updateData({ adminContacts: updatedContacts });
    } else {
      // Handle other fields
      updateData({ [name]: value });
    }
  };

  const addAdminContact = () => {
    const updatedContacts = [
      ...data.adminContacts,
      { name: '', email: '', phone: '', role: 'member' }
    ];
    updateData({ adminContacts: updatedContacts });
  };

  const removeAdminContact = (index: number) => {
    const updatedContacts = [...data.adminContacts];
    updatedContacts.splice(index, 1);
    updateData({ adminContacts: updatedContacts });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Compliance Settings</h2>
        <p className="mt-1 text-sm text-gray-500">
          Configure compliance and security settings for your savings group.
        </p>
      </div>

      {/* KYC Toggle */}
      <div className="flex items-center">
        <input
          id="enableKYC"
          name="enableKYC"
          type="checkbox"
          checked={data.enableKYC}
          onChange={handleInputChange}
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label htmlFor="enableKYC" className="ml-2 block text-sm font-medium text-gray-700">
          Enable KYC verification for members
        </label>
      </div>

      {data.enableKYC && (
        <div className="mt-2 bg-blue-50 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-blue-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">KYC Information</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  When enabled, members will be required to upload identification documents
                  before they can fully participate in group activities.
                </p>
                <p className="mt-2">
                  Supported documents: National ID, Passport, Driver's License
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Contacts */}
      <div className="mt-6">
        <h3 className="text-md font-medium text-gray-900 mb-2">Group Administrators</h3>
        <p className="text-sm text-gray-500 mb-4">
          Add contact information for group administrators. At least one administrator is required.
        </p>

        {errors.adminContacts && (
          <p className="mt-1 text-sm text-red-600 mb-2">
            {errors.adminContacts}
          </p>
        )}

        <div className="space-y-4">
          {data.adminContacts.map((contact, index) => (
            <div key={index} className="border border-gray-200 rounded-md p-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-medium text-gray-900">Administrator {index + 1}</h4>
                {data.adminContacts.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAdminContact(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Name */}
                <div className="col-span-2 sm:col-span-1">
                  <label htmlFor={`name-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id={`name-${index}`}
                    name="name"
                    value={contact.name}
                    onChange={(e) => handleInputChange(e, index)}
                    className={`block w-full rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                      errors[`adminName_${index}`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="John Doe"
                  />
                  {errors[`adminName_${index}`] && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors[`adminName_${index}`]}
                    </p>
                  )}
                </div>

                {/* Role */}
                <div className="col-span-2 sm:col-span-1">
                  <label htmlFor={`role-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                    Role *
                  </label>
                  <select
                    id={`role-${index}`}
                    name="role"
                    value={contact.role}
                    onChange={(e) => handleInputChange(e, index)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  >
                    <option value="president">President</option>
                    <option value="treasurer">Treasurer</option>
                    <option value="secretary">Secretary</option>
                    <option value="member">Member</option>
                  </select>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor={`email-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id={`email-${index}`}
                    name="email"
                    value={contact.email || ''}
                    onChange={(e) => handleInputChange(e, index)}
                    className={`block w-full rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                      errors[`adminEmail_${index}`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="john@example.com"
                  />
                  {errors[`adminEmail_${index}`] && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors[`adminEmail_${index}`]}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor={`phone-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id={`phone-${index}`}
                    name="phone"
                    value={contact.phone || ''}
                    onChange={(e) => handleInputChange(e, index)}
                    className={`block w-full rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                      errors[`adminPhone_${index}`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="+250..."
                  />
                  {errors[`adminPhone_${index}`] && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors[`adminPhone_${index}`]}
                    </p>
                  )}
                </div>

                {errors[`adminContact_${index}`] && (
                  <p className="col-span-2 mt-1 text-sm text-red-600">
                    {errors[`adminContact_${index}`]}
                  </p>
                )}
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addAdminContact}
            className="w-full flex items-center justify-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Administrator
          </Button>
        </div>
      </div>

      {/* Compliance Notice */}
      <div className="mt-8 bg-yellow-50 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Compliance Information</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Your group will be subject to Rwanda's Law No. 40/2021 of 31/07/2021 governing 
                cooperative organizations in Rwanda and MINECOFIN regulations.
              </p>
              <p className="mt-2">
                By creating this group, you agree to comply with all applicable laws and regulations
                regarding savings groups and financial cooperatives.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceSettingsStep; 