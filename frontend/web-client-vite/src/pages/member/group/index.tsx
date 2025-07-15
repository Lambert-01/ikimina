import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  Wallet, 
  FileText, 
  Settings,
  ChevronRight,
  Clock,
  MapPin,
  UserPlus
} from 'lucide-react';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { toast } from 'react-toastify';
import { groupService } from '../../../services/groupService';

interface GroupMember {
  id: string;
  name: string;
  role: 'admin' | 'treasurer' | 'member';
  joinDate: string;
  contributionStatus: 'up_to_date' | 'overdue' | 'pending';
}

interface GroupDetails {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  memberCount: number;
  balance: number;
  contributionAmount: number;
  contributionFrequency: string;
  nextContributionDue: string;
  nextMeeting?: {
    date: string;
    location: string;
    agenda: string;
  };
  rules: string[];
}

const GroupPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState<GroupDetails | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);

  useEffect(() => {
    if (id) {
      fetchGroupData(id);
    }
  }, [id]);

  const fetchGroupData = async (groupId: string) => {
    try {
      setLoading(true);
      
      // Fetch group details from API
      const groupResponse = await groupService.getGroupById(groupId);
      
      if (groupResponse && groupResponse.data) {
        const groupData = groupResponse.data;
        
        // Format the group data to match our interface
        const formattedGroup: GroupDetails = {
          id: groupData._id || groupData.id,
          name: groupData.name,
          description: groupData.description || 'No description available',
          createdAt: groupData.createdAt || new Date().toISOString(),
          memberCount: groupData.members?.length || 0,
          balance: groupData.balance || 0,
          contributionAmount: groupData.contributionSettings?.amount || 0,
          contributionFrequency: groupData.contributionSettings?.frequency || 'Monthly',
          nextContributionDue: groupData.nextContributionDue || new Date().toISOString(),
          rules: groupData.rules || [
            'Members must contribute regularly',
            'Follow all group guidelines',
            'Participate in group meetings when scheduled'
          ]
        };
        
        // Add next meeting if available
        if (groupData.meetings && groupData.meetings.length > 0) {
          const nextMeeting = groupData.meetings.find((m: any) => 
            new Date(m.date) > new Date() && m.status === 'scheduled'
          );
          
          if (nextMeeting) {
            formattedGroup.nextMeeting = {
              date: nextMeeting.date,
              location: nextMeeting.location?.address || 'Virtual Meeting',
              agenda: nextMeeting.agenda || 'Regular group meeting'
            };
          }
        }
        
        setGroup(formattedGroup);
        
        // Fetch group members
        try {
          const membersResponse = await groupService.getGroupMembers(groupId);
          
          if (membersResponse && membersResponse.data) {
            // Format the members data
            const formattedMembers = membersResponse.data.map((member: any) => ({
              id: member.user._id || member._id,
              name: `${member.user.firstName} ${member.user.lastName}`,
              role: member.role || 'member',
              joinDate: member.joinedAt || new Date().toISOString(),
              contributionStatus: member.contributionStatus || 'pending'
            }));
            
            setMembers(formattedMembers);
          }
        } catch (memberError) {
          console.error('Failed to fetch group members:', memberError);
          // Use mock data as fallback
          setMembers([
            {
              id: '1',
              name: 'Jean Mutoni',
              role: 'admin',
              joinDate: '2023-01-15',
              contributionStatus: 'up_to_date'
            },
            {
              id: '2',
              name: 'Emmanuel Kwizera',
              role: 'treasurer',
              joinDate: '2023-01-15',
              contributionStatus: 'up_to_date'
            }
          ]);
        }
      }
    } catch (error) {
      console.error('Group data fetch error:', error);
      toast.error('Failed to fetch group data');
      
      // Use mock data as fallback in development
      if (process.env.NODE_ENV === 'development') {
        setGroup({
          id: '1',
          name: 'Kigali Savings Group',
          description: 'A community savings group for residents of Kigali to help each other achieve financial goals.',
          createdAt: '2023-01-15',
          memberCount: 15,
          balance: 1250000,
          contributionAmount: 10000,
          contributionFrequency: 'Weekly',
          nextContributionDue: '2023-06-15',
          nextMeeting: {
            date: '2023-06-10T14:00:00',
            location: 'Kigali Community Center',
            agenda: 'Monthly review, loan approvals, and new member applications'
          },
          rules: [
            'Members must contribute weekly',
            'Loans are available after 3 months of membership',
            'Maximum loan amount is 3x your contribution',
            'Meetings attendance is mandatory',
            'Late contributions incur a 5% penalty'
          ]
        });
        
        setMembers([
          {
            id: '1',
            name: 'Jean Mutoni',
            role: 'admin',
            joinDate: '2023-01-15',
            contributionStatus: 'up_to_date'
          },
          {
            id: '2',
            name: 'Emmanuel Kwizera',
            role: 'treasurer',
            joinDate: '2023-01-15',
            contributionStatus: 'up_to_date'
          },
          {
            id: '3',
            name: 'Alice Uwimana',
            role: 'member',
            joinDate: '2023-01-20',
            contributionStatus: 'overdue'
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
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

  const formatDateTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col space-y-6 w-full">
        {/* Skeleton loading state */}
        <div className="h-24 bg-gray-200 animate-pulse rounded-xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-80 bg-gray-200 animate-pulse rounded-xl"></div>
          <div className="h-80 bg-gray-200 animate-pulse rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">No Group Found</h2>
        <p className="mt-2 text-gray-600">You are not currently a member of any group.</p>
        <Button className="mt-6">
          <Link to="/dashboard/groups/join">Join a Group</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
          <p className="text-gray-600">{group.description}</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Button asChild variant="outline" className="flex items-center">
            <Link to="/dashboard/member/savings">
              <Wallet className="h-4 w-4 mr-2" />
              My Savings
            </Link>
          </Button>
          <Button asChild className="flex items-center">
            <Link to="/dashboard/member/loans">
              <FileText className="h-4 w-4 mr-2" />
              Request Loan
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Group Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border border-gray-200 bg-white">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-primary-600 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Members</p>
              <p className="text-xl font-semibold">{group.memberCount}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 border border-gray-200 bg-white">
          <div className="flex items-center">
            <Wallet className="h-8 w-8 text-primary-600 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Group Balance</p>
              <p className="text-xl font-semibold">{formatCurrency(group.balance)}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 border border-gray-200 bg-white">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-primary-600 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Contribution</p>
              <p className="text-xl font-semibold">{formatCurrency(group.contributionAmount)} {group.contributionFrequency}</p>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Next Meeting */}
      <Card className="p-5 border border-gray-200 bg-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Next Meeting</h2>
          <Button variant="outline" size="sm">
            View All Meetings
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start">
            <Clock className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500">Date & Time</p>
              <p className="font-medium">{formatDateTime(group.nextMeeting?.date || '')}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <MapPin className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500">Location</p>
              <p className="font-medium">{group.nextMeeting?.location || 'Virtual Meeting'}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <FileText className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500">Agenda</p>
              <p className="font-medium">{group.nextMeeting?.agenda || 'No agenda available'}</p>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Group Rules */}
      <Card className="p-5 border border-gray-200 bg-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Group Rules</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard/member/group/rules" className="flex items-center text-primary-600">
              View Details
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
        
        <ul className="space-y-2">
          {group.rules.map((rule, index) => (
            <li key={index} className="flex items-start">
              <div className="bg-primary-100 text-primary-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mr-2 mt-0.5">
                {index + 1}
              </div>
              <span className="text-gray-700">{rule}</span>
            </li>
          ))}
        </ul>
      </Card>
      
      {/* Group Members */}
      <Card className="p-5 border border-gray-200 bg-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Group Members</h2>
          <Button variant="outline" size="sm" className="flex items-center">
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Member
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Join Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {members.map((member) => (
                <tr key={member.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{member.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {member.role === 'admin' ? 'Administrator' : 
                       member.role === 'treasurer' ? 'Treasurer' : 'Member'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{formatDate(member.joinDate)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${member.contributionStatus === 'up_to_date' ? 'bg-green-100 text-green-800' : 
                        member.contributionStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {member.contributionStatus === 'up_to_date' ? 'Up to date' : 
                       member.contributionStatus === 'pending' ? 'Pending' : 'Overdue'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default GroupPage; 