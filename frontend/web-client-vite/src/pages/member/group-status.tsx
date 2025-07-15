import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Clock, AlertTriangle, X, ChevronRight } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { groupService } from '../../services';

// Group status types
type GroupStatus = 'pending' | 'approved' | 'rejected';

interface GroupStatusData {
  id: string;
  name: string;
  status: GroupStatus;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
  reviewNotes?: string;
  adminContact?: string;
}

const GroupStatusPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [groupStatus, setGroupStatus] = useState<GroupStatusData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroupStatus = async () => {
      try {
        setLoading(true);
        // In a real implementation, this would fetch from the API
        // For demo purposes, we'll simulate a pending group
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulated data
        setGroupStatus({
          id: 'g12345',
          name: 'Umurenge Savings Group',
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Error fetching group status:', err);
        setError('Failed to load group status. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchGroupStatus();
  }, []);

  // Render loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading group status...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="bg-red-100 p-2 rounded-full inline-flex items-center justify-center mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Group Status</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render no group state
  if (!groupStatus) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">No Pending Groups</h2>
              <p className="text-gray-600 mb-6">
                You don't have any groups pending approval. Create a new group to get started.
              </p>
              <Button onClick={() => navigate('/dashboard/member/create-group')}>
                Create New Group
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Format date for display
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status details based on group status
  const getStatusDetails = () => {
    switch (groupStatus.status) {
      case 'pending':
        return {
          icon: <Clock className="h-8 w-8 text-yellow-500" />,
          color: 'yellow',
          title: 'Pending Approval',
          description: 'Your group is currently under review by an administrator.',
          estimatedTime: '1-2 business days'
        };
      case 'approved':
        return {
          icon: <CheckCircle className="h-8 w-8 text-green-500" />,
          color: 'green',
          title: 'Group Approved',
          description: 'Your group has been approved and is now active.',
          actionLabel: 'Go to Group Dashboard'
        };
      case 'rejected':
        return {
          icon: <X className="h-8 w-8 text-red-500" />,
          color: 'red',
          title: 'Group Rejected',
          description: 'Your group application was not approved.',
          actionLabel: 'Create New Group'
        };
      default:
        return {
          icon: <AlertTriangle className="h-8 w-8 text-gray-500" />,
          color: 'gray',
          title: 'Unknown Status',
          description: 'The status of your group is unknown.'
        };
    }
  };

  const statusDetails = getStatusDetails();
  const statusColorClass = `bg-${statusDetails.color}-100 border-${statusDetails.color}-200`;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Group Status</h1>
      
      <Card className={`border ${statusColorClass}`}>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center mb-6">
            <div className={`bg-${statusDetails.color}-100 p-3 rounded-full mb-4`}>
              {statusDetails.icon}
            </div>
            <h2 className="text-xl font-bold text-gray-900">{statusDetails.title}</h2>
            <p className="text-gray-600 mt-2">{statusDetails.description}</p>
            
            {groupStatus.status === 'pending' && (
              <p className="text-sm text-gray-500 mt-2">
                Estimated review time: {statusDetails.estimatedTime}
              </p>
            )}
            
            {groupStatus.status === 'rejected' && groupStatus.reviewNotes && (
              <div className="mt-4 p-4 bg-red-50 rounded-md text-left w-full">
                <h3 className="text-sm font-medium text-red-800">Rejection Reason:</h3>
                <p className="mt-1 text-sm text-red-700">{groupStatus.reviewNotes}</p>
              </div>
            )}
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            <dl className="divide-y divide-gray-200">
              <div className="py-3 flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Group Name</dt>
                <dd className="text-sm text-gray-900">{groupStatus.name}</dd>
              </div>
              <div className="py-3 flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Group ID</dt>
                <dd className="text-sm text-gray-900">{groupStatus.id}</dd>
              </div>
              <div className="py-3 flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Submission Date</dt>
                <dd className="text-sm text-gray-900">{formatDate(groupStatus.createdAt)}</dd>
              </div>
              {groupStatus.reviewedAt && (
                <div className="py-3 flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Review Date</dt>
                  <dd className="text-sm text-gray-900">{formatDate(groupStatus.reviewedAt)}</dd>
                </div>
              )}
              {groupStatus.adminContact && (
                <div className="py-3 flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Admin Contact</dt>
                  <dd className="text-sm text-gray-900">{groupStatus.adminContact}</dd>
                </div>
              )}
            </dl>
          </div>
          
          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
            {groupStatus.status === 'approved' && (
              <Button onClick={() => navigate(`/dashboard/member/group/${groupStatus.id}`)}>
                Go to Group Dashboard
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
            
            {groupStatus.status === 'rejected' && (
              <Button onClick={() => navigate('/dashboard/member/create-group')}>
                Create New Group
              </Button>
            )}
            
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard/member')}
            >
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GroupStatusPage; 