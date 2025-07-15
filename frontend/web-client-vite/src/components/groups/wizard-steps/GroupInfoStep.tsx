import React, { useState, useEffect } from 'react';
import { Upload, X } from 'lucide-react';
import type { GroupFormData } from '../CreateGroupWizard';

interface GroupInfoStepProps {
  data: GroupFormData;
  updateData: (data: Partial<GroupFormData>) => void;
  validateStep: (isValid: boolean) => void;
}

const GroupInfoStep: React.FC<GroupInfoStepProps> = ({ 
  data, 
  updateData, 
  validateStep 
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [iconPreview, setIconPreview] = useState<string | null>(null);

  // Validate on mount and when fields change
  useEffect(() => {
    validateForm();
  }, [data.name, data.description, data.visibility]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (!data.name.trim()) {
      newErrors.name = 'Group name is required';
      isValid = false;
    } else if (data.name.length < 3) {
      newErrors.name = 'Group name must be at least 3 characters';
      isValid = false;
    } else if (data.name.length > 50) {
      newErrors.name = 'Group name cannot exceed 50 characters';
      isValid = false;
    }

    if (!data.description.trim()) {
      newErrors.description = 'Description is required';
      isValid = false;
    } else if (data.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
      isValid = false;
    } else if (data.description.length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters';
      isValid = false;
    }

    setErrors(newErrors);
    validateStep(isValid);
    return isValid;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    updateData({ [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Update the form data with the file
      updateData({ icon: file });
      
      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);
      setIconPreview(previewUrl);
    }
  };

  const removeIcon = () => {
    updateData({ icon: null });
    if (iconPreview) {
      URL.revokeObjectURL(iconPreview);
      setIconPreview(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Group Information</h2>
        <p className="mt-1 text-sm text-gray-500">
          Provide basic information about your savings group.
        </p>
      </div>

      <div className="space-y-4">
        {/* Group Icon */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Group Icon (Optional)
          </label>
          <div className="flex items-center">
            {iconPreview ? (
              <div className="relative">
                <img 
                  src={iconPreview} 
                  alt="Group icon preview" 
                  className="h-24 w-24 rounded-full object-cover border-2 border-gray-200"
                />
                <button
                  type="button"
                  onClick={removeIcon}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600"
                  aria-label="Remove icon"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex justify-center items-center h-24 w-24 rounded-full border-2 border-dashed border-gray-300 bg-gray-50">
                <label
                  htmlFor="icon-upload"
                  className="cursor-pointer flex flex-col items-center justify-center"
                >
                  <Upload className="h-6 w-6 text-gray-400" />
                  <span className="mt-1 text-xs text-gray-500">Upload</span>
                  <input
                    id="icon-upload"
                    name="icon"
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            )}
            <div className="ml-4 text-sm text-gray-600">
              <p>Upload a group icon or logo.</p>
              <p>Recommended: Square image, at least 200x200 pixels.</p>
            </div>
          </div>
        </div>

        {/* Group Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Group Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={data.name}
            onChange={handleInputChange}
            className={`block w-full rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter group name"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
          />
          {errors.name && (
            <p id="name-error" className="mt-1 text-sm text-red-600">
              {errors.name}
            </p>
          )}
        </div>

        {/* Group Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={data.description}
            onChange={handleInputChange}
            className={`block w-full rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Describe your group's purpose, goals, and any other relevant information"
            aria-invalid={!!errors.description}
            aria-describedby={errors.description ? "description-error" : undefined}
          />
          {errors.description && (
            <p id="description-error" className="mt-1 text-sm text-red-600">
              {errors.description}
            </p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            {data.description.length}/500 characters
          </p>
        </div>

        {/* Group Visibility */}
        <div>
          <label htmlFor="visibility" className="block text-sm font-medium text-gray-700 mb-1">
            Group Visibility *
          </label>
          <select
            id="visibility"
            name="visibility"
            value={data.visibility}
            onChange={handleInputChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          >
            <option value="private">Private (Invitation only)</option>
            <option value="public">Public (Anyone can find and request to join)</option>
            <option value="unlisted">Unlisted (Only accessible via direct link)</option>
          </select>
          <p className="mt-1 text-sm text-gray-500">
            {data.visibility === 'private' && 'Only invited members can join this group.'}
            {data.visibility === 'public' && 'Anyone can find and request to join this group.'}
            {data.visibility === 'unlisted' && 'Only people with the direct link can find this group.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GroupInfoStep; 