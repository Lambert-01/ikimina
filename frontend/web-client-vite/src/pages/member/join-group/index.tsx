import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Checkbox } from '../../../components/ui/checkbox';
import { toast } from 'react-toastify';
import { Search, ChevronRight, ChevronLeft, Check, Info, AlertCircle } from 'lucide-react';
import { groupService } from '../../../services/groupService';

// Step 1: Find Group Schema
const findGroupSchema = z.object({
  searchTerm: z.string().min(3, { message: "Search term must be at least 3 characters" }),
});

// Step 2: Group Selection Schema
const groupSelectionSchema = z.object({
  groupId: z.string().min(1, { message: "Please select a group" }),
});

// Step 3: Verification Schema
const verificationSchema = z.object({
  inviteCode: z.string().min(6, { message: "Invite code must be at least 6 characters" }),
});

// Step 4: Agreement Schema
const agreementSchema = z.object({
  agreeToRules: z.boolean().refine(val => val === true, {
    message: "You must agree to the group rules",
  }),
  agreeToContributions: z.boolean().refine(val => val === true, {
    message: "You must agree to the contribution schedule",
  }),
});

type FindGroupFormValues = z.infer<typeof findGroupSchema>;
type GroupSelectionFormValues = z.infer<typeof groupSelectionSchema>;
type VerificationFormValues = z.infer<typeof verificationSchema>;
type AgreementFormValues = z.infer<typeof agreementSchema>;

// Define group type
interface Group {
  _id: string;
  id?: string;
  name: string;
  description: string;
  memberCount: number;
  contributionAmount: number;
  contributionFrequency?: string;
  currency?: string;
  isActive?: boolean;
  createdAt?: string;
  rules?: string[];
}

const JoinGroupPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [searchResults, setSearchResults] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    searchTerm: '',
    groupId: '',
    inviteCode: '',
    agreeToRules: false,
    agreeToContributions: false,
    motivation: '',
  });
  
  // Step 1: Find Group Form
  const findGroupForm = useForm<FindGroupFormValues>({
    resolver: zodResolver(findGroupSchema),
    defaultValues: {
      searchTerm: formData.searchTerm,
    },
  });

  // Step 2: Group Selection Form
  const groupSelectionForm = useForm<GroupSelectionFormValues>({
    resolver: zodResolver(groupSelectionSchema),
    defaultValues: {
      groupId: formData.groupId,
    },
  });

  // Step 3: Verification Form
  const verificationForm = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      inviteCode: formData.inviteCode,
    },
  });

  // Step 4: Agreement Form
  const agreementForm = useForm<AgreementFormValues>({
    resolver: zodResolver(agreementSchema),
    defaultValues: {
      agreeToRules: formData.agreeToRules,
      agreeToContributions: formData.agreeToContributions,
    },
  });

  const handleFindGroup = async (data: FindGroupFormValues) => {
    try {
      setIsLoading(true);
      // Call the API to search for public groups
      const response = await groupService.getGroups(`public?search=${data.searchTerm}`);
      
      // Format the response data
      const groups = response.data.map((group: any) => ({
        _id: group.id || group._id,
        id: group.id || group._id,
        name: group.name,
        description: group.description || '',
        memberCount: group.memberCount || 0,
        contributionAmount: group.contributionAmount || 0,
        contributionFrequency: group.contributionSettings?.frequency || 'monthly',
        currency: group.currency || 'RWF',
        isActive: group.isActive !== false,
        createdAt: group.createdAt,
        rules: [
          'Members must contribute regularly',
          'Follow all group guidelines',
          'Participate in group meetings when scheduled'
        ]
      }));
      
      setSearchResults(groups);
      setFormData(prev => ({ ...prev, searchTerm: data.searchTerm }));
      
      if (groups.length === 0) {
        toast.info('No groups found matching your search term');
      } else {
        // Automatically move to the next step if we found groups
        setCurrentStep(2);
      }
    } catch (error) {
      console.error('Error searching for groups:', error);
      toast.error('Failed to search for groups. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectGroup = (data: GroupSelectionFormValues) => {
    const group = searchResults.find(g => g._id === data.groupId || g.id === data.groupId);
    setSelectedGroup(group || null);
    setFormData(prev => ({ ...prev, groupId: data.groupId }));
    setCurrentStep(3);
  };

  const handleVerification = (data: VerificationFormValues) => {
    setFormData(prev => ({ ...prev, inviteCode: data.inviteCode }));
    
    // Move to the agreement step
    toast.success('Verification successful!');
    setCurrentStep(4);
  };

  const handleAgreement = async (data: AgreementFormValues) => {
    setFormData(prev => ({ 
      ...prev, 
      agreeToRules: data.agreeToRules,
      agreeToContributions: data.agreeToContributions 
    }));
    
    try {
      setIsLoading(true);
      
      if (!selectedGroup) {
        toast.error('No group selected');
        return;
      }
      
      // Prepare join request data
      const joinData = {
        groupId: selectedGroup._id || selectedGroup.id || '',
        motivation: 'I would like to join this group to save together and achieve my financial goals.',
        phoneNumber: '', // This should be populated from user profile in a real app
        email: '' // This should be populated from user profile in a real app
      };
      
      // Call the API to join the group
      await groupService.joinGroup(joinData.groupId, joinData);
      
      toast.success('Group join request submitted successfully!');
      
      // Redirect to group status page
      setTimeout(() => {
        navigate('/member/group-status');
      }, 1500);
    } catch (error) {
      console.error('Error joining group:', error);
      toast.error('Failed to join group. Please try again.');
    } finally {
      setIsLoading(false);
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
      <h1 className="text-2xl font-bold mb-2">Join a Savings Group</h1>
      <p className="text-gray-600 mb-6">Connect with an existing savings group in your community</p>
      
      {renderStepIndicator()}
      
      <Card>
        <CardHeader>
          <CardTitle>
            {currentStep === 1 && 'Find a Group'}
            {currentStep === 2 && 'Select a Group'}
            {currentStep === 3 && 'Verification'}
            {currentStep === 4 && 'Group Agreement'}
          </CardTitle>
          <CardDescription>
            {currentStep === 1 && 'Search for a savings group by name or location'}
            {currentStep === 2 && 'Review and select from available groups'}
            {currentStep === 3 && 'Enter the invitation code provided by the group manager'}
            {currentStep === 4 && 'Review and accept the group rules and contribution schedule'}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Step 1: Find Group */}
          {currentStep === 1 && (
            <form onSubmit={findGroupForm.handleSubmit(handleFindGroup)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="searchTerm">Search for a group</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="searchTerm"
                    placeholder="Enter group name or location"
                    className="pl-10"
                    {...findGroupForm.register('searchTerm')}
                  />
                </div>
                {findGroupForm.formState.errors.searchTerm && (
                  <p className="text-sm text-red-500">{findGroupForm.formState.errors.searchTerm.message}</p>
                )}
              </div>
              
              <div className="bg-blue-50 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Info className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      You can also ask your group manager for a direct invitation link.
                    </p>
                  </div>
                </div>
              </div>
            </form>
          )}
          
          {/* Step 2: Group Selection */}
          {currentStep === 2 && (
            <form onSubmit={groupSelectionForm.handleSubmit(handleSelectGroup)} className="space-y-4">
              {searchResults.length > 0 ? (
                <div className="space-y-4">
                  {searchResults.map(group => (
                    <div 
                      key={group._id}
                      className={`border rounded-md p-4 cursor-pointer transition-all ${
                        formData.groupId === group._id || formData.groupId === group.id
                          ? 'border-primary-500 bg-primary-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => {
                        groupSelectionForm.setValue('groupId', group._id || group.id || '');
                        setFormData(prev => ({ ...prev, groupId: group._id || group.id || '' }));
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{group.name}</h3>
                          <p className="text-sm text-gray-500">{group.description}</p>
                          <div className="mt-2 flex space-x-4">
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                              {group.memberCount} members
                            </span>
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                              {group.contributionFrequency?.toLowerCase()}
                            </span>
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                              {group.contributionAmount} {group.currency || 'RWF'}
                            </span>
                          </div>
                        </div>
                        <input 
                          type="radio" 
                          value={group._id || group.id || ''}
                          checked={formData.groupId === group._id || formData.groupId === group.id}
                          onChange={() => {
                            groupSelectionForm.setValue('groupId', group._id || group.id || '');
                            setFormData(prev => ({ ...prev, groupId: group._id || group.id || '' }));
                          }}
                          className="h-5 w-5 text-primary-600"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No groups found</h3>
                  <p className="text-gray-500 mt-2">Try a different search term or ask your group manager for an invitation.</p>
                </div>
              )}
              
              {groupSelectionForm.formState.errors.groupId && (
                <p className="text-sm text-red-500">{groupSelectionForm.formState.errors.groupId.message}</p>
              )}
            </form>
          )}
          
          {/* Step 3: Verification */}
          {currentStep === 3 && selectedGroup && (
            <form onSubmit={verificationForm.handleSubmit(handleVerification)} className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium text-gray-900 mb-2">Selected Group: {selectedGroup.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{selectedGroup.description}</p>
                <div className="text-sm">
                  <p className="font-medium text-gray-700">Contribution Details:</p>
                  <p className="text-gray-600">{selectedGroup.contributionAmount} {selectedGroup.currency || 'RWF'} {selectedGroup.contributionFrequency?.toLowerCase()}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="inviteCode">Enter Invitation Code</Label>
                <Input
                  id="inviteCode"
                  placeholder="Enter the 6-digit code from your group manager"
                  {...verificationForm.register('inviteCode')}
                />
                {verificationForm.formState.errors.inviteCode && (
                  <p className="text-sm text-red-500">{verificationForm.formState.errors.inviteCode.message}</p>
                )}
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Info className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Contact your group manager if you haven't received an invitation code.
                    </p>
                  </div>
                </div>
              </div>
            </form>
          )}
          
          {/* Step 4: Agreement */}
          {currentStep === 4 && selectedGroup && (
            <form onSubmit={agreementForm.handleSubmit(handleAgreement)} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Group Rules</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                      {selectedGroup.rules?.map((rule, index) => (
                        <li key={index}>{rule}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="agreeToRules"
                    checked={formData.agreeToRules}
                    onCheckedChange={(checked: boolean) => {
                      agreementForm.setValue('agreeToRules', checked);
                      setFormData(prev => ({ ...prev, agreeToRules: checked }));
                    }}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="agreeToRules"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I agree to follow all group rules
                    </label>
                  </div>
                </div>
                {agreementForm.formState.errors.agreeToRules && (
                  <p className="text-sm text-red-500">{agreementForm.formState.errors.agreeToRules.message}</p>
                )}
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Contribution Schedule</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-600 mb-2">
                      By joining this group, you agree to contribute {selectedGroup.contributionAmount} {selectedGroup.currency || 'RWF'} {selectedGroup.contributionFrequency?.toLowerCase()}.
                    </p>
                    <p className="text-sm text-gray-600">
                      Missed contributions may result in penalties according to group rules.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="agreeToContributions"
                    checked={formData.agreeToContributions}
                    onCheckedChange={(checked: boolean) => {
                      agreementForm.setValue('agreeToContributions', checked);
                      setFormData(prev => ({ ...prev, agreeToContributions: checked }));
                    }}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="agreeToContributions"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I agree to make regular contributions as scheduled
                    </label>
                  </div>
                </div>
                {agreementForm.formState.errors.agreeToContributions && (
                  <p className="text-sm text-red-500">{agreementForm.formState.errors.agreeToContributions.message}</p>
                )}
              </div>
            </form>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={() => setCurrentStep(currentStep - 1)}
              disabled={isLoading}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          
          {currentStep === 1 && (
            <Button 
              type="button" 
              onClick={findGroupForm.handleSubmit(handleFindGroup)}
              disabled={isLoading || findGroupForm.formState.isSubmitting}
              className="ml-auto"
            >
              {isLoading ? 'Searching...' : 'Search'}
              {!isLoading && <ChevronRight className="h-4 w-4 ml-2" />}
            </Button>
          )}
          
          {currentStep === 2 && (
            <Button 
              type="button" 
              onClick={groupSelectionForm.handleSubmit(handleSelectGroup)}
              disabled={isLoading || !formData.groupId || groupSelectionForm.formState.isSubmitting}
            >
              Continue
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
          
          {currentStep === 3 && (
            <Button 
              type="button" 
              onClick={verificationForm.handleSubmit(handleVerification)}
              disabled={isLoading || verificationForm.formState.isSubmitting}
            >
              Verify
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
          
          {currentStep === 4 && (
            <Button 
              type="button" 
              onClick={agreementForm.handleSubmit(handleAgreement)}
              disabled={isLoading || !formData.agreeToRules || !formData.agreeToContributions || agreementForm.formState.isSubmitting}
            >
              {isLoading ? 'Submitting...' : 'Join Group'}
              {!isLoading && <ChevronRight className="h-4 w-4 ml-2" />}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default JoinGroupPage; 