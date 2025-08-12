import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Loader2 } from 'lucide-react';

export interface JoinGroupRequestData {
  groupId: string;
  joinCode?: string;
}

export interface JoinGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: JoinGroupRequestData) => Promise<void>;
  groupId: string;
  groupName: string;
  isLoading: boolean;
}

const JoinGroupModal: React.FC<JoinGroupModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  groupId,
  groupName,
  isLoading
}) => {
  const [joinCode, setJoinCode] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ groupId, joinCode });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">Join {groupName}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Label htmlFor="joinCode">Join Code</Label>
            <Input
              id="joinCode"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="Enter join code (if required)"
              className="mt-1"
            />
            <p className="text-sm text-gray-500 mt-1">
              Some groups require a join code to become a member.
            </p>
          </div>
          
          <div className="flex justify-end space-x-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Joining...
                </>
              ) : (
                'Join Group'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinGroupModal; 