import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Mail, Phone } from 'lucide-react';
import { Button } from '../../ui/button';
import type { GroupFormData } from '../CreateGroupWizard';

interface InviteMembersStepProps {
  data: GroupFormData;
  updateData: (data: Partial<GroupFormData>) => void;
  validateStep: (isValid: boolean) => void;
}

const InviteMembersStep: React.FC<InviteMembersStepProps> = ({
  data,
  updateData,
  validateStep
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [inviteMethod, setInviteMethod] = useState<'email' | 'phone'>('email');
  const [newInvite, setNewInvite] = useState({ email: '', phoneNumber: '', role: 'member' as const });

  // Always validate this step (no required fields)
  useEffect(() => {
    validateStep(true);
  }, [validateStep]);

  const validateInvite = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (inviteMethod === 'email') {
      if (!newInvite.email) {
        newErrors.email = 'Email is required';
        isValid = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newInvite.email)) {
        newErrors.email = 'Invalid email format';
        isValid = false;
      }
    } else {
      if (!newInvite.phoneNumber) {
        newErrors.phoneNumber = 'Phone number is required';
        isValid = false;
      } else if (!/^\+?[0-9]{10,15}$/.test(newInvite.phoneNumber)) {
        newErrors.phoneNumber = 'Invalid phone number format';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewInvite(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddInvite = () => {
    if (!validateInvite()) return;

    const invitation = {
      email: inviteMethod === 'email' ? newInvite.email : undefined,
      phoneNumber: inviteMethod === 'phone' ? newInvite.phoneNumber : undefined,
      role: newInvite.role as 'member' | 'manager'
    };

    updateData({
      invitations: [...data.invitations, invitation]
    });

    // Reset form
    setNewInvite({ email: '', phoneNumber: '', role: 'member' });
  };

  const handleRemoveInvite = (index: number) => {
    const updatedInvitations = [...data.invitations];
    updatedInvitations.splice(index, 1);
    updateData({ invitations: updatedInvitations });
  };

  const getContactInfo = (invite: typeof data.invitations[0]): string => {
    return invite.email || invite.phoneNumber || 'No contact info';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Invite Members</h2>
        <p className="mt-1 text-sm text-gray-500">
          Invite people to join your savings group. This step is optional - you can also invite members later.
        </p>
      </div>

      {/* Invite Form */}
      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="text-md font-medium text-gray-900 mb-4">Add New Member</h3>
        
        {/* Invite Method Tabs */}
        <div className="flex border-b border-gray-200 mb-4">
          <button
            type="button"
            className={`px-4 py-2 border-b-2 font-medium text-sm ${
              inviteMethod === 'email'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setInviteMethod('email')}
          >
            <Mail className="inline-block h-4 w-4 mr-1" />
            Email
          </button>
          <button
            type="button"
            className={`px-4 py-2 border-b-2 font-medium text-sm ${
              inviteMethod === 'phone'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setInviteMethod('phone')}
          >
            <Phone className="inline-block h-4 w-4 mr-1" />
            Phone
          </button>
        </div>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Email Input */}
          {inviteMethod === 'email' && (
            <div className="sm:col-span-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={newInvite.email}
                onChange={handleInputChange}
                className={`block w-full rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="member@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email}
                </p>
              )}
            </div>
          )}

          {/* Phone Input */}
          {inviteMethod === 'phone' && (
            <div className="sm:col-span-2">
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={newInvite.phoneNumber}
                onChange={handleInputChange}
                className={`block w-full rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                  errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="+250..."
              />
              {errors.phoneNumber && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.phoneNumber}
                </p>
              )}
            </div>
          )}

          {/* Role Select */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              id="role"
              name="role"
              value={newInvite.role}
              onChange={handleInputChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              <option value="member">Member</option>
              <option value="manager">Co-Manager</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <Button
            type="button"
            onClick={handleAddInvite}
            className="w-full sm:w-auto flex items-center justify-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Invitation
          </Button>
        </div>
      </div>

      {/* Invitations List */}
      {data.invitations.length > 0 && (
        <div>
          <h3 className="text-md font-medium text-gray-900 mb-2">Pending Invitations</h3>
          <ul className="divide-y divide-gray-200 border border-gray-200 rounded-md">
            {data.invitations.map((invite, index) => (
              <li key={index} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {getContactInfo(invite)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Role: {invite.role === 'manager' ? 'Co-Manager' : 'Member'}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveInvite(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Remove</span>
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* No Invitations Message */}
      {data.invitations.length === 0 && (
        <div className="text-center py-6 bg-gray-50 rounded-md">
          <Mail className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No invitations yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Start by adding members to your group.
          </p>
        </div>
      )}

      {/* Information */}
      <div className="bg-blue-50 p-4 rounded-md">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Information</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Invitations will be sent after your group is created and approved.
                Members will receive an email or SMS with instructions to join.
              </p>
              <p className="mt-2">
                You can also invite additional members after your group is created.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteMembersStep; 