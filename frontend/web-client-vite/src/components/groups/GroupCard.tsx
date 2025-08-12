import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  CreditCard, 
  ChevronRight,
  Clock,
  CheckCircle,
  AlertCircle,
  PiggyBank
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';

interface GroupCardProps {
  // Primary props
  id?: string;
  name?: string;
  memberCount?: number;
  contributionAmount?: number;
  contributionFrequency?: 'weekly' | 'biweekly' | 'monthly' | string;
  nextContributionDate?: string;
  status?: 'active' | 'pending' | 'completed' | string;
  balance?: number;
  isOverdue?: boolean;
  className?: string;

  // Optional extra props used by some callers
  description?: string;
  isPrivate?: boolean;
  currency?: string;
  onJoinRequest?: (groupId: string) => void;
  onViewDetails?: (groupId: string) => void;

  // Alternate input shape supported by some pages
  group?: {
    _id?: string;
    id?: string;
    name?: string;
    description?: string;
    memberCount?: number;
    contributionAmount?: number;
    contributionFrequency?: string;
    contributionSettings?: { amount?: number; frequency?: string; currency?: string };
    status?: string;
    balance?: number;
    createdAt?: string;
  };
}

const GroupCard: React.FC<GroupCardProps> = ({
  id,
  name,
  memberCount,
  contributionAmount,
  contributionFrequency,
  nextContributionDate,
  status,
  balance = 0,
  isOverdue = false,
  className,
  group
}) => {
  // Normalize inputs to support both direct props and `group` object shape
  const effectiveId = id ?? group?.id ?? group?._id ?? '';
  const effectiveName = name ?? group?.name ?? 'Untitled Group';
  const effectiveMemberCount =
    typeof memberCount === 'number'
      ? memberCount
      : typeof group?.memberCount === 'number'
      ? group.memberCount
      : 0;
  const effectiveContributionAmount =
    typeof contributionAmount === 'number'
      ? contributionAmount
      : typeof group?.contributionAmount === 'number'
      ? group.contributionAmount
      : group?.contributionSettings?.amount ?? 0;
  const effectiveContributionFrequency =
    contributionFrequency ?? group?.contributionFrequency ?? group?.contributionSettings?.frequency ?? 'monthly';
  const effectiveStatus = (status ?? group?.status ?? 'active') as string;
  const effectiveNextContributionDate =
    nextContributionDate ?? group?.createdAt ?? new Date().toISOString();
  const effectiveBalance = typeof balance === 'number' ? balance : group?.balance ?? 0;

  const getStatusColor = () => {
    switch (effectiveStatus) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getStatusIcon = () => {
    switch (effectiveStatus) {
      case 'active':
        return <CheckCircle className="h-4 w-4 mr-1" />;
      case 'pending':
        return <Clock className="h-4 w-4 mr-1" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };

  const getFrequencyLabel = () => {
    switch (effectiveContributionFrequency) {
      case 'weekly':
        return 'Weekly';
      case 'biweekly':
        return 'Every 2 weeks';
      case 'monthly':
        return 'Monthly';
      default:
        return String(effectiveContributionFrequency || '');
    }
  };

  return (
    <div className={`
      bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg shadow-card dark:shadow-dark-card overflow-hidden
      transition-all duration-300 hover:shadow-lg hover:border-primary-200 dark:hover:border-primary-900
      ${className}
    `}>
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text">{effectiveName}</h3>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor()}`}>
            {getStatusIcon()}
            {(effectiveStatus && effectiveStatus.length > 0)
              ? effectiveStatus.charAt(0).toUpperCase() + effectiveStatus.slice(1)
              : 'Active'}
          </span>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Users className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-500" />
            <span>{effectiveMemberCount} members</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <CreditCard className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-500" />
            <span>{formatCurrency(effectiveContributionAmount)} {getFrequencyLabel()}</span>
          </div>
          
          <div className="flex items-center text-sm">
            <Calendar className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-500" />
            <div className="flex flex-col">
              <span className="text-gray-600 dark:text-gray-400">Next contribution:</span>
              <span className={`font-medium ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-300'}`}>
                {isOverdue && <AlertCircle className="h-3 w-3 inline mr-1" />}
                {formatDate(effectiveNextContributionDate)}
              </span>
            </div>
          </div>
          
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <PiggyBank className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-500" />
            <span>Group balance: <span className="font-medium text-gray-900 dark:text-gray-300">{formatCurrency(effectiveBalance)}</span></span>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 dark:bg-dark-background/50 px-5 py-3 border-t border-gray-200 dark:border-dark-border">
        <Link 
          to={`/member/group/${effectiveId || '#'}`} 
          className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center justify-between"
        >
          View group details
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};

export default GroupCard; 