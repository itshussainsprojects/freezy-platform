/**
 * Utility functions for handling resource data
 */

/**
 * Parse requirements or benefits that can be either string or array
 * @param data - The requirements/benefits data (string or array)
 * @returns Array of parsed items
 */
export const parseResourceArray = (data: string | string[] | undefined | null): string[] => {
  if (!data) return [];
  
  if (Array.isArray(data)) {
    return data.filter(item => item && item.trim().length > 0);
  }
  
  if (typeof data === 'string') {
    return data
      .split(/[,;|]/) // Split by comma, semicolon, or pipe
      .map(item => item.trim())
      .filter(item => item.length > 0);
  }
  
  return [];
};

/**
 * Format resource array back to string for forms
 * @param data - Array of items
 * @returns Comma-separated string
 */
export const formatResourceArray = (data: string[] | undefined | null): string => {
  if (!data || !Array.isArray(data)) return '';
  return data.join(', ');
};

/**
 * Get resource type icon name
 * @param type - Resource type
 * @returns Icon component name
 */
export const getResourceTypeIcon = (type: string) => {
  switch (type) {
    case 'job':
      return 'Briefcase';
    case 'course':
      return 'BookOpen';
    case 'tool':
      return 'Wrench';
    default:
      return 'Briefcase';
  }
};

/**
 * Get resource type color classes
 * @param type - Resource type
 * @returns Object with color classes
 */
export const getResourceTypeColors = (type: string) => {
  switch (type) {
    case 'job':
      return {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        border: 'border-blue-200'
      };
    case 'course':
      return {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-200'
      };
    case 'tool':
      return {
        bg: 'bg-purple-100',
        text: 'text-purple-800',
        border: 'border-purple-200'
      };
    default:
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        border: 'border-gray-200'
      };
  }
};

/**
 * Truncate text to specified length
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text with ellipsis if needed
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Format duration text
 * @param duration - Duration string
 * @returns Formatted duration
 */
export const formatDuration = (duration: string | undefined): string => {
  if (!duration) return '';
  
  // Common duration formats
  const durationLower = duration.toLowerCase();
  
  if (durationLower.includes('full-time') || durationLower.includes('fulltime')) {
    return 'Full-time';
  }
  if (durationLower.includes('part-time') || durationLower.includes('parttime')) {
    return 'Part-time';
  }
  if (durationLower.includes('contract')) {
    return 'Contract';
  }
  if (durationLower.includes('internship')) {
    return 'Internship';
  }
  if (durationLower.includes('remote')) {
    return 'Remote';
  }
  if (durationLower.includes('hour')) {
    return duration;
  }
  if (durationLower.includes('week')) {
    return duration;
  }
  if (durationLower.includes('month')) {
    return duration;
  }
  if (durationLower.includes('year')) {
    return duration;
  }
  
  return duration;
};

/**
 * Validate resource data
 * @param resource - Resource object
 * @returns Validation result
 */
export const validateResource = (resource: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!resource.title || resource.title.trim().length === 0) {
    errors.push('Title is required');
  }
  
  if (!resource.description || resource.description.trim().length === 0) {
    errors.push('Description is required');
  }
  
  if (!resource.type || !['job', 'course', 'tool'].includes(resource.type)) {
    errors.push('Valid type is required (job, course, or tool)');
  }
  
  if (resource.source_url && !isValidUrl(resource.source_url)) {
    errors.push('Source URL must be a valid URL');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Check if string is a valid URL
 * @param string - String to check
 * @returns Boolean indicating if valid URL
 */
const isValidUrl = (string: string): boolean => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

/**
 * Generate resource slug from title
 * @param title - Resource title
 * @returns URL-friendly slug
 */
export const generateResourceSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim('-'); // Remove leading/trailing hyphens
};
