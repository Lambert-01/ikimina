import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Users, 
  Calendar, 
  Plus,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { groupService } from '../../services';

interface Group {
  _id: string;
  name: string;
  description: string;
  status: 'pending' | 'active' | 'rejected' | 'suspended';
  memberCount: number;
  createdAt: string;
  rejectionReason?: string;
  contributionSettings?: {
    amount: number;
    frequency: string;
    currency: string;
  };
}

const MyGroupsPage: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [managedGroups, setManagedGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'member' | 'managed'>('member');
  const navigate = useNavigate();

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setIsLoading(true);
      const [memberData, managedData] = await Promise.all([
        groupService.getMyGroups(),
        groupService.getManagedGroups()
      ]);
      
      setGroups(Array.isArray(memberData) ? memberData : []);
      setManagedGroups(Array.isArray(managedData) ? managedData : []);
    } catch (error) {
      console.error('Error loading groups:', error);
      toast.error('Failed to load your groups');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'active':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-300">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      case 'suspended':
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800 border-gray-300">
            <AlertCircle className="w-3 h-3 mr-1" />
            Suspended
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            {status}
          </Badge>
        );
    }
  };

  const getStatusMessage = (group: Group) => {
    switch (group.status) {
      case 'pending':
        return (
          <p className="text-sm text-yellow-700 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <Clock className="w-4 h-4 inline mr-2" />
            Waiting for admin approval before group can start activities. 
            <span className="font-medium"> Estimated approval time: 1-3 business days.</span>
          </p>
        );
      case 'rejected':
        return (
          <div className="text-sm text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">
            <XCircle className="w-4 h-4 inline mr-2" />
            <span className="font-medium">Group request was declined.</span>
            {group.rejectionReason && (
              <p className="mt-2">
                <strong>Reason:</strong> {group.rejectionReason}
              </p>
            )}
            <p className="mt-2">
              You can create a new group or contact support for more information.
            </p>
          </div>
        );
      case 'active':
        return (
          <p className="text-sm text-green-700 bg-green-50 p-3 rounded-lg border border-green-200">
            <CheckCircle className="w-4 h-4 inline mr-2" />
            Group is approved and active! You can now manage contributions, loans, and meetings.
          </p>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number, currency: string = 'RWF') => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  };

  const renderGroupCard = (group: Group, isManaged: boolean = false) => (
    <Card key={group._id} className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900">
              {group.name}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {group.description || 'No description provided'}
            </p>
          </div>
          {getStatusBadge(group.status)}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Status Message */}
          {getStatusMessage(group)}
          
          {/* Group Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center text-gray-600">
              <Users className="w-4 h-4 mr-2" />
              <span>{group.memberCount} member{group.memberCount !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              <span>Created {formatDate(group.createdAt)}</span>
            </div>
          </div>

          {/* Contribution Info for Active Groups */}
          {group.status === 'active' && group.contributionSettings && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-900">
                Contribution: {formatCurrency(group.contributionSettings.amount, group.contributionSettings.currency)}
              </p>
              <p className="text-xs text-blue-700 capitalize">
                Frequency: {group.contributionSettings.frequency}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {group.status === 'active' && (
              <>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => navigate(`/member/groups/${group._id}`)}
                >
                  View Details
                </Button>
                {isManaged && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate(`/member/groups/${group._id}/manage`)}
                  >
                    Manage
                  </Button>
                )}
              </>
            )}
            {group.status === 'rejected' && (
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => navigate('/member/create-group')}
              >
                Create New Group
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const currentGroups = activeTab === 'member' ? groups : managedGroups;
  const emptyMessage = activeTab === 'member' 
    ? "You haven't joined any groups yet." 
    : "You don't manage any groups yet.";

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Groups</h1>
          <p className="text-gray-600 mt-2">
            Manage your savings groups and track their approval status
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={loadGroups}
            disabled={isLoading}
            className="flex items-center"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => navigate('/member/create-group')}
            className="flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Group
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6 w-fit">
        <button
          onClick={() => setActiveTab('member')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'member'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Member Groups ({groups.length})
        </button>
        <button
          onClick={() => setActiveTab('managed')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'managed'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Managed Groups ({managedGroups.length})
        </button>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-3 text-gray-600">Loading your groups...</span>
        </div>
      ) : (
        <>
          {/* Groups Grid */}
          {currentGroups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentGroups.map(group => renderGroupCard(group, activeTab === 'managed'))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {emptyMessage}
              </h3>
              <p className="text-gray-500 mb-6">
                {activeTab === 'member' 
                  ? "Join existing groups or create your own to start saving together."
                  : "Create a group to become a manager and help others achieve their savings goals."
                }
              </p>
              <div className="flex justify-center gap-3">
                <Button
                  onClick={() => navigate('/member/create-group')}
                  className="flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Group
                </Button>
                {activeTab === 'member' && (
                  <Button
                    variant="outline"
                    onClick={() => navigate('/member/join-group')}
                    className="flex items-center"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Join Group
                  </Button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyGroupsPage;
