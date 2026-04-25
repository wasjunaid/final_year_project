// Document Type Constants - Match backend VALID_UNVERIFIED_DOCUMENT_TYPES

export const DOCUMENT_TYPES = {
  PERSONAL: 'personal',
  LAB_TEST: 'lab test',
  PRESCRIPTION: 'prescription'
} as const;

export type DocumentTypeValue = typeof DOCUMENT_TYPES[keyof typeof DOCUMENT_TYPES];

// Document type options for UI
export const DOCUMENT_TYPE_OPTIONS = [
  { value: DOCUMENT_TYPES.PERSONAL, label: 'Personal' },
  { value: DOCUMENT_TYPES.LAB_TEST, label: 'Lab Test' },
  { value: DOCUMENT_TYPES.PRESCRIPTION, label: 'Prescription' }
] as const;

// Badge variant type for type safety
export type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info';

// Document type color mapping for badges
export const DOCUMENT_TYPE_COLORS: Record<string, BadgeVariant> = {
  [DOCUMENT_TYPES.PERSONAL]: 'success',
  [DOCUMENT_TYPES.LAB_TEST]: 'danger',
  [DOCUMENT_TYPES.PRESCRIPTION]: 'info',
} as const;

// Helper function to get color for a document type
export const getDocumentTypeColor = (documentType: string | null): BadgeVariant => {
  if (!documentType) return 'primary';
  return DOCUMENT_TYPE_COLORS[documentType] || 'primary';
};

// Helper function to format document type for display
export const formatDocumentType = (documentType: string | null): string => {
  if (!documentType) return 'Other';
  // Capitalize first letter of each word
  return documentType
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
