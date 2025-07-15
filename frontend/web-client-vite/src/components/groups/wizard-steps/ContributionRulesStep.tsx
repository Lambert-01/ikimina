import React, { useState, useEffect } from 'react';
import type { GroupFormData } from '../CreateGroupWizard';

interface ContributionRulesStepProps {
  data: GroupFormData;
  updateData: (data: Partial<GroupFormData>) => void;
  validateStep: (isValid: boolean) => void;
}

const ContributionRulesStep: React.FC<ContributionRulesStepProps> = ({
  data,
  updateData,
  validateStep
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Validate on mount and when fields change
  useEffect(() => {
    validateForm();
  }, [
    data.contributionAmount, 
    data.contributionFrequency, 
    data.contributionDeadline,
    data.minMembers,
    data.maxMembers
  ]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    // Validate contribution amount
    if (!data.contributionAmount || data.contributionAmount <= 0) {
      newErrors.contributionAmount = 'Contribution amount must be greater than 0';
      isValid = false;
    } else if (data.contributionAmount > 10000000) { // 10 million RWF limit
      newErrors.contributionAmount = 'Contribution amount cannot exceed 10,000,000 RWF';
      isValid = false;
    }

    // Validate contribution deadline
    if (data.contributionDeadline < 1) {
      newErrors.contributionDeadline = 'Deadline must be at least 1 day';
      isValid = false;
    } else if (data.contributionDeadline > 30) {
      newErrors.contributionDeadline = 'Deadline cannot exceed 30 days';
      isValid = false;
    }

    // Validate member limits
    if (data.minMembers < 2) {
      newErrors.minMembers = 'Group must have at least 2 members';
      isValid = false;
    }
    
    if (data.maxMembers < data.minMembers) {
      newErrors.maxMembers = 'Maximum members cannot be less than minimum members';
      isValid = false;
    } else if (data.maxMembers > 100) {
      newErrors.maxMembers = 'Maximum members cannot exceed 100';
      isValid = false;
    }

    setErrors(newErrors);
    validateStep(isValid);
    return isValid;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Convert numeric inputs to numbers
    if (type === 'number') {
      updateData({ [name]: Number(value) });
    } else {
      updateData({ [name]: value });
    }
  };

  // Format currency for display
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: data.contributionCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Contribution Rules</h2>
        <p className="mt-1 text-sm text-gray-500">
          Set up the contribution rules for your savings group.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Contribution Amount */}
        <div className="col-span-1">
          <label htmlFor="contributionAmount" className="block text-sm font-medium text-gray-700 mb-1">
            Contribution Amount *
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">
                {data.contributionCurrency === 'RWF' ? 'RWF' : '$'}
              </span>
            </div>
            <input
              type="number"
              id="contributionAmount"
              name="contributionAmount"
              min="0"
              step="1000"
              value={data.contributionAmount}
              onChange={handleInputChange}
              className={`block w-full pl-12 pr-12 py-2 rounded-md focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                errors.contributionAmount ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0"
              aria-invalid={!!errors.contributionAmount}
              aria-describedby={errors.contributionAmount ? "amount-error" : undefined}
            />
          </div>
          {errors.contributionAmount && (
            <p id="amount-error" className="mt-1 text-sm text-red-600">
              {errors.contributionAmount}
            </p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            The amount each member contributes per cycle.
          </p>
        </div>

        {/* Contribution Frequency */}
        <div className="col-span-1">
          <label htmlFor="contributionFrequency" className="block text-sm font-medium text-gray-700 mb-1">
            Contribution Frequency *
          </label>
          <select
            id="contributionFrequency"
            name="contributionFrequency"
            value={data.contributionFrequency}
            onChange={handleInputChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          >
            <option value="weekly">Weekly</option>
            <option value="biweekly">Bi-weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <p className="mt-1 text-sm text-gray-500">
            How often members contribute to the group.
          </p>
        </div>

        {/* Contribution Deadline */}
        <div className="col-span-1">
          <label htmlFor="contributionDeadline" className="block text-sm font-medium text-gray-700 mb-1">
            Contribution Deadline (Days) *
          </label>
          <input
            type="number"
            id="contributionDeadline"
            name="contributionDeadline"
            min="1"
            max="30"
            value={data.contributionDeadline}
            onChange={handleInputChange}
            className={`block w-full rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
              errors.contributionDeadline ? 'border-red-500' : 'border-gray-300'
            }`}
            aria-invalid={!!errors.contributionDeadline}
            aria-describedby={errors.contributionDeadline ? "deadline-error" : undefined}
          />
          {errors.contributionDeadline && (
            <p id="deadline-error" className="mt-1 text-sm text-red-600">
              {errors.contributionDeadline}
            </p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            Number of days members have to contribute after the cycle starts.
          </p>
        </div>

        {/* Currency */}
        <div className="col-span-1">
          <label htmlFor="contributionCurrency" className="block text-sm font-medium text-gray-700 mb-1">
            Currency *
          </label>
          <select
            id="contributionCurrency"
            name="contributionCurrency"
            value={data.contributionCurrency}
            onChange={handleInputChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          >
            <option value="RWF">Rwandan Franc (RWF)</option>
            <option value="USD">US Dollar (USD)</option>
            <option value="EUR">Euro (EUR)</option>
          </select>
          <p className="mt-1 text-sm text-gray-500">
            Currency used for all group transactions.
          </p>
        </div>

        {/* Min Members */}
        <div className="col-span-1">
          <label htmlFor="minMembers" className="block text-sm font-medium text-gray-700 mb-1">
            Minimum Members *
          </label>
          <input
            type="number"
            id="minMembers"
            name="minMembers"
            min="2"
            max="100"
            value={data.minMembers}
            onChange={handleInputChange}
            className={`block w-full rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
              errors.minMembers ? 'border-red-500' : 'border-gray-300'
            }`}
            aria-invalid={!!errors.minMembers}
            aria-describedby={errors.minMembers ? "min-members-error" : undefined}
          />
          {errors.minMembers && (
            <p id="min-members-error" className="mt-1 text-sm text-red-600">
              {errors.minMembers}
            </p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            Minimum number of members required for the group to be active.
          </p>
        </div>

        {/* Max Members */}
        <div className="col-span-1">
          <label htmlFor="maxMembers" className="block text-sm font-medium text-gray-700 mb-1">
            Maximum Members *
          </label>
          <input
            type="number"
            id="maxMembers"
            name="maxMembers"
            min={data.minMembers}
            max="100"
            value={data.maxMembers}
            onChange={handleInputChange}
            className={`block w-full rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
              errors.maxMembers ? 'border-red-500' : 'border-gray-300'
            }`}
            aria-invalid={!!errors.maxMembers}
            aria-describedby={errors.maxMembers ? "max-members-error" : undefined}
          />
          {errors.maxMembers && (
            <p id="max-members-error" className="mt-1 text-sm text-red-600">
              {errors.maxMembers}
            </p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            Maximum number of members allowed in the group.
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-8 bg-gray-50 p-4 rounded-md">
        <h3 className="text-sm font-medium text-gray-900">Contribution Summary</h3>
        <div className="mt-2 text-sm text-gray-700">
          <p>Each member will contribute {formatCurrency(data.contributionAmount)} {data.contributionFrequency}.</p>
          <p className="mt-1">
            For a group of {data.minMembers}-{data.maxMembers} members, the total per cycle will be between {formatCurrency(data.contributionAmount * data.minMembers)} and {formatCurrency(data.contributionAmount * data.maxMembers)}.
          </p>
          <p className="mt-1">
            Members will have {data.contributionDeadline} days to make their contributions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContributionRulesStep; 