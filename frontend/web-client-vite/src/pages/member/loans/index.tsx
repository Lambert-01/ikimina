import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter, Calendar, X, Wallet } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { getMyLoans } from '../../../services/loanService';
import { getMyGroups } from '../../../services/groupService';
import type { Loan } from '../../../services/loanService';
import type { Group } from '../../../services/groupService';
import ActiveLoanCard from '../../../components/loans/ActiveLoanCard';
import LoanRequestForm from '../../../components/loans/LoanRequestForm';

const LoansPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('active');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [showLoanRequestForm, setShowLoanRequestForm] = useState<boolean>(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  
  // Data states
  const [loans, setLoans] = useState<Loan[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  
  // Filter states
  const [groupFilter, setGroupFilter] = useState<string>('');
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch user's loans
      const loansResponse = await getMyLoans();
      if (loansResponse.success) {
        setLoans(loansResponse.data || []);
      }
      
      // Fetch user's groups
      const groupsResponse = await getMyGroups();
      if (groupsResponse.success) {
        setGroups([...groupsResponse.data.memberGroups, ...groupsResponse.data.managedGroups]);
      }
    } catch (error) {
      console.error('Failed to fetch loan data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRequestLoan = (group?: Group) => {
    if (group) {
      setSelectedGroup(group);
    } else {
      setSelectedGroup(null);
    }
    
    setShowLoanRequestForm(true);
  };
  
  const handleViewLoanDetails = (loanId: string) => {
    navigate(`/member/loans/${loanId}`);
  };
  
  const handleRepayLoan = (loanId: string) => {
    navigate(`/member/loans/${loanId}/repay`);
  };
  
  const handleFilterChange = async () => {
    try {
      setIsLoading(true);
      
      const params: any = {};
      if (groupFilter) params.groupId = groupFilter;
      
      const response = await getMyLoans(params);
      if (response.success) {
        setLoans(response.data || []);
      }
    } catch (error) {
      console.error('Failed to filter loans:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const clearFilters = () => {
    setGroupFilter('');
    fetchData();
  };
  
  // Filter loans based on status
  const activeLoans = loans.filter(loan => 
    ['approved', 'active'].includes(loan.status)
  );
  
  const pendingLoans = loans.filter(loan => 
    ['pending', 'voting'].includes(loan.status)
  );
  
  const completedLoans = loans.filter(loan => 
    ['repaid', 'rejected', 'defaulted'].includes(loan.status)
  );
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('rw-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(amount);
  };
  
  // Calculate total borrowed amount
  const totalBorrowed = loans.reduce((sum, loan) => {
    if (['approved', 'active', 'repaid'].includes(loan.status)) {
      return sum + loan.amount;
    }
    return sum;
  }, 0);
  
  // Calculate total outstanding amount
  const totalOutstanding = loans.reduce((sum, loan) => {
    if (['approved', 'active'].includes(loan.status)) {
      return sum + (loan.totalRepayment - loan.repaidAmount);
    }
    return sum;
  }, 0);
  
  if (showLoanRequestForm) {
    return (
      <div className="container mx-auto p-4">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => {
              setShowLoanRequestForm(false);
              setSelectedGroup(null);
            }}
            className="mb-4"
          >
            Back to Loans
          </Button>
          <h1 className="text-2xl font-bold">Request a Loan</h1>
        </div>
        
        <LoanRequestForm 
          groupId={selectedGroup?._id}
          onSuccess={() => {
            setShowLoanRequestForm(false);
            setSelectedGroup(null);
            fetchData();
          }}
          onCancel={() => {
            setShowLoanRequestForm(false);
            setSelectedGroup(null);
          }}
        />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Loans</h1>
          <p className="text-gray-500">Manage your loans and repayments</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? <X className="mr-2 h-4 w-4" /> : <Filter className="mr-2 h-4 w-4" />}
            {showFilters ? 'Hide Filters' : 'Filters'}
          </Button>
          <Button onClick={() => handleRequestLoan()}>
            <Plus className="mr-2 h-4 w-4" />
            Request Loan
          </Button>
        </div>
      </div>
      
      {/* Loan Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Borrowed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBorrowed)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalOutstanding)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeLoans.length}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters */}
      {showFilters && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="groupFilter" className="block text-sm font-medium mb-1">Group</label>
                <select
                  id="groupFilter"
                  value={groupFilter}
                  onChange={(e) => setGroupFilter(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">All Groups</option>
                  {groups.map((group) => (
                    <option key={group._id} value={group._id}>{group.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-end space-x-2">
                <Button onClick={handleFilterChange} className="flex-1">
                  Apply Filters
                </Button>
                <Button variant="outline" onClick={clearFilters}>
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="active">
            Active ({activeLoans.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({pendingLoans.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedLoans.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading active loans...</p>
            </div>
          ) : activeLoans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeLoans.map((loan) => (
                <ActiveLoanCard 
                  key={loan._id}
                  loan={loan}
                  onViewDetails={handleViewLoanDetails}
                  onRepay={handleRepayLoan}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Wallet className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium mb-2">No active loans</h3>
              <p className="text-gray-500 mb-6">You don't have any active loans at the moment</p>
              <Button onClick={() => handleRequestLoan()}>
                Request Your First Loan
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="pending">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading pending loans...</p>
            </div>
          ) : pendingLoans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingLoans.map((loan) => (
                <ActiveLoanCard 
                  key={loan._id}
                  loan={loan}
                  onViewDetails={handleViewLoanDetails}
                  onRepay={handleRepayLoan}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium mb-2">No pending loans</h3>
              <p className="text-gray-500">You don't have any pending loan requests</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading completed loans...</p>
            </div>
          ) : completedLoans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedLoans.map((loan) => (
                <ActiveLoanCard 
                  key={loan._id}
                  loan={loan}
                  onViewDetails={handleViewLoanDetails}
                  onRepay={handleRepayLoan}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium mb-2">No completed loans</h3>
              <p className="text-gray-500">You don't have any completed loan history</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LoansPage; 