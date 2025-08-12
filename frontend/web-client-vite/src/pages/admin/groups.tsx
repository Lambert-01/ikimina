import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { CheckCircle, XCircle, Clock, Users, Eye } from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { getPendingGroups, approveGroup, rejectGroup } from '../../services/groupService';

interface Group {
  _id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'pending' | 'closed' | 'suspended';
  memberCount: number;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

interface PaginationData {
  total: number;
  pages: number;
  page: number;
  limit: number;
}

const AdminGroups: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [pendingGroups, setPendingGroups] = useState<Group[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    pages: 0,
    page: 1,
    limit: 10
  });
  const [isLoading, setIsLoading] = useState(true);
  const [pendingLoading, setPendingLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  const fetchPendingGroups = async () => {
    try {
      setPendingLoading(true);
      const response = await getPendingGroups();
      
      if (response.success) {
        setPendingGroups(response.data || []);
      } else {
        toast.error('Failed to fetch pending groups');
      }
    } catch (error) {
      console.error('Error fetching pending groups:', error);
      toast.error('Failed to fetch pending groups');
      setPendingGroups([]);
    } finally {
      setPendingLoading(false);
    }
  };

  const handleApproveGroup = async (groupId: string, groupName: string) => {
    try {
      const response = await approveGroup(groupId);
      
      if (response.success) {
        toast.success(`Group "${groupName}" approved successfully`);
        // Refresh both lists
        fetchPendingGroups();
        fetchGroups();
      } else {
        toast.error(response.message || 'Failed to approve group');
      }
    } catch (error: any) {
      console.error('Error approving group:', error);
      toast.error(error?.response?.data?.message || 'Failed to approve group');
    }
  };

  const handleRejectGroup = async (groupId: string, groupName: string, reason?: string) => {
    try {
      const response = await rejectGroup(groupId, reason);
      
      if (response.success) {
        toast.success(`Group "${groupName}" rejected`);
        // Refresh pending groups list
        fetchPendingGroups();
      } else {
        toast.error(response.message || 'Failed to reject group');
      }
    } catch (error: any) {
      console.error('Error rejecting group:', error);
      toast.error(error?.response?.data?.message || 'Failed to reject group');
    }
  };

  const fetchGroups = async (page = 1, search = searchTerm, status = statusFilter) => {
    try {
      setIsLoading(true);
      
      let queryParams = `page=${page}&limit=${pagination.limit}`;
      if (search) queryParams += `&search=${encodeURIComponent(search)}`;
      if (status) queryParams += `&status=${encodeURIComponent(status)}`;
      
      const response = await api.get(`/admin/groups?${queryParams}`);
      
      if (response.data.success) {
        setGroups(response.data.data);
        setPagination(response.data.pagination);
      } else {
        toast.error('Failed to fetch groups');
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast.error('Failed to fetch groups');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchGroups();
    fetchPendingGroups();
  }, []);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchGroups(1, searchTerm, statusFilter);
  };
  
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value;
    setStatusFilter(status);
    fetchGroups(1, searchTerm, status);
  };
  
  const handlePageChange = (page: number) => {
    fetchGroups(page, searchTerm, statusFilter);
  };
  
  const handleStatusUpdate = async (groupId: string, newStatus: string) => {
    try {
      const response = await api.put(`/admin/groups/${groupId}/status`, { status: newStatus });
      
      if (response.data.success) {
        toast.success(`Group status updated to ${newStatus}`);
        fetchGroups(pagination.page, searchTerm, statusFilter);
      } else {
        toast.error('Failed to update group status');
      }
    } catch (error) {
      console.error('Error updating group status:', error);
      toast.error('Failed to update group status');
    }
  };
  
  const handleDeleteGroup = async (groupId: string) => {
    if (!window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await api.delete(`/admin/groups/${groupId}`);
      
      if (response.data.success) {
        toast.success('Group deleted successfully');
        fetchGroups(pagination.page, searchTerm, statusFilter);
      } else {
        toast.error('Failed to delete group');
      }
    } catch (error) {
      console.error('Error deleting group:', error);
      toast.error('Failed to delete group');
    }
  };
  
  const PendingGroupCard = ({ group }: { group: Group }) => (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{group.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{group.description}</p>
          <div className="mt-2 flex items-center space-x-4 text-sm">
            <span className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              {group.memberCount || 1} member{(group.memberCount || 1) !== 1 ? 's' : ''}
            </span>
            <span className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {new Date(group.createdAt).toLocaleDateString()}
            </span>
          </div>
          {group.createdBy && (
            <p className="text-sm text-gray-500 mt-2">
              Created by: {group.createdBy.firstName} {group.createdBy.lastName}
            </p>
          )}
        </div>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Pending
        </span>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleApproveGroup(group._id, group.name)}
          className="flex items-center text-green-600 hover:text-green-700"
        >
          <CheckCircle className="h-4 w-4 mr-1" />
          Approve
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleRejectGroup(group._id, group.name, 'Administrative decision')}
          className="flex items-center text-red-600 hover:text-red-700"
        >
          <XCircle className="h-4 w-4 mr-1" />
          Reject
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Groups</h1>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center">
            <Clock className="mr-2 h-4 w-4" />
            Pending Approval ({pendingGroups.length})
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            All Groups ({pagination?.total || 0})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="space-y-4">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Groups Awaiting Approval
            </h2>
            
            {pendingLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : pendingGroups.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No pending groups</h3>
                <p className="mt-1 text-sm text-gray-500">All groups have been processed.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pendingGroups.map((group) => (
                  <PendingGroupCard key={group._id} group={group} />
                ))}
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="all" className="space-y-4">
          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search by name or description"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="w-full md:w-48">
            <Select value={statusFilter} onChange={handleStatusChange}>
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
              <option value="closed">Closed</option>
              <option value="suspended">Suspended</option>
            </Select>
          </div>
          <Button type="submit">Search</Button>
        </form>
      </div>
      
      {/* Groups Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : groups.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">No groups found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Created By
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Members
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Created At
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {groups.map((group) => (
                  <tr key={group._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {group.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {group.description.length > 50 ? `${group.description.substring(0, 50)}...` : group.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {group.createdBy ? `${group.createdBy.firstName} ${group.createdBy.lastName}` : 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {group.memberCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        group.status === 'active' ? 'bg-green-100 text-green-800' : 
                        group.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        group.status === 'suspended' ? 'bg-red-100 text-red-800' :
                        group.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {group.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(group.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link
                          to={`/admin/groups/${group._id}`}
                          className="text-blue-600 dark:text-blue-500 hover:text-blue-900 dark:hover:text-blue-400"
                        >
                          View
                        </Link>
                        <div className="relative group">
                          <button className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
                            Status
                          </button>
                          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg hidden group-hover:block z-10">
                            <div className="py-1">
                              {group.status !== 'active' && (
                                <button
                                  onClick={() => handleStatusUpdate(group._id, 'active')}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                                >
                                  Activate
                                </button>
                              )}
                              {group.status !== 'pending' && (
                                <button
                                  onClick={() => handleStatusUpdate(group._id, 'pending')}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                                >
                                  Set as Pending
                                </button>
                              )}
                              {group.status !== 'inactive' && (
                                <button
                                  onClick={() => handleStatusUpdate(group._id, 'inactive')}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                                >
                                  Deactivate
                                </button>
                              )}
                              {group.status !== 'suspended' && (
                                <button
                                  onClick={() => handleStatusUpdate(group._id, 'suspended')}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                                >
                                  Suspend
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteGroup(group._id)}
                          className="text-red-600 dark:text-red-500 hover:text-red-900 dark:hover:text-red-400"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Showing <span className="font-medium">{((pagination?.page || 1) - 1) * (pagination?.limit || 10) + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min((pagination?.page || 1) * (pagination?.limit || 10), pagination?.total || 0)}
                  </span>{' '}
                  of <span className="font-medium">{pagination?.total || 0}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium ${
                      pagination.page === 1
                        ? 'text-gray-300 dark:text-gray-600'
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                    .filter(page => {
                      if (pagination.pages <= 5) return true;
                      return page === 1 || page === pagination.pages || Math.abs(page - pagination.page) <= 1;
                    })
                    .map((page, index, array) => {
                      const showEllipsis = index > 0 && page - array[index - 1] > 1;
                      
                      return (
                        <React.Fragment key={page}>
                          {showEllipsis && (
                            <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300">
                              ...
                            </span>
                          )}
                          <button
                            onClick={() => handlePageChange(page)}
                            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium ${
                              page === pagination.page
                                ? 'z-10 bg-blue-50 dark:bg-blue-900 border-blue-500 dark:border-blue-500 text-blue-600 dark:text-blue-200'
                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      );
                    })}
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium ${
                      pagination.page === pagination.pages
                        ? 'text-gray-300 dark:text-gray-600'
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminGroups;