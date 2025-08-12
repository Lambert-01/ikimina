import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Search, Filter, Download, Loader2, MoreHorizontal } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardContent } from '../../../components/ui/card';

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  groupId: string;
  groupName: string;
  role: 'member' | 'treasurer' | 'secretary' | 'president';
  status: 'active' | 'pending' | 'suspended';
  joinedDate: string;
  contributions: number;
  activeLoans: number;
}

const ManagerMembersPage: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [groupFilter, setGroupFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  // Mock data for demonstration
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setIsLoading(true);
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockMembers: Member[] = [
          {
            id: 'mem1',
            firstName: 'Jean',
            lastName: 'Mutesa',
            phoneNumber: '+250789123456',
            email: 'jean.mutesa@example.com',
            groupId: 'g1',
            groupName: 'Umurenge SACCO Group',
            role: 'member',
            status: 'active',
            joinedDate: '2023-06-15',
            contributions: 250000,
            activeLoans: 0
          },
          {
            id: 'mem2',
            firstName: 'Marie',
            lastName: 'Uwimana',
            phoneNumber: '+250789123457',
            email: 'marie@example.com',
            groupId: 'g1',
            groupName: 'Umurenge SACCO Group',
            role: 'treasurer',
            status: 'active',
            joinedDate: '2023-05-10',
            contributions: 300000,
            activeLoans: 1
          },
          {
            id: 'mem3',
            firstName: 'Robert',
            lastName: 'Mugabo',
            phoneNumber: '+250789123458',
            groupId: 'g2',
            groupName: 'Women Entrepreneurs',
            role: 'president',
            status: 'active',
            joinedDate: '2023-04-20',
            contributions: 450000,
            activeLoans: 0
          },
          {
            id: 'mem4',
            firstName: 'Alice',
            lastName: 'Kirezi',
            phoneNumber: '+250789123459',
            email: 'alice@example.com',
            groupId: 'g2',
            groupName: 'Women Entrepreneurs',
            role: 'secretary',
            status: 'active',
            joinedDate: '2023-07-05',
            contributions: 180000,
            activeLoans: 0
          },
          {
            id: 'mem5',
            firstName: 'Emmanuel',
            lastName: 'Kamanzi',
            phoneNumber: '+250789123460',
            groupId: 'g3',
            groupName: 'Community Youth Savings',
            role: 'member',
            status: 'pending',
            joinedDate: '2023-11-01',
            contributions: 0,
            activeLoans: 0
          },
          {
            id: 'mem6',
            firstName: 'Diane',
            lastName: 'Umutoni',
            phoneNumber: '+250789123461',
            email: 'diane@example.com',
            groupId: 'g1',
            groupName: 'Umurenge SACCO Group',
            role: 'member',
            status: 'suspended',
            joinedDate: '2023-03-15',
            contributions: 150000,
            activeLoans: 1
          }
        ];
        
        setMembers(mockMembers);
        setFilteredMembers(mockMembers);
      } catch (error) {
        console.error('Error fetching members:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMembers();
  }, []);

  // Handle search and filtering
  useEffect(() => {
    let results = members;
    
    // Apply search term
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      results = results.filter(member => 
        member.firstName.toLowerCase().includes(query) ||
        member.lastName.toLowerCase().includes(query) ||
        member.phoneNumber.includes(query) ||
        (member.email && member.email.toLowerCase().includes(query))
      );
    }
    
    // Apply group filter
    if (groupFilter !== 'all') {
      results = results.filter(member => member.groupId === groupFilter);
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      results = results.filter(member => member.status === statusFilter);
    }
    
    setFilteredMembers(results);
  }, [members, searchTerm, groupFilter, statusFilter]);

  // Get unique groups for the filter
  const uniqueGroups = Array.from(new Set(members.map(member => member.groupId))).map(
    groupId => {
      const group = members.find(member => member.groupId === groupId);
      return {
        id: groupId,
        name: group ? group.groupName : 'Unknown Group'
      };
    }
  );

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

  // Role badge styles
  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'president':
        return 'bg-blue-100 text-blue-800';
      case 'treasurer':
        return 'bg-purple-100 text-purple-800';
      case 'secretary':
        return 'bg-teal-100 text-teal-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Members Management</h1>
          <p className="text-gray-600">Manage all members across your savings groups</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button
            onClick={() => navigate('/manager/members/invite')}
            className="flex items-center"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Members
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Total Members</div>
            <div className="text-3xl font-bold">{members.length}</div>
            <div className="mt-1 text-sm text-gray-600">
              {members.filter(m => m.status === 'active').length} active
            </div>
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
              }).format(members.reduce((sum, member) => sum + member.contributions, 0))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Active Loans</div>
            <div className="text-3xl font-bold">
              {members.reduce((sum, member) => sum + member.activeLoans, 0)}
            </div>
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
              placeholder="Search members by name, phone, or email..."
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
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
            >
              <option value="all">All Groups</option>
              {uniqueGroups.map(group => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>
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

      {/* Members List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          <span className="ml-2">Loading members...</span>
        </div>
      ) : filteredMembers.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Member
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Group
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contributions
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-lg font-medium text-gray-600">
                            {member.firstName[0] + member.lastName[0]}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {member.firstName} {member.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            Joined {new Date(member.joinedDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{member.phoneNumber}</div>
                      {member.email && (
                        <div className="text-sm text-gray-500">{member.email}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{member.groupName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeClass(member.role)}`}>
                        {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(member.status)}`}>
                        {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Intl.NumberFormat('en-RW', { 
                          style: 'currency', 
                          currency: 'RWF',
                          maximumFractionDigits: 0
                        }).format(member.contributions)}
                      </div>
                      {member.activeLoans > 0 && (
                        <div className="text-xs text-amber-600 mt-1">
                          {member.activeLoans} active loan{member.activeLoans > 1 ? 's' : ''}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/manager/members/${member.id}`)}
                      >
                        View Profile
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
          <p className="text-gray-500">No members found matching your filters.</p>
        </div>
      )}
    </div>
  );
};

export default ManagerMembersPage; 