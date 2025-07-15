import React, { useState } from 'react';
import { Check, ChevronRight, ChevronLeft, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

// Import step components
import GroupInfoStep from './wizard-steps/GroupInfoStep';
import ContributionRulesStep from './wizard-steps/ContributionRulesStep';
import LoanPoliciesStep from './wizard-steps/LoanPoliciesStep';
import ComplianceSettingsStep from './wizard-steps/ComplianceSettingsStep';
import InviteMembersStep from './wizard-steps/InviteMembersStep';
import ReviewStep from './wizard-steps/ReviewStep';

// Types
export interface GroupFormData {
  // Group Info
  name: string;
  description: string;
  icon?: File | null;
  visibility: 'public' | 'private' | 'unlisted';
  
  // Contribution Rules
  contributionAmount: number;
  contributionFrequency: 'weekly' | 'biweekly' | 'monthly';
  contributionDeadline: number; // Days from cycle start
  contributionCurrency: string;
  minMembers: number;
  maxMembers: number;
  
  // Loan Policies
  enableLoans: boolean;
  maxLoanPercentage: number;
  maxLoanTerm: number;
  interestRate: number;
  requiresVoting: boolean;
  votingThreshold: number; // Percentage needed to approve
  
  // Compliance Settings
  enableKYC: boolean;
  adminContacts: {
    name: string;
    email?: string;
    phone?: string;
    role: string;
  }[];
  
  // Invite Members
  invitations: {
    email?: string;
    phoneNumber?: string;
    role: 'member' | 'manager';
  }[];
}

interface CreateGroupWizardProps {
  onSubmit: (data: GroupFormData) => Promise<void>;
  isLoading?: boolean;
}

const STEPS = [
  'Group Information',
  'Contribution Rules',
  'Loan Policies',
  'Compliance Settings',
  'Invite Members',
  'Review & Submit'
];

const CreateGroupWizard: React.FC<CreateGroupWizardProps> = ({ 
  onSubmit,
  isLoading = false
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<GroupFormData>({
    // Group Info
    name: '',
    description: '',
    icon: null,
    visibility: 'private',
    
    // Contribution Rules
    contributionAmount: 5000,
    contributionFrequency: 'monthly',
    contributionDeadline: 5,
    contributionCurrency: 'RWF',
    minMembers: 5,
    maxMembers: 20,
    
    // Loan Policies
    enableLoans: true,
    maxLoanPercentage: 80,
    maxLoanTerm: 6,
    interestRate: 5,
    requiresVoting: true,
    votingThreshold: 50,
    
    // Compliance Settings
    enableKYC: false,
    adminContacts: [{ name: '', role: 'president' }],
    
    // Invite Members
    invitations: []
  });

  // Step validation state
  const [stepValidation, setStepValidation] = useState<boolean[]>([
    false, false, false, false, false, true
  ]);

  // Update form data
  const updateFormData = (stepData: Partial<GroupFormData>) => {
    setFormData(prev => ({ ...prev, ...stepData }));
  };

  // Validate current step
  const validateCurrentStep = (isValid: boolean) => {
    const newValidation = [...stepValidation];
    newValidation[currentStep] = isValid;
    setStepValidation(newValidation);
  };

  // Next step handler
  const handleNextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  // Previous step handler
  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  // Render the current step
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <GroupInfoStep 
            data={formData} 
            updateData={updateFormData} 
            validateStep={validateCurrentStep} 
          />
        );
      case 1:
        return (
          <ContributionRulesStep 
            data={formData} 
            updateData={updateFormData} 
            validateStep={validateCurrentStep} 
          />
        );
      case 2:
        return (
          <LoanPoliciesStep 
            data={formData} 
            updateData={updateFormData} 
            validateStep={validateCurrentStep} 
          />
        );
      case 3:
        return (
          <ComplianceSettingsStep 
            data={formData} 
            updateData={updateFormData} 
            validateStep={validateCurrentStep} 
          />
        );
      case 4:
        return (
          <InviteMembersStep 
            data={formData} 
            updateData={updateFormData} 
            validateStep={validateCurrentStep} 
          />
        );
      case 5:
        return (
          <ReviewStep 
            data={formData} 
            updateData={updateFormData} 
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="hidden sm:block">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {STEPS.map((step, index) => (
                <button
                  key={step}
                  onClick={() => index < currentStep && setCurrentStep(index)}
                  disabled={index > currentStep}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    index === currentStep
                      ? 'border-primary-600 text-primary-600'
                      : index < currentStep
                      ? 'border-green-500 text-green-500 hover:border-green-600 hover:text-green-600'
                      : 'border-transparent text-gray-400 cursor-not-allowed'
                  } ${index === 0 ? 'ml-0' : 'ml-8'}`}
                >
                  <div className="flex items-center">
                    <span
                      className={`flex items-center justify-center w-6 h-6 rounded-full mr-2 ${
                        index < currentStep
                          ? 'bg-green-500 text-white'
                          : index === currentStep
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {index < currentStep ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        index + 1
                      )}
                    </span>
                    {step}
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>
        
        {/* Mobile steps indicator */}
        <div className="sm:hidden">
          <p className="text-sm font-medium text-gray-500">
            Step {currentStep + 1} of {STEPS.length}
          </p>
          <h3 className="mt-1 text-lg font-medium text-gray-900">
            {STEPS[currentStep]}
          </h3>
        </div>
      </div>
      
      {/* Step Content */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit}>
            {renderStep()}
            
            {/* Navigation Buttons */}
            <div className="mt-8 flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevStep}
                disabled={currentStep === 0}
                className="flex items-center"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              {currentStep < STEPS.length - 1 ? (
                <Button
                  type="button"
                  onClick={handleNextStep}
                  disabled={!stepValidation[currentStep]}
                  className="flex items-center"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Group...' : 'Create Group'}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
      
      {/* Help Text */}
      <div className="mt-6 bg-blue-50 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-blue-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Information</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                After submission, your group will be reviewed by an administrator before becoming active.
                You will be automatically assigned as the group manager once approved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupWizard; 