import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import CreateGroupWizard from '../../components/groups/CreateGroupWizard';
import type { GroupFormData } from '../../components/groups/CreateGroupWizard';
import { groupService } from '../../services';

const CreateGroupPage: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleCreateGroup = async (formData: GroupFormData) => {
    try {
      setIsSubmitting(true);
      // Build payload to match backend /api/groups
      const payload = {
        name: formData.name,
        description: formData.description,
        groupType: 'savings',
        contributionSettings: {
          amount: formData.contributionAmount,
          frequency: formData.contributionFrequency,
          dueDay: formData.contributionDeadline,
          penaltyType: 'none'
        },
        loanSettings: {
          enabled: formData.enableLoans,
          interestRate: formData.interestRate,
          maxLoanMultiplier: Math.ceil(formData.maxLoanPercentage / 10),
          maxDurationMonths: formData.maxLoanTerm,
          requiresApproval: formData.requiresVoting,
          minimumContributions: 1
        },
        meetingSettings: {
          frequency: formData.contributionFrequency,
          time: '14:00',
          location: 'Virtual'
        },
        visibility: formData.visibility,
        invitations: formData.invitations
      } as any;

      const resp = await groupService.createGroup(payload);
      if (resp?.success) {
        // Show detailed success message with approval information
        toast.success(
          'Group created successfully! Your group has been submitted for admin approval.',
          { autoClose: 5000 }
        );
        
        // Navigate to my groups page where they can track status
        navigate('/member/my-groups', { 
          state: { 
            message: 'Your group has been submitted for approval. You will be notified once it\'s reviewed.',
            newGroupId: resp.data?.id 
          }
        });
      } else {
        throw new Error(resp?.message || 'Failed to create group');
      }
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
          onClick={() => navigate('/member')}
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