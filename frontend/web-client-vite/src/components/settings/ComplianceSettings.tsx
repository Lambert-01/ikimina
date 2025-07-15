import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { toast } from 'react-toastify';
import { FileText, Upload, CheckCircle, AlertTriangle, X, ExternalLink, Download } from 'lucide-react';

interface ComplianceDocument {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'not_submitted';
  required: boolean;
  dateSubmitted?: string;
  dateReviewed?: string;
  fileUrl?: string;
  rejectionReason?: string;
}

interface ComplianceAgreement {
  id: string;
  name: string;
  description: string;
  accepted: boolean;
  required: boolean;
  version: string;
  dateAccepted?: string;
}

interface ComplianceSettingsProps {
  onUploadDocument?: (documentId: string, file: File) => Promise<void>;
  onDeleteDocument?: (documentId: string) => Promise<void>;
  onAcceptAgreement?: (agreementId: string) => Promise<void>;
  className?: string;
}

const ComplianceSettings: React.FC<ComplianceSettingsProps> = ({
  onUploadDocument,
  onDeleteDocument,
  onAcceptAgreement,
  className = '',
}) => {
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<ComplianceDocument[]>([]);
  const [agreements, setAgreements] = useState<ComplianceAgreement[]>([]);
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);
  const [acceptingAgreementId, setAcceptingAgreementId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // In a real app, this would be an API call
        // For demo purposes, we'll simulate data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock compliance documents
        const mockDocuments: ComplianceDocument[] = [
          {
            id: 'national_id',
            name: 'National ID Card',
            description: 'Front and back of your Rwandan national ID card',
            status: 'approved',
            required: true,
            dateSubmitted: '2023-01-15',
            dateReviewed: '2023-01-17',
            fileUrl: 'https://example.com/documents/national_id.pdf'
          },
          {
            id: 'proof_of_address',
            name: 'Proof of Address',
            description: 'Utility bill or bank statement showing your current address',
            status: 'pending',
            required: true,
            dateSubmitted: '2023-02-20',
            fileUrl: 'https://example.com/documents/proof_of_address.pdf'
          },
          {
            id: 'tax_certificate',
            name: 'Tax Clearance Certificate',
            description: 'Certificate showing your tax compliance status',
            status: 'not_submitted',
            required: false
          }
        ];
        
        // Mock compliance agreements
        const mockAgreements: ComplianceAgreement[] = [
          {
            id: 'terms_of_service',
            name: 'Terms of Service',
            description: 'Agreement to the IKIMINA platform terms of service',
            accepted: true,
            required: true,
            version: 'v1.2',
            dateAccepted: '2023-01-10'
          },
          {
            id: 'privacy_policy',
            name: 'Privacy Policy',
            description: 'Agreement to how your data is collected and used',
            accepted: true,
            required: true,
            version: 'v1.1',
            dateAccepted: '2023-01-10'
          },
          {
            id: 'rwanda_law_058_2021',
            name: 'Rwanda Law 058/2021',
            description: 'Compliance with Rwanda Law on Savings Groups',
            accepted: false,
            required: true,
            version: 'v1.0'
          },
          {
            id: 'gdpr',
            name: 'GDPR Compliance',
            description: 'European data protection regulations',
            accepted: false,
            required: false,
            version: 'v1.0'
          }
        ];
        
        setDocuments(mockDocuments);
        setAgreements(mockAgreements);
      } catch (error) {
        console.error('Error fetching compliance settings:', error);
        toast.error('Failed to load compliance settings');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleFileUpload = async (documentId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const file = e.target.files[0];
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }
    
    // Check file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF, JPEG, or PNG file');
      return;
    }
    
    try {
      setUploadingDocId(documentId);
      
      if (onUploadDocument) {
        await onUploadDocument(documentId, file);
      } else {
        // In a real app, this would call the API to upload the document
        // For demo purposes, we'll simulate a delay
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      // Update the document status
      setDocuments(prevDocs => 
        prevDocs.map(doc => {
          if (doc.id === documentId) {
            return {
              ...doc,
              status: 'pending',
              dateSubmitted: new Date().toISOString().split('T')[0],
              fileUrl: URL.createObjectURL(file)
            };
          }
          return doc;
        })
      );
      
      toast.success('Document uploaded successfully');
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    } finally {
      setUploadingDocId(null);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      setUploadingDocId(documentId);
      
      if (onDeleteDocument) {
        await onDeleteDocument(documentId);
      } else {
        // In a real app, this would call the API to delete the document
        // For demo purposes, we'll simulate a delay
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Update the document status
      setDocuments(prevDocs => 
        prevDocs.map(doc => {
          if (doc.id === documentId) {
            return {
              ...doc,
              status: 'not_submitted',
              dateSubmitted: undefined,
              dateReviewed: undefined,
              fileUrl: undefined,
              rejectionReason: undefined
            };
          }
          return doc;
        })
      );
      
      toast.success('Document deleted successfully');
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    } finally {
      setUploadingDocId(null);
    }
  };

  const handleAcceptAgreement = async (agreementId: string) => {
    try {
      setAcceptingAgreementId(agreementId);
      
      if (onAcceptAgreement) {
        await onAcceptAgreement(agreementId);
      } else {
        // In a real app, this would call the API to accept the agreement
        // For demo purposes, we'll simulate a delay
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Update the agreement status
      setAgreements(prevAgreements => 
        prevAgreements.map(agreement => {
          if (agreement.id === agreementId) {
            return {
              ...agreement,
              accepted: true,
              dateAccepted: new Date().toISOString().split('T')[0]
            };
          }
          return agreement;
        })
      );
      
      toast.success('Agreement accepted successfully');
    } catch (error) {
      console.error('Error accepting agreement:', error);
      toast.error('Failed to accept agreement');
    } finally {
      setAcceptingAgreementId(null);
    }
  };

  // Format date
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get document status badge
  const getDocumentStatusBadge = (status: ComplianceDocument['status']) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <X className="h-3 w-3 mr-1" />
            Rejected
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Pending Review
          </span>
        );
      case 'not_submitted':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Not Submitted
          </span>
        );
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading compliance settings...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Check if all required documents are submitted and all required agreements are accepted
  const allRequiredDocumentsSubmitted = documents
    .filter(doc => doc.required)
    .every(doc => doc.status !== 'not_submitted');
  
  const allRequiredAgreementsAccepted = agreements
    .filter(agreement => agreement.required)
    .every(agreement => agreement.accepted);
  
  const isFullyCompliant = allRequiredDocumentsSubmitted && allRequiredAgreementsAccepted;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Compliance Settings</CardTitle>
        <CardDescription>
          Manage your compliance documents and agreements
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Compliance Status */}
        <div className={`p-4 rounded-md ${isFullyCompliant ? 'bg-green-50' : 'bg-yellow-50'}`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {isFullyCompliant ? (
                <CheckCircle className="h-5 w-5 text-green-400" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              )}
            </div>
            <div className="ml-3">
              <h3 className={`text-sm font-medium ${isFullyCompliant ? 'text-green-800' : 'text-yellow-800'}`}>
                {isFullyCompliant ? 'Your account is fully compliant' : 'Your account needs attention'}
              </h3>
              <div className={`mt-2 text-sm ${isFullyCompliant ? 'text-green-700' : 'text-yellow-700'}`}>
                {isFullyCompliant ? (
                  <p>
                    You have submitted all required documents and accepted all required agreements.
                  </p>
                ) : (
                  <p>
                    Please submit all required documents and accept all required agreements to ensure compliance.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Documents Section */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Required Documents</h3>
          
          <div className="space-y-4">
            {documents.map(document => (
              <div key={document.id} className="border rounded-md p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-2" />
                      <h4 className="text-md font-medium text-gray-900">
                        {document.name}
                        {document.required && <span className="text-red-500 ml-1">*</span>}
                      </h4>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{document.description}</p>
                    
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center">
                        <span className="text-xs text-gray-500 w-24">Status:</span>
                        {getDocumentStatusBadge(document.status)}
                      </div>
                      
                      {document.dateSubmitted && (
                        <div className="flex items-center">
                          <span className="text-xs text-gray-500 w-24">Submitted:</span>
                          <span className="text-xs text-gray-900">{formatDate(document.dateSubmitted)}</span>
                        </div>
                      )}
                      
                      {document.dateReviewed && (
                        <div className="flex items-center">
                          <span className="text-xs text-gray-500 w-24">Reviewed:</span>
                          <span className="text-xs text-gray-900">{formatDate(document.dateReviewed)}</span>
                        </div>
                      )}
                      
                      {document.rejectionReason && (
                        <div className="mt-2 bg-red-50 p-2 rounded-md">
                          <p className="text-xs text-red-700">
                            <span className="font-medium">Rejection reason:</span> {document.rejectionReason}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    {document.status === 'not_submitted' || document.status === 'rejected' ? (
                      <div>
                        <label className="cursor-pointer">
                          <span className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                            <Upload className="h-4 w-4 mr-1" />
                            Upload
                          </span>
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileUpload(document.id, e)}
                            disabled={uploadingDocId === document.id}
                          />
                        </label>
                      </div>
                    ) : document.status === 'pending' || document.status === 'approved' ? (
                      <>
                        {document.fileUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            asChild
                          >
                            <a href={document.fileUrl} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4 mr-1" />
                              View
                            </a>
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteDocument(document.id)}
                          disabled={uploadingDocId === document.id}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : null}
                    
                    {uploadingDocId === document.id && (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary-600 mr-2"></div>
                        <span className="text-xs text-gray-500">
                          {document.status === 'not_submitted' || document.status === 'rejected' ? 'Uploading...' : 'Deleting...'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Agreements Section */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Legal Agreements</h3>
          
          <div className="space-y-4">
            {agreements.map(agreement => (
              <div key={agreement.id} className="border rounded-md p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-2" />
                      <h4 className="text-md font-medium text-gray-900">
                        {agreement.name}
                        {agreement.required && <span className="text-red-500 ml-1">*</span>}
                      </h4>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{agreement.description}</p>
                    
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center">
                        <span className="text-xs text-gray-500 w-24">Status:</span>
                        {agreement.accepted ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Accepted
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Not Accepted
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center">
                        <span className="text-xs text-gray-500 w-24">Version:</span>
                        <span className="text-xs text-gray-900">{agreement.version}</span>
                      </div>
                      
                      {agreement.dateAccepted && (
                        <div className="flex items-center">
                          <span className="text-xs text-gray-500 w-24">Accepted on:</span>
                          <span className="text-xs text-gray-900">{formatDate(agreement.dateAccepted)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                    >
                      <a href="#" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View
                      </a>
                    </Button>
                    
                    {!agreement.accepted && (
                      <Button
                        size="sm"
                        onClick={() => handleAcceptAgreement(agreement.id)}
                        disabled={acceptingAgreementId === agreement.id}
                      >
                        {acceptingAgreementId === agreement.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-1"></div>
                            Accepting...
                          </>
                        ) : (
                          'Accept'
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Compliance Information */}
        <div className="border-t pt-6">
          <div className="bg-blue-50 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Important Information</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p className="mb-2">
                    IKIMINA is committed to complying with all relevant regulations, including:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Rwanda Law 058/2021 on Savings Groups</li>
                    <li>National Bank of Rwanda regulations on financial services</li>
                    <li>Data protection regulations (including GDPR where applicable)</li>
                    <li>Anti-money laundering (AML) and Know Your Customer (KYC) requirements</li>
                  </ul>
                  <p className="mt-2">
                    For any compliance-related questions, please contact our compliance team at compliance@ikimina.com
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComplianceSettings; 