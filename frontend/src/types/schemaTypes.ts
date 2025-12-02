/**
 * Schema Types for Resource Review and Customization
 * 
 * These types define the structure for reviewed and customized resources
 * after the initial API analysis phase.
 */

export interface ReviewedResource {
  name: string;
  displayName: string;
  endpoint: string;
  primaryKey: string;
  operations: ResourceOperations;
  fields: ReviewedField[];
}

export interface ResourceOperations {
  list: boolean;
  detail: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
}

export interface ReviewedField {
  name: string;
  displayName: string;
  type: FieldType;
  isPrimaryKey: boolean;
  isVisible: boolean;
  isRequired: boolean;
}

export type FieldType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'email'
  | 'url'
  | 'currency';

export interface UICustomization {
  dashboard: {
    statsCards: boolean;
    barChart: boolean;
    recentActivity: boolean;
  };
  listView: {
    bulkSelection: boolean;
    bulkDelete: boolean;
    csvExport: boolean;
    smartFieldRendering: boolean;
  };
  forms: {
    smartInputs: boolean;
    fieldValidation: boolean;
  };
  theme: {
    mode: 'light' | 'dark' | 'auto';
    accentColor: 'blue' | 'green' | 'purple' | 'orange';
  };
  output: {
    preview: boolean;
    download: boolean;
    deploy: boolean;
  };
}

export const DEFAULT_UI_CUSTOMIZATION: UICustomization = {
  dashboard: {
    statsCards: true,
    barChart: true,
    recentActivity: true,
  },
  listView: {
    bulkSelection: true,
    bulkDelete: true,
    csvExport: true,
    smartFieldRendering: true,
  },
  forms: {
    smartInputs: true,
    fieldValidation: false,
  },
  theme: {
    mode: 'auto',
    accentColor: 'blue',
  },
  output: {
    preview: true,
    download: false,
    deploy: false,
  },
};

export const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: 'string', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'boolean', label: 'Yes/No' },
  { value: 'date', label: 'Date' },
  { value: 'datetime', label: 'Date & Time' },
  { value: 'email', label: 'Email' },
  { value: 'url', label: 'URL' },
  { value: 'currency', label: 'Currency' },
];
