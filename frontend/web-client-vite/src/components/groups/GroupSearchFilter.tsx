import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

export interface GroupFilterOptions {
  query: string;
  visibility: 'all' | 'public' | 'private';
  contributionMin: number;
  contributionMax: number;
  frequency: 'all' | 'weekly' | 'biweekly' | 'monthly';
}

interface GroupSearchFilterProps {
  onFilterChange: (filters: GroupFilterOptions) => void;
  isLoading?: boolean;
}

const GroupSearchFilter: React.FC<GroupSearchFilterProps> = ({ 
  onFilterChange,
  isLoading = false 
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<GroupFilterOptions>({
    query: '',
    visibility: 'all',
    contributionMin: 0,
    contributionMax: 1000000,
    frequency: 'all'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle numeric inputs
    if (name === 'contributionMin' || name === 'contributionMax') {
      const numValue = value === '' ? 0 : parseInt(value, 10);
      setFilters(prev => ({ ...prev, [name]: numValue }));
    } else {
      setFilters(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange(filters);
  };

  const toggleFilters = () => {
    setShowFilters(prev => !prev);
  };

  return (
    <div className="mb-6 space-y-4">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-2">
          <div className="relative flex-grow">
            <input
              type="text"
              name="query"
              placeholder="Search groups by name or ID..."
              className="pl-10 pr-4 py-2 border rounded-md w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={filters.query}
              onChange={handleInputChange}
              aria-label="Search groups"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <Button 
            type="button" 
            variant="outline" 
            onClick={toggleFilters}
            aria-expanded={showFilters}
            aria-controls="filter-panel"
          >
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Searching...' : 'Search'}
          </Button>
        </div>

        {showFilters && (
          <Card id="filter-panel" className="mt-4">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label htmlFor="visibility" className="block text-sm font-medium text-gray-700">
                    Visibility
                  </label>
                  <select
                    id="visibility"
                    name="visibility"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    value={filters.visibility}
                    onChange={handleInputChange}
                  >
                    <option value="all">All Groups</option>
                    <option value="public">Public Only</option>
                    <option value="private">Private Only</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="frequency" className="block text-sm font-medium text-gray-700">
                    Contribution Frequency
                  </label>
                  <select
                    id="frequency"
                    name="frequency"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    value={filters.frequency}
                    onChange={handleInputChange}
                  >
                    <option value="all">All Frequencies</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="contributionMin" className="block text-sm font-medium text-gray-700">
                    Min Contribution (RWF)
                  </label>
                  <input
                    type="number"
                    id="contributionMin"
                    name="contributionMin"
                    min="0"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    value={filters.contributionMin}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="contributionMax" className="block text-sm font-medium text-gray-700">
                    Max Contribution (RWF)
                  </label>
                  <input
                    type="number"
                    id="contributionMax"
                    name="contributionMax"
                    min="0"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    value={filters.contributionMax}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setFilters({
                      query: '',
                      visibility: 'all',
                      contributionMin: 0,
                      contributionMax: 1000000,
                      frequency: 'all'
                    });
                  }}
                  className="mr-2"
                >
                  Reset
                </Button>
                <Button type="submit" disabled={isLoading}>
                  Apply Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  );
};

export default GroupSearchFilter; 