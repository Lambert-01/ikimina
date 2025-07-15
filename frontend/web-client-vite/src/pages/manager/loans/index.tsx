import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Search, 
  Filter, 
  Download, 
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronRight,
  ChevronDown,
  Plus,
  BarChart3,
  CreditCard,
  ArrowUpRight,
  FileText
} from 'lucide-react';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { toast } from 'react-toastify';

interface LoanSummary {
  totalLoaned: number;
  activeLoans: number;
  pendingRequests: number;
  repaymentRate: number;
}

interface Loan {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  interestRate: number;
  requestDate: string;
  approvalDate?: string;
  dueDate: string;
  amountDue: number;
  status: 'pending' | 'approved' | 'active' | 'overdue' | 'paid' | 'rejected';
  purpose: string;
}

const LoansPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<LoanSummary | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [filteredLoans, setFilteredLoans] = useState<Loan[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('active');
  
  useEffect(() => {
    fetchLoanData();
  }, []);
  
  useEffect(() => {
    filterLoans();
  }, [loans, searchTerm, statusFilter, activeTab]);
  
  const fetchLoanData = async () => {
    try {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock summary data
      setSummary({
        totalLoaned: 1500000,
        activeLoans: 5,
        pendingRequests: 2,
        repaymentRate: 95
      });
      
      // Mock loans data
      setLoans([
        {
          id: '1',
          memberId: '1',
          memberName: 'Jean Mutoni',
          amount: 100000,
          interestRate: 5,
          requestDate: '2023-05-15',
          approvalDate: '2023-05-20',
          dueDate: '2023-07-15',
          amountDue: 70000,
          status: 'active',
          purpose: 'Home repairs'
        },
        {
          id: '2',
          memberId: '3',
          memberName: 'Alice Uwimana',
          amount: 50000,
          interestRate: 5,
          requestDate: '2023-04-10',
          approvalDate: '2023-04-15',
          dueDate: '2023-06-30',
          amountDue: 30000,
          status: 'overdue',
          purpose: 'Medical expenses'
        },
        {
          id: '3',
          memberId: '4',
          memberName: 'Robert Mugisha',
          amount: 75000,
          interestRate: 5,
          requestDate: '2023-05-20',
          approvalDate: '2023-05-25',
          dueDate: '2023-08-01',
          amountDue: 75000,
          status: 'active',
          purpose: 'Business investment'
        },
        {
          id: '4',
          memberId: '5',
          memberName: 'Grace Ingabire',
          amount: 30000,
          interestRate: 5,
          requestDate: '2023-06-01',
          dueDate: '2023-06-20',
          amountDue: 30000,
          status: 'pending',
          purpose: 'School fees'
        },
        {
          id: '5',
          memberId: '7',
          memberName: 'Diane Mukamana',
          amount: 25000,
          interestRate: 5,
          requestDate: '2023-06-05',
          dueDate: '2023-06-20',
          amountDue: 25000,
          status: 'pending',
          purpose: 'Emergency funds'
        },
        {
          id: '6',
          memberId: '8',
          memberName: 'Eric Habimana',
          amount: 60000,
          interestRate: 5,
          requestDate: '2023-03-10',
          approvalDate: '2023-03-15',
          dueDate: '2023-05-15',
          amountDue: 0,
          status: 'paid',
          purpose: 'Home appliances'
        },
        {
          id: '7',
          memberId: '6',
          memberName: 'Patrick Niyomugabo',
          amount: 40000,
          interestRate: 5,
          requestDate: '2023-04-20',
          dueDate: '2023-04-30',
          amountDue: 40000,
          status: 'rejected',
          purpose: 'Travel expenses'
        }
      ]);
      
    } catch (error) {
      console.error('Loan data fetch error:', error);
      toast.error('Failed to fetch loan data');
    } finally {
      setLoading(false);
    }
  };
  
  const filterLoans = () => {
    let result = [...loans];
    
    // First filter by tab
    result = result.filter(loan => {
      if (activeTab === 'active') {
        return loan.status === 'active' || loan.status === 'overdue';
      } else if (activeTab === 'pending') {
        return loan.status === 'pending';
      } else if (activeTab === 'history') {
        return loan.status === 'paid' || loan.status === 'rejected';
      }
      return true;
    });
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(loan => 
        loan.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.purpose.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(loan => loan.status === statusFilter);
    }
    
    setFilteredLoans(result);
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const calculateProgress = (current: number, total: number) => {
    return Math.min(Math.round(((total - current) / total) * 100), 100);
  };
  
  const getDaysRemaining = (dateString: string) => {
    const today = new Date();
    const dueDate = new Date(dateString);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setStatusFilter('all');
  };
  
  const handleExportData = () => {
    toast.info('Exporting loan data');
    // In a real app, this would generate and download a CSV file
  };
  
  const handleApproveLoan = (loanId: string) => {
    setLoans(loans.map(loan => 
      loan.id === loanId 
        ? { ...loan, status: 'approved', approvalDate: new Date().toISOString() }
        : loan
    ));
    toast.success('Loan approved successfully');
  };
  
  const handleRejectLoan = (loanId: string) => {
    setLoans(loans.map(loan => 
      loan.id === loanId 
        ? { ...loan, status: 'rejected' }
        : loan
    ));
    toast.success('Loan rejected');
  };
  
  const handleRecordPayment = (loanId: string) => {
    toast.info(`Recording payment for loan ${loanId}`);
    // In a real app, this would open a modal or navigate to a form
  };
  
  const getLoanStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Active</span>;
      case 'overdue':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Overdue</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
      case 'paid':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Paid</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Rejected</span>;
      case 'approved':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">Approved</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col space-y-6 w-full">
        {/* Skeleton loading state */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 animate-pulse rounded-xl"></div>
          ))}
        </div>
        <div className="h-16 bg-gray-200 animate-pulse rounded-xl"></div>
        <div className="h-96 bg-gray-200 animate-pulse rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Loans</h1>
          <p className="text-gray-600">Manage loan requests and repayments</p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
          <Button variant="outline" className="flex items-center" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button className="flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Create Loan
          </Button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border border-gray-200 bg-white">
          <div className="flex items-center">
            <CreditCard className="h-8 w-8 text-primary-600 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Total Loaned</p>
              <p className="text-xl font-semibold">{formatCurrency(summary?.totalLoaned || 0)}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 border border-gray-200 bg-white">
          <div className="flex items-center">
            <ArrowUpRight className="h-8 w-8 text-primary-600 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Active Loans</p>
              <p className="text-xl font-semibold">{summary?.activeLoans || 0}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 border border-gray-200 bg-white">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-primary-600 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Pending Requests</p>
              <p className="text-xl font-semibold">{summary?.pendingRequests || 0}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 border border-gray-200 bg-white">
          <div className="flex items-center">
            <CheckCircle2 className="h-8 w-8 text-primary-600 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Repayment Rate</p>
              <p className="text-xl font-semibold">{summary?.repaymentRate || 0}%</p>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Loan Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => handleTabChange('active')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'active'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Active Loans
          </button>
          <button
            onClick={() => handleTabChange('pending')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'pending'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Pending Requests
          </button>
          <button
            onClick={() => handleTabChange('history')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Loan History
          </button>
        </nav>
      </div>
      
      {/* Search and Filter */}
      <Card className="p-5 border border-gray-200 bg-white">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search loans..."
              className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          
          {activeTab === 'active' && (
            <div className="relative">
              <select
                className="pl-4 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
                value={statusFilter}
                onChange={handleStatusFilterChange}
              >
                <option value="all">All Active</option>
                <option value="active">Current</option>
                <option value="overdue">Overdue</option>
              </select>
              <Filter className="h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          )}
          
          {activeTab === 'history' && (
            <div className="relative">
              <select
                className="pl-4 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
                value={statusFilter}
                onChange={handleStatusFilterChange}
              >
                <option value="all">All History</option>
                <option value="paid">Paid</option>
                <option value="rejected">Rejected</option>
              </select>
              <Filter className="h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          )}
        </div>
      </Card>
      
      {/* Loans List */}
      <div className="space-y-6">
        {filteredLoans.length > 0 ? (
          filteredLoans.map(loan => (
            <Card key={loan.id} className="p-5 border border-gray-200 bg-white">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center">
                    <h3 className="text-lg font-semibold text-gray-900">{formatCurrency(loan.amount)}</h3>
                    <div className="ml-2">{getLoanStatusBadge(loan.status)}</div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{loan.memberName} • {loan.purpose}</p>
                </div>
                
                <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
                  {loan.status === 'pending' && (
                    <>
                      <Button size="sm" onClick={() => handleApproveLoan(loan.id)}>
                        Approve
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleRejectLoan(loan.id)}>
                        Reject
                      </Button>
                    </>
                  )}
                  
                  {(loan.status === 'active' || loan.status === 'overdue') && (
                    <Button size="sm" onClick={() => handleRecordPayment(loan.id)}>
                      Record Payment
                    </Button>
                  )}
                  
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
              
              {(loan.status === 'active' || loan.status === 'overdue') && (
                <div className="mt-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {formatCurrency(loan.amount - loan.amountDue)} of {formatCurrency(loan.amount)} repaid
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                      {calculateProgress(loan.amountDue, loan.amount)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${loan.status === 'overdue' ? 'bg-red-500' : 'bg-green-500'}`}
                      style={{ width: `${calculateProgress(loan.amountDue, loan.amount)}%` }}
                    ></div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                      <div>
                        <p className="text-xs text-gray-500">Request Date</p>
                        <p className="font-medium">{formatDate(loan.requestDate)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                      <div>
                        <p className="text-xs text-gray-500">Approval Date</p>
                        <p className="font-medium">{formatDate(loan.approvalDate)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-gray-500 mr-2" />
                      <div>
                        <p className="text-xs text-gray-500">Due Date</p>
                        <p className="font-medium">{formatDate(loan.dueDate)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Wallet className="h-5 w-5 text-gray-500 mr-2" />
                      <div>
                        <p className="text-xs text-gray-500">Amount Due</p>
                        <p className="font-medium">{formatCurrency(loan.amountDue)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {loan.status === 'pending' && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">Request Date</p>
                      <p className="font-medium">{formatDate(loan.requestDate)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-gray-500 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">Interest Rate</p>
                      <p className="font-medium">{loan.interestRate}%</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-gray-500 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">Expected Duration</p>
                      <p className="font-medium">3 months</p>
                    </div>
                  </div>
                </div>
              )}
              
              {(loan.status === 'paid' || loan.status === 'rejected') && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">Request Date</p>
                      <p className="font-medium">{formatDate(loan.requestDate)}</p>
                    </div>
                  </div>
                  
                  {loan.approvalDate && (
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                      <div>
                        <p className="text-xs text-gray-500">Approval Date</p>
                        <p className="font-medium">{formatDate(loan.approvalDate)}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-gray-500 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">Interest Rate</p>
                      <p className="font-medium">{loan.interestRate}%</p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))
        ) : (
          <Card className="p-8 border border-gray-200 bg-white">
            <div className="text-center">
              <Wallet className="h-12 w-12 text-gray-400 mx-auto" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No loans found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your filters to find what you\'re looking for.'
                  : activeTab === 'active'
                    ? 'There are no active loans at the moment.'
                    : activeTab === 'pending'
                      ? 'There are no pending loan requests.'
                      : 'No loan history available.'}
              </p>
              {(searchTerm || statusFilter !== 'all') && (
                <Button variant="outline" className="mt-6" onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}>
                  Clear Filters
                </Button>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default LoansPage; 