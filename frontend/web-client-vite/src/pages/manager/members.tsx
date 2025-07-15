import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Mail, Phone, UserPlus, Trash2, ChevronDown, ChevronUp, Shield, User } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { groupService } from '../../services';

interface Member {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: 'member' | 'manager';
  status: 'active' | 'pending' | 'inactive';
  joinedAt: string;
}

interface InviteFormData {
  contactType: 'email' | 'phone';
  email: string;
  phone: string;
  role: 'member' | 'manager';
}

const ManagerMembersPage: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [formData, setFormData] = useState<InviteFormData>({
    contactType: 'email',
    email: '',
    phone: '',
    role: 'member'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [isPromoting, setIsPromoting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // In a real app, these would be API calls
        // For demo purposes, we'll simulate data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockMembers: Member[] = [
          {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            role: 'manager',
            status: 'active',
            joinedAt: '2023-01-15T12:00:00Z'
          },
          {
            id: '2',
            name: 'Jane Smith',
            email: 'jane@example.com',
            role: 'member',
            status: 'active',
            joinedAt: '2023-02-20T12:00:00Z'
          },
          {
            id: '3',
            name: 'Robert Johnson',
            phone: '+250789123456',
            role: 'member',
            status: 'active',
            joinedAt: '2023-03-10T12:00:00Z'
          },
          {
            id: '4',
            name: 'Sarah Williams',
            email: 'sarah@example.com',
            role: 'member',
            status: 'pending',
            joinedAt: '2023-04-05T12:00:00Z'
          }
        ];
        
        const mockInvites = [
          {
            id: 'inv1',
            email: 'invited1@example.com',
            role: 'member',
            invitedAt: '2023-04-01T12:00:00Z',
            status: 'pending'
          },
          {
            id: 'inv2',
            phone: '+250789987654',
            role: 'member',
            invitedAt: '2023-04-02T12:00:00Z',
            status: 'pending'
          }
        ];
        
        setMembers(mockMembers);
        setPendingInvites(mockInvites);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load members data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (formData.contactType === 'email') {
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Invalid email format';
      }
    } else {
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^\+?[0-9]{10,15}$/.test(formData.phone)) {
        newErrors.phone = 'Invalid phone number format';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      // In a real app, this would call the API
      // For demo purposes, we'll simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newInvite = {
        id: `inv${Date.now()}`,
        ...(formData.contactType === 'email' ? { email: formData.email } : { phone: formData.phone }),
        role: formData.role,
        invitedAt: new Date().toISOString(),
        status: 'pending'
      };
      
      setPendingInvites(prev => [...prev, newInvite]);
      
      toast.success(`Invitation sent to ${formData.contactType === 'email' ? formData.email : formData.phone}`);
      
      // Reset form
      setFormData({
        contactType: 'email',
        email: '',
        phone: '',
        role: 'member'
      });
      
      setShowInviteForm(false);
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error('Failed to send invitation');
    }
  };

  const handleCancelInvite = async (inviteId: string) => {
    try {
      // In a real app, this would call the API
      // For demo purposes, we'll simulate success
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPendingInvites(prev => prev.filter(invite => invite.id !== inviteId));
      toast.success('Invitation cancelled');
    } catch (error) {
      console.error('Error cancelling invitation:', error);
      toast.error('Failed to cancel invitation');
    }
  };

  const handlePromoteToManager = async (memberId: string) => {
    try {
      setIsPromoting(true);
      
      // In a real app, this would call the API
      // For demo purposes, we'll simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMembers(prev => 
        prev.map(member => 
          member.id === memberId ? { ...member, role: 'manager' } : member
        )
      );
      
      toast.success('Member promoted to manager');
      setSelectedMember(null);
    } catch (error) {
      console.error('Error promoting member:', error);
      toast.error('Failed to promote member');
    } finally {
      setIsPromoting(false);
    }
  };

  const handleDemoteToMember = async (memberId: string) => {
    try {
      setIsPromoting(true);
      
      // In a real app, this would call the API
      // For demo purposes, we'll simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMembers(prev => 
        prev.map(member => 
          member.id === memberId ? { ...member, role: 'member' } : member
        )
      );
      
      toast.success('Manager demoted to member');
      setSelectedMember(null);
    } catch (error) {
      console.error('Error demoting manager:', error);
      toast.error('Failed to demote manager');
    } finally {
      setIsPromoting(false);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Group Members</h1>
        <Button
          onClick={() => setShowInviteForm(!showInviteForm)}
          className="flex items-center"
        >
          <UserPlus className="mr-2 h-5 w-5" />
          {showInviteForm ? 'Cancel' : 'Invite Member'}
        </Button>
      </div>

      {/* Invite Form */}
      {showInviteForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Invite New Member</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div className="flex space-x-4 mb-4">
                <div className="flex items-center">
                  <input
                    id="email-type"
                    name="contactType"
                    type="radio"
                    value="email"
                    checked={formData.contactType === 'email'}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <label htmlFor="email-type" className="ml-2 block text-sm font-medium text-gray-700">
                    Email
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="phone-type"
                    name="contactType"
                    type="radio"
                    value="phone"
                    checked={formData.contactType === 'phone'}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <label htmlFor="phone-type" className="ml-2 block text-sm font-medium text-gray-700">
                    Phone
                  </label>
                </div>
              </div>

              {formData.contactType === 'email' ? (
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className={`block w-full pl-10 sm:text-sm rounded-md ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      } focus:ring-primary-500 focus:border-primary-500`}
                      placeholder="email@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
              ) : (
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className={`block w-full pl-10 sm:text-sm rounded-md ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      } focus:ring-primary-500 focus:border-primary-500`}
                      placeholder="+250..."
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>
              )}

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  value={formData.role}
                  onChange={handleInputChange}
                >
                  <option value="member">Member</option>
                  <option value="manager">Co-Manager</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowInviteForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Send Invitation
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Pending Invitations */}
      {pendingInvites.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Pending Invitations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invited On
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingInvites.map((invite) => (
                    <tr key={invite.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {invite.email ? (
                            <>
                              <Mail className="h-5 w-5 text-gray-400 mr-2" />
                              <span>{invite.email}</span>
                            </>
                          ) : (
                            <>
                              <Phone className="h-5 w-5 text-gray-400 mr-2" />
                              <span>{invite.phone}</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          invite.role === 'manager' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {invite.role === 'manager' ? 'Co-Manager' : 'Member'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(invite.invitedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleCancelInvite(invite.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle>Current Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
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
                      <div className="flex items-center text-sm text-gray-500">
                        {member.email && (
                          <div className="flex items-center mr-3">
                            <Mail className="h-4 w-4 text-gray-400 mr-1" />
                            <span>{member.email}</span>
                          </div>
                        )}
                        {member.phone && (
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 text-gray-400 mr-1" />
                            <span>{member.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        member.role === 'manager' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {member.role === 'manager' ? (
                          <><Shield className="h-3 w-3 mr-1" /> Manager</>
                        ) : (
                          <><User className="h-3 w-3 mr-1" /> Member</>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        member.status === 'active' ? 'bg-green-100 text-green-800' : 
                        member.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(member.joinedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setSelectedMember(selectedMember === member.id ? null : member.id)}
                        className="text-primary-600 hover:text-primary-900 flex items-center"
                      >
                        Actions
                        {selectedMember === member.id ? (
                          <ChevronUp className="ml-1 h-4 w-4" />
                        ) : (
                          <ChevronDown className="ml-1 h-4 w-4" />
                        )}
                      </button>
                      
                      {selectedMember === member.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                          <div className="py-1">
                            {member.role === 'member' ? (
                              <button
                                onClick={() => handlePromoteToManager(member.id)}
                                disabled={isPromoting}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                              >
                                <Shield className="h-4 w-4 mr-2 text-purple-500" />
                                Promote to Manager
                              </button>
                            ) : (
                              <button
                                onClick={() => handleDemoteToMember(member.id)}
                                disabled={isPromoting}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                              >
                                <User className="h-4 w-4 mr-2 text-blue-500" />
                                Demote to Member
                              </button>
                            )}
                            <button
                              onClick={() => {
                                // Handle remove member
                                toast.info('Remove functionality would go here');
                                setSelectedMember(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-gray-100 flex items-center"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove from Group
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagerMembersPage; 