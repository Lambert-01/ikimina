import React, { useState, useEffect } from 'react';
import type { GroupFormData } from '../CreateGroupWizard';

interface LoanPoliciesStepProps {
  data: GroupFormData;
  updateData: (data: Partial<GroupFormData>) => void;
  validateStep: (isValid: boolean) => void;
}

const LoanPoliciesStep: React.FC<LoanPoliciesStepProps> = ({
  data,
  updateData,
  validateStep
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validate on mount and when fields change
  useEffect(() => {
    validateForm();
  }, [
    data.enableLoans,
    data.maxLoanPercentage,
    data.maxLoanTerm,
    data.interestRate,
    data.requiresVoting,
    data.votingThreshold
  ]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    // Only validate if loans are enabled
    if (data.enableLoans) {
      // Validate max loan percentage
      if (data.maxLoanPercentage <= 0) {
        newErrors.maxLoanPercentage = 'Maximum loan percentage must be greater than 0';
        isValid = false;
      } else if (data.maxLoanPercentage > 100) {
        newErrors.maxLoanPercentage = 'Maximum loan percentage cannot exceed 100%';
        isValid = false;
      }

      // Validate max loan term
      if (data.maxLoanTerm <= 0) {
        newErrors.maxLoanTerm = 'Maximum loan term must be greater than 0';
        isValid = false;
      } else if (data.maxLoanTerm > 36) {
        newErrors.maxLoanTerm = 'Maximum loan term cannot exceed 36 months';
        isValid = false;
      }

      // Validate interest rate
      if (data.interestRate < 0) {
        newErrors.interestRate = 'Interest rate cannot be negative';
        isValid = false;
      } else if (data.interestRate > 30) {
        newErrors.interestRate = 'Interest rate cannot exceed 30%';
        isValid = false;
      }

      // Validate voting threshold if voting is required
      if (data.requiresVoting) {
        if (data.votingThreshold <= 0) {
          newErrors.votingThreshold = 'Voting threshold must be greater than 0';
          isValid = false;
        } else if (data.votingThreshold > 100) {
          newErrors.votingThreshold = 'Voting threshold cannot exceed 100%';
          isValid = false;
        }
      }
    }

    setErrors(newErrors);
    validateStep(isValid);
    return isValid;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkbox inputs
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      updateData({ [name]: checked });
      return;
    }
    
    // Convert numeric inputs to numbers
    if (type === 'number' || type === 'range') {
      updateData({ [name]: Number(value) });
    } else {
      updateData({ [name]: value });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Loan Policies</h2>
        <p className="mt-1 text-sm text-gray-500">
          Configure loan settings for your savings group.
        </p>
      </div>

      {/* Enable Loans Toggle */}
      <div className="flex items-center">
        <input
          id="enableLoans"
          name="enableLoans"
          type="checkbox"
          checked={data.enableLoans}
          onChange={handleInputChange}
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label htmlFor="enableLoans" className="ml-2 block text-sm font-medium text-gray-700">
          Enable loans for this group
        </label>
      </div>

      {data.enableLoans && (
        <div className="space-y-6 pt-4">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Max Loan Percentage */}
            <div className="col-span-1">
              <label htmlFor="maxLoanPercentage" className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Loan Percentage *
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <input
                  type="number"
                  id="maxLoanPercentage"
                  name="maxLoanPercentage"
                  min="1"
                  max="100"
                  value={data.maxLoanPercentage}
                  onChange={handleInputChange}
                  className={`block w-full pr-12 rounded-md focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                    errors.maxLoanPercentage ? 'border-red-500' : 'border-gray-300'
                  }`}
                  aria-invalid={!!errors.maxLoanPercentage}
                  aria-describedby={errors.maxLoanPercentage ? "max-loan-error" : undefined}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">%</span>
                </div>
              </div>
              {errors.maxLoanPercentage && (
                <p id="max-loan-error" className="mt-1 text-sm text-red-600">
                  {errors.maxLoanPercentage}
                </p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Maximum percentage of group funds a member can borrow.
              </p>
            </div>

            {/* Max Loan Term */}
            <div className="col-span-1">
              <label htmlFor="maxLoanTerm" className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Loan Term (Months) *
              </label>
              <input
                type="number"
                id="maxLoanTerm"
                name="maxLoanTerm"
                min="1"
                max="36"
                value={data.maxLoanTerm}
                onChange={handleInputChange}
                className={`block w-full rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                  errors.maxLoanTerm ? 'border-red-500' : 'border-gray-300'
                }`}
                aria-invalid={!!errors.maxLoanTerm}
                aria-describedby={errors.maxLoanTerm ? "max-term-error" : undefined}
              />
              {errors.maxLoanTerm && (
                <p id="max-term-error" className="mt-1 text-sm text-red-600">
                  {errors.maxLoanTerm}
                </p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Maximum duration for loan repayment.
              </p>
            </div>

            {/* Interest Rate */}
            <div className="col-span-1">
              <label htmlFor="interestRate" className="block text-sm font-medium text-gray-700 mb-1">
                Interest Rate (%) *
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <input
                  type="number"
                  id="interestRate"
                  name="interestRate"
                  min="0"
                  max="30"
                  step="0.5"
                  value={data.interestRate}
                  onChange={handleInputChange}
                  className={`block w-full pr-12 rounded-md focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                    errors.interestRate ? 'border-red-500' : 'border-gray-300'
                  }`}
                  aria-invalid={!!errors.interestRate}
                  aria-describedby={errors.interestRate ? "interest-rate-error" : undefined}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">%</span>
                </div>
              </div>
              {errors.interestRate && (
                <p id="interest-rate-error" className="mt-1 text-sm text-red-600">
                  {errors.interestRate}
                </p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Interest rate charged on loans.
              </p>
            </div>

            {/* Requires Voting */}
            <div className="col-span-1 flex items-start pt-6">
              <div className="flex items-center h-5">
                <input
                  id="requiresVoting"
                  name="requiresVoting"
                  type="checkbox"
                  checked={data.requiresVoting}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="requiresVoting" className="font-medium text-gray-700">
                  Require member voting for loan approval
                </label>
                <p className="text-gray-500">
                  If enabled, loans will require approval from other members.
                </p>
              </div>
            </div>

            {/* Voting Threshold (only if voting is required) */}
            {data.requiresVoting && (
              <div className="col-span-1">
                <label htmlFor="votingThreshold" className="block text-sm font-medium text-gray-700 mb-1">
                  Voting Threshold (%) *
                </label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <input
                    type="number"
                    id="votingThreshold"
                    name="votingThreshold"
                    min="1"
                    max="100"
                    value={data.votingThreshold}
                    onChange={handleInputChange}
                    className={`block w-full pr-12 rounded-md focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                      errors.votingThreshold ? 'border-red-500' : 'border-gray-300'
                    }`}
                    aria-invalid={!!errors.votingThreshold}
                    aria-describedby={errors.votingThreshold ? "voting-threshold-error" : undefined}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">%</span>
                  </div>
                </div>
                {errors.votingThreshold && (
                  <p id="voting-threshold-error" className="mt-1 text-sm text-red-600">
                    {errors.votingThreshold}
                  </p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Percentage of members needed to approve a loan.
                </p>
              </div>
            )}
          </div>

          {/* Loan Example */}
          <div className="mt-8 bg-gray-50 p-4 rounded-md">
            <h3 className="text-sm font-medium text-gray-900">Loan Example</h3>
            <div className="mt-2 text-sm text-gray-700">
              <p>
                With these settings, a member could borrow up to {data.maxLoanPercentage}% of the group funds.
              </p>
              <p className="mt-1">
                For a 100,000 RWF loan over {data.maxLoanTerm} months at {data.interestRate}% interest:
              </p>
              <ul className="list-disc pl-5 mt-1">
                <li>Total interest: {(100000 * (data.interestRate / 100)).toLocaleString()} RWF</li>
                <li>Monthly payment: {Math.round(100000 * (1 + data.interestRate / 100) / data.maxLoanTerm).toLocaleString()} RWF</li>
                <li>Total repayment: {(100000 * (1 + data.interestRate / 100)).toLocaleString()} RWF</li>
              </ul>
              {data.requiresVoting && (
                <p className="mt-1">
                  Loans require approval from at least {data.votingThreshold}% of group members.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {!data.enableLoans && (
        <div className="mt-4 bg-yellow-50 p-4 rounded-md">
          <p className="text-sm text-yellow-700">
            Loans are currently disabled for this group. Members will not be able to request loans from the group funds.
          </p>
        </div>
      )}
    </div>
  );
};

export default LoanPoliciesStep; 