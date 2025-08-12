import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Users, 
  Calendar, 
  Search,
  Filter,
  RefreshCw,
  Eye,
  Check,
  X,
  AlertTriangle,
  User,
  Mail,
  Phone
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
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  } | null;
  rejectionReason?: string;
  contributionSettings?: {
    amount: number;
    frequency: string;
    currency: string;
  };
}

interface PaginationInfo {
  total: number;
  pages: number;
  page: number;
  limit: number;
}

interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  groupName: string;
  isLoading: boolean;
}

const RejectModal: React.FC<RejectModalProps> = ({ isOpen, onClose, onSubmit, groupName, isLoading }) => {
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim()) {
      onSubmit(reason.trim());
      setReason('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center mb-4">
          <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
          <h3 className="text-lg font-semibold">Reject Group Request</h3>
        </div>
        
        <p className="text-gray-600 mb-4">
          Are you sure you want to reject the group "<strong>{groupName}</strong>"?
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for rejection <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
              rows={3}
              placeholder="Please provide a clear reason for rejection..."
              required
            />
          </div>
          
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={!reason.trim() || isLoading}
              className="flex items-center"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <X className="w-4 h-4 mr-2" />
              )}
              Reject Group
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const GroupManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'rejected'>('pending');
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    pages: 1,
    page: 1,
    limit: 10
  });
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCreatedBy, setSelectedCreatedBy] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  
  // Modal states
  const [rejectModal, setRejectModal] = useState<{
    isOpen: boolean;
    groupId: string;
    groupName: string;
    isLoading: boolean;
  }>({
    isOpen: false,
    groupId: '',
    groupName: '',
    isLoading: false
  });

  useEffect(() => {
    loadGroups();
  }, [activeTab, pagination.page, searchQuery, selectedCreatedBy, dateFilter]);

  const loadGroups = async () => {
    try {
      setIsLoading(true);
      
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        status: activeTab === 'active' ? 'active' : activeTab,
      });
      
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCreatedBy) params.append('createdBy', selectedCreatedBy);
      if (dateFilter) params.append('dateFilter', dateFilter);

      // Using the admin groups endpoint
      const response = await groupService.getAdminGroups(params.toString());
      
      if (response?.success) {
        setGroups(response.data || []);
        setPagination(response.pagination || pagination);
      }
    } catch (error) {
      console.error('Error loading groups:', error);
      toast.error('Failed to load groups');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (groupId: string, groupName: string) => {
    try {
      const response = await groupService.approveGroup(groupId);
      if (response?.success) {
        toast.success(`Group "${groupName}" approved successfully!`);
        loadGroups(); // Reload the current tab
      } else {
        throw new Error(response?.message || 'Failed to approve group');
      }
    } catch (error) {
      console.error('Error approving group:', error);
      toast.error('Failed to approve group');
    }
  };

  const handleReject = async (reason: string) => {
    try {
      setRejectModal(prev => ({ ...prev, isLoading: true }));
      
      const response = await groupService.rejectGroup(rejectModal.groupId, reason);
      if (response?.success) {
        toast.success(`Group "${rejectModal.groupName}" rejected successfully`);
        setRejectModal({ isOpen: false, groupId: '', groupName: '', isLoading: false });
        loadGroups(); // Reload the current tab
      } else {
        throw new Error(response?.message || 'Failed to reject group');
      }
    } catch (error) {
      console.error('Error rejecting group:', error);
      toast.error('Failed to reject group');
      setRejectModal(prev => ({ ...prev, isLoading: false }));
    }
  };

  const openRejectModal = (groupId: string, groupName: string) => {
    setRejectModal({
      isOpen: true,
      groupId,
      groupName,
      isLoading: false
    });
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
            Active
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-300">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number, currency: string = 'RWF') => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  };

  const renderGroupCard = (group: Group) => (
    <Card key={group._id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-gray-200 hover:border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
              {group.name}
            </CardTitle>
            <p className="text-sm text-gray-600">
              {group.description || 'No description provided'}
            </p>
          </div>
          {getStatusBadge(group.status)}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Creator Information */}
          {group.createdBy && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center mb-2">
                <User className="w-4 h-4 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-900">Created by</span>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <p className="font-medium">{group.createdBy.firstName} {group.createdBy.lastName}</p>
                <div className="flex items-center">
                  <Mail className="w-3 h-3 mr-1" />
                  <span>{group.createdBy.email}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-3 h-3 mr-1" />
                  <span>{group.createdBy.phoneNumber}</span>
                </div>
              </div>
            </div>
          )}

          {/* Group Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center text-gray-600">
              <Users className="w-4 h-4 mr-2" />
              <span>{group.memberCount} member{group.memberCount !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              <span>{formatDate(group.createdAt)}</span>
            </div>
          </div>

          {/* Contribution Settings */}
          {group.contributionSettings && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-900">
                Contribution: {formatCurrency(group.contributionSettings.amount, group.contributionSettings.currency)}
              </p>
              <p className="text-xs text-blue-700 capitalize">
                Frequency: {group.contributionSettings.frequency}
              </p>
            </div>
          )}

          {/* Rejection Reason */}
          {group.status === 'rejected' && group.rejectionReason && (
            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
              <p className="text-sm font-medium text-red-900 mb-1">Rejection Reason:</p>
              <p className="text-sm text-red-700">{group.rejectionReason}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 flex items-center justify-center"
            >
              <Eye className="w-4 h-4 mr-1" />
              View Details
            </Button>
            
            {group.status === 'pending' && (
              <>
                <Button
                  size="sm"
                  className="flex-1 bg-green-600 hover:bg-green-700 flex items-center justify-center"
                  onClick={() => handleApprove(group._id, group.name)}
                >
                  <Check className="w-4 h-4 mr-1" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="flex-1 flex items-center justify-center"
                  onClick={() => openRejectModal(group._id, group.name)}
                >
                  <X className="w-4 h-4 mr-1" />
                  Reject
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const tabCounts = {
    pending: groups.filter(g => g.status === 'pending').length,
    active: groups.filter(g => g.status === 'active').length,
    rejected: groups.filter(g => g.status === 'rejected').length
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Group Management</h1>
          <p className="text-gray-600 mt-2">
            Review and manage group creation requests and status
          </p>
        </div>
        <Button
          variant="outline"
          onClick={loadGroups}
          disabled={isLoading}
          className="flex items-center"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6 w-fit">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'pending'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Pending Groups ({tabCounts.pending})
        </button>
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'active'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Active Groups ({tabCounts.active})
        </button>
        <button
          onClick={() => setActiveTab('rejected')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'rejected'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Rejected Groups ({tabCounts.rejected})
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search groups by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          <Button variant="outline" size="sm" className="flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </Button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-3 text-gray-600">Loading groups...</span>
        </div>
      ) : (
        <>
          {groups.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {groups.map(group => renderGroupCard(group))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No {activeTab} groups found
              </h3>
              <p className="text-gray-500">
                {activeTab === 'pending' 
                  ? "There are no groups waiting for approval."
                  : activeTab === 'active'
                  ? "There are no active groups yet."
                  : "There are no rejected groups."
                }
              </p>
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.pages} ({pagination.total} total)
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                disabled={pagination.page === pagination.pages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Reject Modal */}
      <RejectModal
        isOpen={rejectModal.isOpen}
        onClose={() => setRejectModal({ isOpen: false, groupId: '', groupName: '', isLoading: false })}
        onSubmit={handleReject}
        groupName={rejectModal.groupName}
        isLoading={rejectModal.isLoading}
      />
    </div>
  );
};

export default GroupManagement;
