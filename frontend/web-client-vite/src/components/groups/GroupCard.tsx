import React from 'react';
import { Users, Calendar, CreditCard, Lock, Unlock, Info } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';

export interface GroupCardProps {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  contributionAmount: number;
  contributionFrequency: string;
  isPrivate: boolean;
  currency?: string;
  onJoinRequest: (groupId: string) => void;
  onViewDetails: (groupId: string) => void;
}

const GroupCard: React.FC<GroupCardProps> = ({
  id,
  name,
  description,
  memberCount,
  contributionAmount,
  contributionFrequency,
  isPrivate,
  currency = 'RWF',
  onJoinRequest,
  onViewDetails
}) => {
  // Format contribution frequency for display
  const formatFrequency = (frequency: string): string => {
    switch (frequency) {
      case 'weekly':
        return 'Weekly';
      case 'biweekly':
        return 'Bi-weekly';
      case 'monthly':
        return 'Monthly';
      default:
        return frequency.charAt(0).toUpperCase() + frequency.slice(1);
    }
  };

  // Format currency amount
  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Card className="h-full hover:shadow-md transition-shadow duration-300">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold">{name}</CardTitle>
            <CardDescription className="mt-1 text-sm text-gray-600">
              Group ID: {id.substring(0, 8)}...
            </CardDescription>
          </div>
          {isPrivate ? (
            <Lock className="h-5 w-5 text-gray-500" aria-label="Private group" />
          ) : (
            <Unlock className="h-5 w-5 text-green-500" aria-label="Public group" />
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-gray-700 mb-4 line-clamp-2">{description}</p>
        
        <div className="space-y-3">
          <div className="flex items-center text-sm">
            <Users className="h-4 w-4 mr-2 text-gray-500" />
            <span>{memberCount} Members</span>
          </div>
          
          <div className="flex items-center text-sm">
            <CreditCard className="h-4 w-4 mr-2 text-gray-500" />
            <span>Contribution: {formatAmount(contributionAmount)}</span>
          </div>
          
          <div className="flex items-center text-sm">
            <Calendar className="h-4 w-4 mr-2 text-gray-500" />
            <span>Frequency: {formatFrequency(contributionFrequency)}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onViewDetails(id)}
          className="flex items-center"
        >
          <Info className="h-4 w-4 mr-1" />
          Details
        </Button>
        
        <Button 
          onClick={() => onJoinRequest(id)}
          size="sm"
          className="bg-primary-600 hover:bg-primary-700"
        >
          Request to Join
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GroupCard; 