import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Download, FileText, FileSpreadsheet, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';

export type ReportFormat = 'pdf' | 'csv' | 'excel';
export type DateRange = 'all' | 'month' | 'quarter' | 'year' | 'custom';

interface ReportExportOptionsProps {
  title?: string;
  description?: string;
  onExport: (format: ReportFormat, dateRange: DateRange, startDate?: string, endDate?: string) => void;
  supportedFormats?: ReportFormat[];
  className?: string;
  isLoading?: boolean;
}

const ReportExportOptions: React.FC<ReportExportOptionsProps> = ({
  title = 'Export Report',
  description = 'Download your report in different formats',
  onExport,
  supportedFormats = ['pdf', 'csv', 'excel'],
  className = '',
  isLoading = false,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ReportFormat>('pdf');
  const [dateRange, setDateRange] = useState<DateRange>('month');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const handleExport = () => {
    if (dateRange === 'custom' && (!startDate || !endDate)) {
      toast.error('Please select both start and end dates');
      return;
    }
    
    onExport(selectedFormat, dateRange, startDate, endDate);
  };

  // Get current date in YYYY-MM-DD format for the date inputs
  const getCurrentDate = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Get date from 30 days ago in YYYY-MM-DD format
  const getDefaultStartDate = (): string => {
    const now = new Date();
    now.setDate(now.getDate() - 30);
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Initialize dates if they're empty
  React.useEffect(() => {
    if (!startDate) {
      setStartDate(getDefaultStartDate());
    }
    if (!endDate) {
      setEndDate(getCurrentDate());
    }
  }, []);

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {title && <h3 className="text-lg font-medium text-gray-900">{title}</h3>}
          {description && <p className="text-sm text-gray-500">{description}</p>}
          
          <div className="space-y-4 pt-2">
            {/* Format Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Format
              </label>
              <div className="grid grid-cols-3 gap-3">
                {supportedFormats.includes('pdf') && (
                  <div
                    className={`border rounded-md p-3 cursor-pointer transition-colors flex flex-col items-center ${
                      selectedFormat === 'pdf' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedFormat('pdf')}
                  >
                    <FileText className="h-6 w-6 text-gray-600 mb-1" />
                    <span className="text-sm font-medium">PDF</span>
                  </div>
                )}
                
                {supportedFormats.includes('csv') && (
                  <div
                    className={`border rounded-md p-3 cursor-pointer transition-colors flex flex-col items-center ${
                      selectedFormat === 'csv' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedFormat('csv')}
                  >
                    <FileText className="h-6 w-6 text-gray-600 mb-1" />
                    <span className="text-sm font-medium">CSV</span>
                  </div>
                )}
                
                {supportedFormats.includes('excel') && (
                  <div
                    className={`border rounded-md p-3 cursor-pointer transition-colors flex flex-col items-center ${
                      selectedFormat === 'excel' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedFormat('excel')}
                  >
                    <FileSpreadsheet className="h-6 w-6 text-gray-600 mb-1" />
                    <span className="text-sm font-medium">Excel</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Date Range Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <div
                  className={`border rounded-md p-2 cursor-pointer transition-colors text-center ${
                    dateRange === 'month' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => setDateRange('month')}
                >
                  <span className="text-sm">This Month</span>
                </div>
                <div
                  className={`border rounded-md p-2 cursor-pointer transition-colors text-center ${
                    dateRange === 'quarter' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => setDateRange('quarter')}
                >
                  <span className="text-sm">This Quarter</span>
                </div>
                <div
                  className={`border rounded-md p-2 cursor-pointer transition-colors text-center ${
                    dateRange === 'year' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => setDateRange('year')}
                >
                  <span className="text-sm">This Year</span>
                </div>
                <div
                  className={`border rounded-md p-2 cursor-pointer transition-colors text-center ${
                    dateRange === 'all' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => setDateRange('all')}
                >
                  <span className="text-sm">All Time</span>
                </div>
                <div
                  className={`border rounded-md p-2 cursor-pointer transition-colors text-center ${
                    dateRange === 'custom' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => setDateRange('custom')}
                >
                  <span className="text-sm">Custom</span>
                </div>
              </div>
            </div>
            
            {/* Custom Date Range */}
            {dateRange === 'custom' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    max={endDate}
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                    max={getCurrentDate()}
                  />
                </div>
              </div>
            )}
            
            {/* Export Button */}
            <div className="pt-2">
              <Button 
                className="w-full flex items-center justify-center"
                onClick={handleExport}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export {selectedFormat.toUpperCase()}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportExportOptions; 