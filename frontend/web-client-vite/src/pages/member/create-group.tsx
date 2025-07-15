import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import CreateGroupWizard from '../../components/groups/CreateGroupWizard';
import type { GroupFormData } from '../../components/groups/CreateGroupWizard';

const CreateGroupPage: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleCreateGroup = async (formData: GroupFormData) => {
    try {
      setIsSubmitting(true);
      
      // Transform the form data to match the API expectations
      const apiData = {
        name: formData.name,
        description: formData.description,
        visibility: formData.visibility,
        contributionAmount: formData.contributionAmount,
        contributionFrequency: formData.contributionFrequency,
        contributionDeadline: formData.contributionDeadline,
        minMembers: formData.minMembers,
        maxMembers: formData.maxMembers,
        payoutMechanism: 'rotation', // Default mechanism
        rules: {
          loanEnabled: formData.enableLoans,
          loanInterestRate: formData.interestRate,
          maxLoanPercentage: formData.maxLoanPercentage,
          maxLoanTerm: formData.maxLoanTerm,
          requiresVoting: formData.requiresVoting,
          voteThreshold: formData.votingThreshold,
          enableKYC: formData.enableKYC
        }
      };

      // In a real app, this would be an API call
      // For demo purposes, we'll simulate a successful creation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Handle file upload separately if there's an icon
      if (formData.icon) {
        // In a real app, this would upload the file to a server
        console.log('Uploading icon:', formData.icon.name);
      }
      
      // Handle invitations
      if (formData.invitations.length > 0) {
        // In a real app, this would send invitations through the API
        console.log('Sending invitations to:', formData.invitations);
      }
      
      // Handle admin contacts
      if (formData.adminContacts.length > 0) {
        // In a real app, this would register admin contacts
        console.log('Registering admin contacts:', formData.adminContacts);
      }
      
      toast.success('Group created successfully! Awaiting approval.');
      
      // Navigate to the group status page
      navigate('/dashboard/member/group-status');
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Failed to create group. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <Button
          variant="ghost"
          className="mr-4"
          onClick={() => navigate('/dashboard/member')}
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Create New Savings Group</h1>
      </div>

      <div className="mb-6">
        <p className="text-gray-600">
          Create a new savings group by filling out the information below. Your group will be reviewed
          by an administrator before becoming active.
        </p>
      </div>

      <CreateGroupWizard onSubmit={handleCreateGroup} isLoading={isSubmitting} />
    </div>
  );
};

export default CreateGroupPage; 