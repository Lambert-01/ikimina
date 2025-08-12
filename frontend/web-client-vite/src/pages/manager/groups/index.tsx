import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Search, Filter, Download, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';

interface Group {
  id: string;
  name: string;
  memberCount: number;
  activeLoans: number;
  totalContributions: number;
  status: 'active' | 'pending' | 'suspended';
  lastActivity: string;
}

const ManagerGroupsPage: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  // Mock data for demonstration
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setIsLoading(true);
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockGroups: Group[] = [
          {
            id: 'g1',
            name: 'Umurenge SACCO Group',
            memberCount: 25,
            activeLoans: 3,
            totalContributions: 1250000,
            status: 'active',
            lastActivity: '2023-11-15'
          },
          {
            id: 'g2',
            name: 'Women Entrepreneurs',
            memberCount: 18,
            activeLoans: 2,
            totalContributions: 900000,
            status: 'active',
            lastActivity: '2023-11-12'
          },
          {
            id: 'g3',
            name: 'Community Youth Savings',
            memberCount: 15,
            activeLoans: 1,
            totalContributions: 450000,
            status: 'pending',
            lastActivity: '2023-11-10'
          },
          {
            id: 'g4',
            name: 'Teachers Association',
            memberCount: 12,
            activeLoans: 0,
            totalContributions: 600000,
            status: 'suspended',
            lastActivity: '2023-10-28'
          },
          {
            id: 'g5',
            name: 'Market Vendors Cooperative',
            memberCount: 30,
            activeLoans: 5,
            totalContributions: 1500000,
            status: 'active',
            lastActivity: '2023-11-16'
          }
        ];
        
        setGroups(mockGroups);
        setFilteredGroups(mockGroups);
      } catch (error) {
        console.error('Error fetching groups:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchGroups();
  }, []);

  // Handle search and filtering
  useEffect(() => {
    let results = groups;
    
    // Apply search term
    if (searchTerm) {
      results = results.filter(group => 
        group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      results = results.filter(group => group.status === statusFilter);
    }
    
    setFilteredGroups(results);
  }, [groups, searchTerm, statusFilter]);

  // Status badge styles
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">My Managed Groups</h1>
          <p className="text-gray-600">Manage and monitor your savings groups</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button
            onClick={() => navigate('/manager/create-group')}
            className="flex items-center"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Group
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Total Groups</div>
            <div className="text-3xl font-bold">{groups.length}</div>
            <div className="mt-1 text-sm text-gray-600">
              {groups.filter(g => g.status === 'active').length} active
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Total Members</div>
            <div className="text-3xl font-bold">
              {groups.reduce((sum, group) => sum + group.memberCount, 0)}
            </div>
            <div className="mt-1 text-sm text-gray-600">Across all groups</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Total Contributions</div>
            <div className="text-3xl font-bold">
              {new Intl.NumberFormat('en-RW', { 
                style: 'currency', 
                currency: 'RWF',
                maximumFractionDigits: 0
              }).format(groups.reduce((sum, group) => sum + group.totalContributions, 0))}
            </div>
            <div className="mt-1 text-sm text-gray-600">Collected funds</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Active Loans</div>
            <div className="text-3xl font-bold">
              {groups.reduce((sum, group) => sum + group.activeLoans, 0)}
            </div>
            <div className="mt-1 text-sm text-gray-600">Across all groups</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="search"
              placeholder="Search groups by name or ID..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="w-full md:w-48">
          <div className="flex items-center space-x-2">
            <Filter size={18} className="text-gray-500" />
            <select
              className="flex-1 rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
        <div>
          <Button variant="outline" className="w-full md:w-auto flex items-center">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Groups List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          <span className="ml-2">Loading groups...</span>
        </div>
      ) : filteredGroups.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Group Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Members
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contributions
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loans
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Activity
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredGroups.map((group) => (
                  <tr key={group.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{group.name}</div>
                      <div className="text-sm text-gray-500">ID: {group.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{group.memberCount}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Intl.NumberFormat('en-RW', { 
                          style: 'currency', 
                          currency: 'RWF',
                          maximumFractionDigits: 0
                        }).format(group.totalContributions)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{group.activeLoans}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(group.status)}`}>
                        {group.status.charAt(0).toUpperCase() + group.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(group.lastActivity).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/manager/groups/${group.id}`)}
                      >
                        Manage
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-gray-500">No groups found matching your filters.</p>
        </div>
      )}
    </div>
  );
};

export default ManagerGroupsPage; 