import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  UserPlus, 
  MoreHorizontal, 
  Mail, 
  Phone,
  UserCheck,
  UserX,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { toast } from 'react-toastify';

interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  contributionStatus: 'up_to_date' | 'overdue' | 'pending';
  lastContribution: string;
  totalContributed: number;
  role: 'admin' | 'treasurer' | 'member';
  status: 'active' | 'inactive';
}

const MembersPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [contributionFilter, setContributionFilter] = useState('all');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  
  useEffect(() => {
    fetchMembers();
  }, []);
  
  useEffect(() => {
    filterMembers();
  }, [members, searchTerm, statusFilter, contributionFilter]);
  
  const fetchMembers = async () => {
    try {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock members data
      const mockMembers: Member[] = [
        {
          id: '1',
          name: 'Jean Mutoni',
          email: 'jean.mutoni@example.com',
          phone: '+250781234567',
          joinDate: '2023-01-15',
          contributionStatus: 'up_to_date',
          lastContribution: '2023-06-01',
          totalContributed: 150000,
          role: 'admin',
          status: 'active'
        },
        {
          id: '2',
          name: 'Emmanuel Kwizera',
          email: 'emmanuel.k@example.com',
          phone: '+250782345678',
          joinDate: '2023-01-15',
          contributionStatus: 'up_to_date',
          lastContribution: '2023-06-02',
          totalContributed: 150000,
          role: 'treasurer',
          status: 'active'
        },
        {
          id: '3',
          name: 'Alice Uwimana',
          email: 'alice.u@example.com',
          phone: '+250783456789',
          joinDate: '2023-01-20',
          contributionStatus: 'overdue',
          lastContribution: '2023-05-01',
          totalContributed: 135000,
          role: 'member',
          status: 'active'
        },
        {
          id: '4',
          name: 'Robert Mugisha',
          email: 'robert.m@example.com',
          phone: '+250784567890',
          joinDate: '2023-02-01',
          contributionStatus: 'up_to_date',
          lastContribution: '2023-06-01',
          totalContributed: 150000,
          role: 'member',
          status: 'active'
        },
        {
          id: '5',
          name: 'Grace Ingabire',
          email: 'grace.i@example.com',
          phone: '+250785678901',
          joinDate: '2023-02-10',
          contributionStatus: 'pending',
          lastContribution: '2023-05-15',
          totalContributed: 140000,
          role: 'member',
          status: 'active'
        },
        {
          id: '6',
          name: 'Patrick Niyomugabo',
          email: 'patrick.n@example.com',
          phone: '+250786789012',
          joinDate: '2023-02-15',
          contributionStatus: 'up_to_date',
          lastContribution: '2023-06-01',
          totalContributed: 150000,
          role: 'member',
          status: 'inactive'
        },
        {
          id: '7',
          name: 'Diane Mukamana',
          email: 'diane.m@example.com',
          phone: '+250787890123',
          joinDate: '2023-03-01',
          contributionStatus: 'overdue',
          lastContribution: '2023-04-15',
          totalContributed: 120000,
          role: 'member',
          status: 'active'
        },
        {
          id: '8',
          name: 'Eric Habimana',
          email: 'eric.h@example.com',
          phone: '+250788901234',
          joinDate: '2023-03-10',
          contributionStatus: 'up_to_date',
          lastContribution: '2023-06-01',
          totalContributed: 150000,
          role: 'member',
          status: 'active'
        }
      ];
      
      setMembers(mockMembers);
      
    } catch (error) {
      console.error('Members fetch error:', error);
      toast.error('Failed to fetch members');
    } finally {
      setLoading(false);
    }
  };
  
  const filterMembers = () => {
    let result = [...members];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(member => 
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.phone.includes(searchTerm)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(member => member.status === statusFilter);
    }
    
    // Apply contribution filter
    if (contributionFilter !== 'all') {
      result = result.filter(member => member.contributionStatus === contributionFilter);
    }
    
    setFilteredMembers(result);
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };
  
  const handleContributionFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setContributionFilter(e.target.value);
  };
  
  const handleSelectMember = (id: string) => {
    if (selectedMembers.includes(id)) {
      setSelectedMembers(selectedMembers.filter(memberId => memberId !== id));
    } else {
      setSelectedMembers([...selectedMembers, id]);
    }
  };
  
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(filteredMembers.map(member => member.id));
    }
    setSelectAll(!selectAll);
  };
  
  const handleAddMember = () => {
    toast.info('Opening add member form');
    // In a real app, this would open a modal or navigate to an add member form
  };
  
  const handleImportMembers = () => {
    toast.info('Opening import members dialog');
    // In a real app, this would open a file upload dialog
  };
  
  const handleExportMembers = () => {
    toast.info('Exporting members data');
    // In a real app, this would generate and download a CSV file
  };
  
  const handleActivateMembers = () => {
    if (selectedMembers.length === 0) return;
    
    setMembers(members.map(member => 
      selectedMembers.includes(member.id) 
        ? { ...member, status: 'active' }
        : member
    ));
    
    toast.success(`Activated ${selectedMembers.length} member(s)`);
    setSelectedMembers([]);
    setSelectAll(false);
  };
  
  const handleDeactivateMembers = () => {
    if (selectedMembers.length === 0) return;
    
    setMembers(members.map(member => 
      selectedMembers.includes(member.id) 
        ? { ...member, status: 'inactive' }
        : member
    ));
    
    toast.success(`Deactivated ${selectedMembers.length} member(s)`);
    setSelectedMembers([]);
    setSelectAll(false);
  };
  
  const getContributionStatusIcon = (status: string) => {
    switch (status) {
      case 'up_to_date':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'overdue':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col space-y-6 w-full">
        {/* Skeleton loading state */}
        <div className="h-24 bg-gray-200 animate-pulse rounded-xl"></div>
        <div className="h-96 bg-gray-200 animate-pulse rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Members</h1>
          <p className="text-gray-600">Manage group members and their information</p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
          <Button variant="outline" className="flex items-center" onClick={handleImportMembers}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" className="flex items-center" onClick={handleExportMembers}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button className="flex items-center" onClick={handleAddMember}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      <Card className="p-5 border border-gray-200 bg-white">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search members..."
              className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <select
                className="pl-4 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
                value={statusFilter}
                onChange={handleStatusFilterChange}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <Filter className="h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            
            <div className="relative">
              <select
                className="pl-4 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
                value={contributionFilter}
                onChange={handleContributionFilterChange}
              >
                <option value="all">All Contributions</option>
                <option value="up_to_date">Up to Date</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
              <Filter className="h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </Card>
      
      {/* Members Table */}
      <Card className="border border-gray-200 bg-white overflow-hidden">
        {selectedMembers.length > 0 && (
          <div className="bg-primary-50 p-4 border-b border-primary-100 flex justify-between items-center">
            <span className="text-sm font-medium text-primary-700">
              {selectedMembers.length} member{selectedMembers.length === 1 ? '' : 's'} selected
            </span>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="flex items-center" onClick={handleActivateMembers}>
                <UserCheck className="h-4 w-4 mr-2" />
                Activate
              </Button>
              <Button variant="outline" size="sm" className="flex items-center text-red-600 hover:text-red-700 hover:border-red-700" onClick={handleDeactivateMembers}>
                <UserX className="h-4 w-4 mr-2" />
                Deactivate
              </Button>
            </div>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      checked={selectAll}
                      onChange={handleSelectAll}
                    />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Join Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contribution
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMembers.map((member) => (
                <tr key={member.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        checked={selectedMembers.includes(member.id)}
                        onChange={() => handleSelectMember(member.id)}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{member.name}</div>
                        <div className="text-sm text-gray-500">
                          {member.role === 'admin' ? 'Administrator' : 
                           member.role === 'treasurer' ? 'Treasurer' : 'Member'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <div className="text-sm text-gray-900 flex items-center">
                        <Mail className="h-3 w-3 mr-1 text-gray-500" />
                        {member.email}
                      </div>
                      <div className="text-sm text-gray-900 flex items-center">
                        <Phone className="h-3 w-3 mr-1 text-gray-500" />
                        {member.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(member.joinDate)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getContributionStatusIcon(member.contributionStatus)}
                      <span className={`ml-1.5 text-sm ${
                        member.contributionStatus === 'up_to_date' ? 'text-green-800' : 
                        member.contributionStatus === 'pending' ? 'text-yellow-800' : 
                        'text-red-800'
                      }`}>
                        {member.contributionStatus === 'up_to_date' ? 'Up to date' : 
                         member.contributionStatus === 'pending' ? 'Pending' : 'Overdue'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Last: {formatDate(member.lastContribution)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{formatCurrency(member.totalContributed)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-primary-600 hover:text-primary-900">
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No members found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all' || contributionFilter !== 'all'
                ? 'Try adjusting your filters to find what you\'re looking for.'
                : 'Get started by adding a new member to your group.'}
            </p>
            {(searchTerm || statusFilter !== 'all' || contributionFilter !== 'all') ? (
              <Button variant="outline" className="mt-6" onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setContributionFilter('all');
              }}>
                Clear Filters
              </Button>
            ) : (
              <Button className="mt-6" onClick={handleAddMember}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default MembersPage; 