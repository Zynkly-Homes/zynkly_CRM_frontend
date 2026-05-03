import React, { useState } from 'react';
import { Link, Plus, Settings } from 'lucide-react';
import { MyInput } from '../atoms/MyInput';
import { MyButton } from '../atoms/MyButton';
import { MyDatePicker } from '../atoms/MyDatePicker';
import { FormGroup } from '../molecules/FormGroup';
import { useShortener } from '../hooks/useShortener';
import { showToast } from '../atoms/MyToast';

export const ShortenerForm: React.FC = () => {
  const [formData, setFormData] = useState({
    destination: '',
    utmSource: '',
    campaignId: '',
    ttlSeconds: '',
    preferredLength: '',
    expiresAt: '',
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { createShortUrl, isLoading } = useShortener();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.destination) {
      newErrors.destination = 'Destination URL is required';
    } else if (!/^https?:\/\/.+/.test(formData.destination)) {
      newErrors.destination = 'Please enter a valid URL with http:// or https://';
    }
    
    if (formData.preferredLength && (parseInt(formData.preferredLength) < 4 || parseInt(formData.preferredLength) > 20)) {
      newErrors.preferredLength = 'Preferred length must be between 4 and 20';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const payload = {
        destination: formData.destination,
        meta: {
          utm_source: formData.utmSource || undefined,
          campaign_id: formData.campaignId || undefined,
        },
        ttlSeconds: formData.ttlSeconds ? parseInt(formData.ttlSeconds) : undefined,
        preferredLength: formData.preferredLength ? parseInt(formData.preferredLength) : undefined,
      };
      
      const result = await createShortUrl(payload);
      showToast.success('Short URL created successfully!');
      
      // Reset form
      setFormData({
        destination: '',
        utmSource: '',
        campaignId: '',
        ttlSeconds: '',
        preferredLength: '',
        expiresAt: '',
      });
    } catch (error) {
      showToast.error('Failed to create short URL');
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormGroup
        title="Create Short URL"
        description="Transform your long URLs into short, shareable links"
      >
        <MyInput
          type="url"
          label="Destination URL"
          value={formData.destination}
          onChange={(e) => handleChange('destination', e.target.value)}
          error={errors.destination}
          placeholder="https://example.com/your-long-url"
          leftIcon={<Link className="h-5 w-5 text-gray-400" />}
        />

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Advanced Options
          </span>
          <MyButton
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            leftIcon={<Settings className="h-4 w-4" />}
          >
            {showAdvanced ? 'Hide' : 'Show'}
          </MyButton>
        </div>

        {showAdvanced && (
          <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MyInput
                type="text"
                label="UTM Source"
                value={formData.utmSource}
                onChange={(e) => handleChange('utmSource', e.target.value)}
                placeholder="instagram"
              />
              
              <MyInput
                type="text"
                label="Campaign ID"
                value={formData.campaignId}
                onChange={(e) => handleChange('campaignId', e.target.value)}
                placeholder="cmp_2025"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MyInput
                type="number"
                label="TTL (seconds)"
                value={formData.ttlSeconds}
                onChange={(e) => handleChange('ttlSeconds', e.target.value)}
                placeholder="3600"
                min="0"
              />
              
              <MyInput
                type="number"
                label="Preferred Length"
                value={formData.preferredLength}
                onChange={(e) => handleChange('preferredLength', e.target.value)}
                placeholder="6"
                min="4"
                max="20"
                error={errors.preferredLength}
              />
            </div>
          </div>
        )}

        <MyButton
          type="submit"
          className="w-full md:w-auto"
          isLoading={isLoading}
          leftIcon={<Plus className="h-5 w-5" />}
        >
          Create Short URL
        </MyButton>
      </FormGroup>
    </form>
  );
};
