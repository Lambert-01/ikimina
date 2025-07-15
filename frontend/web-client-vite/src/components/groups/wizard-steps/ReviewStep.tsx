import React from 'react';
import { CheckCircle2, AlertTriangle, Users, Calendar, CreditCard, Lock, Unlock } from 'lucide-react';
import type { GroupFormData } from '../CreateGroupWizard';

interface ReviewStepProps {
  data: GroupFormData;
  updateData: (data: Partial<GroupFormData>) => void;
}

const ReviewStep: React.FC<ReviewStepProps> = ({ data }) => {
  // Format currency for display
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: data.contributionCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format frequency for display
  const formatFrequency = (frequency: string): string => {
    switch (frequency) {
      case 'weekly':
        return 'Weekly';
      case 'biweekly':
        return 'Bi-weekly';
      case 'monthly':
        return 'Monthly';
      default:
        return frequency.charAt(0).toUpperCase() + frequency.slice(1);
    }
  };

  // Format visibility for display
  const formatVisibility = (visibility: string): string => {
    switch (visibility) {
      case 'public':
        return 'Public';
      case 'private':
        return 'Private';
      case 'unlisted':
        return 'Unlisted';
      default:
        return visibility.charAt(0).toUpperCase() + visibility.slice(1);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Review Your Group</h2>
        <p className="mt-1 text-sm text-gray-500">
          Please review your group information before submitting.
        </p>
      </div>

      {/* Group Information */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 bg-gray-50">
          <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
            <Users className="h-5 w-5 mr-2 text-primary-500" />
            Group Information
          </h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Group Name</dt>
              <dd className="mt-1 text-sm text-gray-900">{data.name}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Visibility</dt>
              <dd className="mt-1 text-sm text-gray-900 flex items-center">
                {data.visibility === 'private' ? (
                  <Lock className="h-4 w-4 mr-1 text-gray-500" />
                ) : (
                  <Unlock className="h-4 w-4 mr-1 text-green-500" />
                )}
                {formatVisibility(data.visibility)}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1 text-sm text-gray-900">{data.description}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Contribution Rules */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 bg-gray-50">
          <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-primary-500" />
            Contribution Rules
          </h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Contribution Amount</dt>
              <dd className="mt-1 text-sm text-gray-900">{formatCurrency(data.contributionAmount)}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Frequency</dt>
              <dd className="mt-1 text-sm text-gray-900">{formatFrequency(data.contributionFrequency)}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Deadline</dt>
              <dd className="mt-1 text-sm text-gray-900">{data.contributionDeadline} days</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Currency</dt>
              <dd className="mt-1 text-sm text-gray-900">{data.contributionCurrency}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Member Limits</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {data.minMembers} to {data.maxMembers} members
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Loan Policies */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 bg-gray-50">
          <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
            <CreditCard className="h-5 w-5 mr-2 text-primary-500" />
            Loan Policies
          </h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          {data.enableLoans ? (
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Maximum Loan</dt>
                <dd className="mt-1 text-sm text-gray-900">{data.maxLoanPercentage}% of group funds</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Maximum Term</dt>
                <dd className="mt-1 text-sm text-gray-900">{data.maxLoanTerm} months</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Interest Rate</dt>
                <dd className="mt-1 text-sm text-gray-900">{data.interestRate}%</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Approval Method</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {data.requiresVoting
                    ? `Member voting (${data.votingThreshold}% threshold)`
                    : 'Manager approval'}
                </dd>
              </div>
            </dl>
          ) : (
            <div className="text-sm text-gray-500 italic">Loans are disabled for this group</div>
          )}
        </div>
      </div>

      {/* Compliance Settings */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 bg-gray-50">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Compliance Settings
          </h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">KYC Verification</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {data.enableKYC ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Enabled
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Disabled
                  </span>
                )}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Group Administrators</dt>
              <dd className="mt-1">
                <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                  {data.adminContacts.map((admin, index) => (
                    <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                      <div className="w-0 flex-1 flex items-center">
                        <span className="ml-2 flex-1 w-0 truncate">
                          {admin.name} ({admin.role})
                        </span>
                      </div>
                      <div className="ml-4 flex-shrink-0 text-gray-500">
                        {admin.email || admin.phone}
                      </div>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Invitations */}
      {data.invitations.length > 0 && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Pending Invitations
            </h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
              {data.invitations.map((invite, index) => (
                <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                  <div className="w-0 flex-1 flex items-center">
                    <span className="ml-2 flex-1 w-0 truncate">
                      {invite.email || invite.phoneNumber}
                    </span>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {invite.role === 'manager' ? 'Co-Manager' : 'Member'}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Final Notice */}
      <div className="bg-yellow-50 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Important Information</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                After submission, your group will be reviewed by an administrator before becoming active.
                This typically takes 1-2 business days.
              </p>
              <p className="mt-2">
                You will be notified by email once your group is approved and ready to use.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewStep; 