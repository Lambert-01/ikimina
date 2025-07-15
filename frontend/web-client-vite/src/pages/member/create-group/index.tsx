import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Textarea } from '../../../components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '../../../components/ui/radio-group';
import { Switch } from '../../../components/ui/switch';
import { toast } from 'react-toastify';
import { Check, ChevronRight, ChevronLeft, Info, Users, Calendar, CreditCard } from 'lucide-react';
import { groupService } from '../../../services/groupService';

// Step 1: Basic Information Schema
const basicInfoSchema = z.object({
  groupName: z.string().min(3, { message: "Group name must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  groupType: z.enum(["savings", "investment", "loan", "mixed"], {
    required_error: "Please select a group type",
  }),
});

// Step 2: Contribution Settings Schema
const contributionSchema = z.object({
  contributionAmount: z.string().min(1, { message: "Please enter a contribution amount" })
    .refine(val => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Amount must be a positive number",
    }),
  contributionFrequency: z.enum(["weekly", "biweekly", "monthly"], {
    required_error: "Please select a contribution frequency",
  }),
  startDate: z.string().min(1, { message: "Please select a start date" }),
  allowPartialPayments: z.boolean(),
});

// Step 3: Loan Settings Schema
const loanSchema = z.object({
  enableLoans: z.boolean(),
  interestRate: z.string()
    .refine(val => !val || (!isNaN(Number(val)) && Number(val) >= 0), {
      message: "Interest rate must be a positive number",
    }),
  maxLoanMultiplier: z.string()
    .refine(val => !val || (!isNaN(Number(val)) && Number(val) > 0), {
      message: "Multiplier must be a positive number",
    }),
  loanDurationMonths: z.string()
    .refine(val => !val || (!isNaN(Number(val)) && Number(val) > 0), {
      message: "Duration must be a positive number",
    }),
});

// Step 4: Member Settings Schema
const memberSchema = z.object({
  maxMembers: z.string()
    .refine(val => !isNaN(Number(val)) && Number(val) > 0 && Number(val) <= 50, {
      message: "Max members must be between 1 and 50",
    }),
  requireApproval: z.boolean(),
  inviteOnly: z.boolean(),
});

type BasicInfoFormValues = z.infer<typeof basicInfoSchema>;
type ContributionFormValues = z.infer<typeof contributionSchema>;
type LoanFormValues = z.infer<typeof loanSchema>;
type MemberFormValues = z.infer<typeof memberSchema>;

const CreateGroupPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    groupName: '',
    description: '',
    groupType: 'savings' as const,
    contributionAmount: '',
    contributionFrequency: 'monthly' as const,
    startDate: '',
    allowPartialPayments: false,
    enableLoans: true,
    interestRate: '5',
    maxLoanMultiplier: '3',
    loanDurationMonths: '6',
    maxMembers: '20',
    requireApproval: true,
    inviteOnly: true,
  });
  
  // Step 1: Basic Information Form
  const basicInfoForm = useForm<BasicInfoFormValues>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      groupName: formData.groupName,
      description: formData.description,
      groupType: formData.groupType,
    },
  });

  // Step 2: Contribution Settings Form
  const contributionForm = useForm<ContributionFormValues>({
    resolver: zodResolver(contributionSchema),
    defaultValues: {
      contributionAmount: formData.contributionAmount,
      contributionFrequency: formData.contributionFrequency,
      startDate: formData.startDate,
      allowPartialPayments: formData.allowPartialPayments,
    },
  });

  // Step 3: Loan Settings Form
  const loanForm = useForm<LoanFormValues>({
    resolver: zodResolver(loanSchema),
    defaultValues: {
      enableLoans: formData.enableLoans,
      interestRate: formData.interestRate,
      maxLoanMultiplier: formData.maxLoanMultiplier,
      loanDurationMonths: formData.loanDurationMonths,
    },
  });

  // Step 4: Member Settings Form
  const memberForm = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      maxMembers: formData.maxMembers,
      requireApproval: formData.requireApproval,
      inviteOnly: formData.inviteOnly,
    },
  });

  const handleBasicInfoSubmit = (data: BasicInfoFormValues) => {
    setFormData(prev => ({ 
      ...prev, 
      groupName: data.groupName,
      description: data.description,
      groupType: data.groupType,
    }));
    setCurrentStep(2);
  };

  const handleContributionSubmit = (data: ContributionFormValues) => {
    setFormData(prev => ({ 
      ...prev, 
      contributionAmount: data.contributionAmount,
      contributionFrequency: data.contributionFrequency,
      startDate: data.startDate,
      allowPartialPayments: data.allowPartialPayments,
    }));
    setCurrentStep(3);
  };

  const handleLoanSubmit = (data: LoanFormValues) => {
    setFormData(prev => ({ 
      ...prev, 
      enableLoans: data.enableLoans,
      interestRate: data.interestRate,
      maxLoanMultiplier: data.maxLoanMultiplier,
      loanDurationMonths: data.loanDurationMonths,
    }));
    setCurrentStep(4);
  };

  const handleMemberSubmit = async (data: MemberFormValues) => {
    setFormData(prev => ({ 
      ...prev, 
      maxMembers: data.maxMembers,
      requireApproval: data.requireApproval,
      inviteOnly: data.inviteOnly,
    }));
    
    try {
      setIsSubmitting(true);
      
      // Prepare the data for the API
      const groupData = {
        name: formData.groupName,
        description: formData.description,
        contributionAmount: parseFloat(formData.contributionAmount),
        contributionFrequency: formData.contributionFrequency,
        isPublic: !formData.inviteOnly,
        maxMembers: parseInt(data.maxMembers),
        loanEnabled: formData.enableLoans,
        loanInterestRate: parseFloat(formData.interestRate),
        loanMaxAmount: parseFloat(formData.maxLoanMultiplier) * 100, // Convert to percentage
        loanMaxDuration: parseInt(formData.loanDurationMonths) * 30, // Convert to days
        gracePeriod: 3, // Default grace period of 3 days
        lateFee: 0 // Default no late fee
      };
      
      // Call the API to create the group
      const response = await groupService.createGroup(groupData);
      
      toast.success('Group created successfully!');
      
      // Redirect to the new group page
      setTimeout(() => {
        navigate(`/member/group/${response.data.id}`);
      }, 1500);
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Failed to create group. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => {
    return (
      <div className="flex justify-center mb-8">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === currentStep 
                  ? 'bg-primary-600 text-white' 
                  : step < currentStep 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-600'
              }`}
            >
              {step < currentStep ? <Check size={16} /> : step}
            </div>
            {step < 4 && (
              <div 
                className={`w-12 h-1 ${
                  step < currentStep ? 'bg-green-500' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Create a New Savings Group</h1>
      <p className="text-gray-600 mb-6">Set up your community savings group with customized rules and settings</p>
      
      {renderStepIndicator()}
      
      <Card>
        <CardHeader>
          <CardTitle>
            {currentStep === 1 && 'Basic Information'}
            {currentStep === 2 && 'Contribution Settings'}
            {currentStep === 3 && 'Loan Settings'}
            {currentStep === 4 && 'Member Settings'}
          </CardTitle>
          <CardDescription>
            {currentStep === 1 && 'Provide general information about your savings group'}
            {currentStep === 2 && 'Configure how members will contribute to the group'}
            {currentStep === 3 && 'Set up loan options for group members'}
            {currentStep === 4 && 'Define membership rules and access settings'}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <form onSubmit={basicInfoForm.handleSubmit(handleBasicInfoSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="groupName">Group Name</Label>
                <Input
                  id="groupName"
                  placeholder="Enter a name for your group"
                  {...basicInfoForm.register('groupName')}
                />
                {basicInfoForm.formState.errors.groupName && (
                  <p className="text-sm text-red-500">{basicInfoForm.formState.errors.groupName.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the purpose and goals of your group"
                  {...basicInfoForm.register('description')}
                />
                {basicInfoForm.formState.errors.description && (
                  <p className="text-sm text-red-500">{basicInfoForm.formState.errors.description.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label>Group Type</Label>
                <RadioGroup 
                  defaultValue={formData.groupType}
                  onValueChange={(value: "savings" | "investment" | "loan" | "mixed") => {
                    basicInfoForm.setValue('groupType', value);
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="savings" id="savings" />
                    <Label htmlFor="savings">Savings Group</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="investment" id="investment" />
                    <Label htmlFor="investment">Investment Group</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="loan" id="loan" />
                    <Label htmlFor="loan">Loan Circle</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mixed" id="mixed" />
                    <Label htmlFor="mixed">Mixed Purpose</Label>
                  </div>
                </RadioGroup>
                {basicInfoForm.formState.errors.groupType && (
                  <p className="text-sm text-red-500">{basicInfoForm.formState.errors.groupType.message}</p>
                )}
              </div>
              
              <div className="bg-blue-50 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Info className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      Your group will be created with you as the manager. You can add members after setup is complete.
                    </p>
                  </div>
                </div>
              </div>
            </form>
          )}
          
          {/* Step 2: Contribution Settings */}
          {currentStep === 2 && (
            <form onSubmit={contributionForm.handleSubmit(handleContributionSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="contributionAmount">Contribution Amount (RWF)</Label>
                <div className="relative">
                  <Input
                    id="contributionAmount"
                    type="number"
                    min="0"
                    placeholder="e.g., 5000"
                    {...contributionForm.register('contributionAmount')}
                  />
                </div>
                {contributionForm.formState.errors.contributionAmount && (
                  <p className="text-sm text-red-500">{contributionForm.formState.errors.contributionAmount.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contributionFrequency">Contribution Frequency</Label>
                <Select 
                  defaultValue={formData.contributionFrequency}
                  onValueChange={(value: "weekly" | "biweekly" | "monthly") => {
                    contributionForm.setValue('contributionFrequency', value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Bi-weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
                {contributionForm.formState.errors.contributionFrequency && (
                  <p className="text-sm text-red-500">{contributionForm.formState.errors.contributionFrequency.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  {...contributionForm.register('startDate')}
                />
                {contributionForm.formState.errors.startDate && (
                  <p className="text-sm text-red-500">{contributionForm.formState.errors.startDate.message}</p>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="allowPartialPayments"
                  checked={formData.allowPartialPayments}
                  onCheckedChange={(checked) => {
                    contributionForm.setValue('allowPartialPayments', checked);
                    setFormData(prev => ({ ...prev, allowPartialPayments: checked }));
                  }}
                />
                <Label htmlFor="allowPartialPayments">Allow partial payments</Label>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Payment Schedule</h4>
                    <p className="text-xs text-gray-600 mt-1">
                      Members will be reminded to contribute {formData.contributionFrequency === 'weekly' ? 'every week' : 
                        formData.contributionFrequency === 'biweekly' ? 'every two weeks' : 'every month'}.
                      You can adjust the schedule later if needed.
                    </p>
                  </div>
                </div>
              </div>
            </form>
          )}
          
          {/* Step 3: Loan Settings */}
          {currentStep === 3 && (
            <form onSubmit={loanForm.handleSubmit(handleLoanSubmit)} className="space-y-6">
              <div className="flex items-center space-x-2 mb-6">
                <Switch
                  id="enableLoans"
                  checked={formData.enableLoans}
                  onCheckedChange={(checked) => {
                    loanForm.setValue('enableLoans', checked);
                    setFormData(prev => ({ ...prev, enableLoans: checked }));
                  }}
                />
                <Label htmlFor="enableLoans">Enable loans for this group</Label>
              </div>
              
              {formData.enableLoans && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="interestRate">Interest Rate (%)</Label>
                    <Input
                      id="interestRate"
                      type="number"
                      min="0"
                      step="0.1"
                      placeholder="e.g., 5"
                      {...loanForm.register('interestRate')}
                    />
                    {loanForm.formState.errors.interestRate && (
                      <p className="text-sm text-red-500">{loanForm.formState.errors.interestRate.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="maxLoanMultiplier">
                      Maximum Loan Amount (as multiple of member's contributions)
                    </Label>
                    <Input
                      id="maxLoanMultiplier"
                      type="number"
                      min="1"
                      step="0.5"
                      placeholder="e.g., 3"
                      {...loanForm.register('maxLoanMultiplier')}
                    />
                    {loanForm.formState.errors.maxLoanMultiplier && (
                      <p className="text-sm text-red-500">{loanForm.formState.errors.maxLoanMultiplier.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="loanDurationMonths">Maximum Loan Duration (months)</Label>
                    <Input
                      id="loanDurationMonths"
                      type="number"
                      min="1"
                      placeholder="e.g., 6"
                      {...loanForm.register('loanDurationMonths')}
                    />
                    {loanForm.formState.errors.loanDurationMonths && (
                      <p className="text-sm text-red-500">{loanForm.formState.errors.loanDurationMonths.message}</p>
                    )}
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="flex items-start">
                      <CreditCard className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Loan Calculation Example</h4>
                        <p className="text-xs text-gray-600 mt-1">
                          With these settings, a member who has contributed 100,000 RWF could borrow up to {formData.maxLoanMultiplier ? Number(formData.maxLoanMultiplier) * 100000 : 0} RWF,
                          with {formData.interestRate}% interest, to be repaid within {formData.loanDurationMonths} months.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              {!formData.enableLoans && (
                <div className="bg-yellow-50 p-4 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Info className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        Loans are disabled for this group. Members will only be able to save and withdraw their contributions.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </form>
          )}
          
          {/* Step 4: Member Settings */}
          {currentStep === 4 && (
            <form onSubmit={memberForm.handleSubmit(handleMemberSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="maxMembers">Maximum Number of Members</Label>
                <Input
                  id="maxMembers"
                  type="number"
                  min="2"
                  max="50"
                  placeholder="e.g., 20"
                  {...memberForm.register('maxMembers')}
                />
                {memberForm.formState.errors.maxMembers && (
                  <p className="text-sm text-red-500">{memberForm.formState.errors.maxMembers.message}</p>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="requireApproval"
                  checked={formData.requireApproval}
                  onCheckedChange={(checked) => {
                    memberForm.setValue('requireApproval', checked);
                    setFormData(prev => ({ ...prev, requireApproval: checked }));
                  }}
                />
                <Label htmlFor="requireApproval">Require manager approval for new members</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="inviteOnly"
                  checked={formData.inviteOnly}
                  onCheckedChange={(checked) => {
                    memberForm.setValue('inviteOnly', checked);
                    setFormData(prev => ({ ...prev, inviteOnly: checked }));
                  }}
                />
                <Label htmlFor="inviteOnly">Make this an invite-only group</Label>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex items-start">
                  <Users className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Member Management</h4>
                    <p className="text-xs text-gray-600 mt-1">
                      As the group manager, you'll be able to invite members, approve join requests,
                      and manage member permissions after the group is created.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Check className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Ready to create your group</h3>
                    <p className="text-sm text-green-700 mt-1">
                      Review your settings and click "Create Group" to finalize. You can adjust these settings later.
                    </p>
                  </div>
                </div>
              </div>
            </form>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={() => setCurrentStep(currentStep - 1)}
              disabled={isSubmitting}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          
          {currentStep === 1 && (
            <Button 
              type="button" 
              onClick={basicInfoForm.handleSubmit(handleBasicInfoSubmit)}
              disabled={basicInfoForm.formState.isSubmitting}
              className="ml-auto"
            >
              Continue
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
          
          {currentStep === 2 && (
            <Button 
              type="button" 
              onClick={contributionForm.handleSubmit(handleContributionSubmit)}
              disabled={contributionForm.formState.isSubmitting}
            >
              Continue
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
          
          {currentStep === 3 && (
            <Button 
              type="button" 
              onClick={loanForm.handleSubmit(handleLoanSubmit)}
              disabled={loanForm.formState.isSubmitting}
            >
              Continue
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
          
          {currentStep === 4 && (
            <Button 
              type="button" 
              onClick={memberForm.handleSubmit(handleMemberSubmit)}
              disabled={isSubmitting || memberForm.formState.isSubmitting}
            >
              {isSubmitting ? 'Creating Group...' : 'Create Group'}
              {!isSubmitting && <ChevronRight className="h-4 w-4 ml-2" />}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default CreateGroupPage; 