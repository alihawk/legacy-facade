/**
 * Schema Context for Resource Review and Customization Flow
 * 
 * This context manages the state for the entire schema review process,
 * from initial API detection through user customization to final output.
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  ReviewedResource,
  UICustomization,
  DEFAULT_UI_CUSTOMIZATION
} from '../types/schemaTypes';

// ResourceSchema from existing codebase
interface ResourceSchema {
  name: string;
  displayName: string;
  endpoint: string;
  primaryKey: string;
  fields: ResourceField[];
  operations: string[];
}

interface ResourceField {
  name: string;
  type: string;
  displayName: string;
  required?: boolean;
}

interface SchemaContextType {
  // Raw detected schema from analyzer
  detectedSchema: ResourceSchema[] | null;
  
  // User-reviewed schema
  reviewedSchema: ReviewedResource[] | null;
  
  // UI customization preferences
  uiCustomization: UICustomization;
  
  // API configuration (needed for proxy)
  apiConfig: {
    baseUrl: string;
    apiType: 'rest' | 'soap';
    authType?: string;
    authConfig?: Record<string, string>;
  } | null;
  
  // Actions
  setDetectedSchema: (schema: ResourceSchema[]) => void;
  setReviewedSchema: (schema: ReviewedResource[]) => void;
  setUICustomization: (config: UICustomization) => void;
  setApiConfig: (config: any) => void;
  resetSchema: () => void;
  
  // Conversion helper
  convertDetectedToReviewed: (detected: ResourceSchema[]) => ReviewedResource[];
}

const SchemaContext = createContext<SchemaContextType | undefined>(undefined);

export function SchemaProvider({ children }: { children: ReactNode }) {
  const [detectedSchema, setDetectedSchema] = useState<ResourceSchema[] | null>(null);
  const [reviewedSchema, setReviewedSchema] = useState<ReviewedResource[] | null>(null);
  const [uiCustomization, setUICustomization] = useState<UICustomization>(DEFAULT_UI_CUSTOMIZATION);
  const [apiConfig, setApiConfig] = useState<any>(null);

  const resetSchema = () => {
    setDetectedSchema(null);
    setReviewedSchema(null);
    setUICustomization(DEFAULT_UI_CUSTOMIZATION);
    setApiConfig(null);
  };

  // Convert detected schema to reviewed format with defaults
  const convertDetectedToReviewed = (detected: ResourceSchema[]): ReviewedResource[] => {
    return detected.map(resource => ({
      name: resource.name,
      displayName: resource.displayName || resource.name,
      endpoint: resource.endpoint || '',
      primaryKey: resource.primaryKey || 'id',
      operations: {
        list: resource.operations?.includes('list') ?? true,
        detail: resource.operations?.includes('detail') ?? true,
        create: resource.operations?.includes('create') ?? true,
        update: resource.operations?.includes('update') ?? true,
        delete: resource.operations?.includes('delete') ?? true,
      },
      fields: resource.fields.map(field => ({
        name: field.name,
        displayName: field.displayName || field.name,
        type: field.type as any || 'string',
        isPrimaryKey: field.name === resource.primaryKey,
        isVisible: true,
        isRequired: field.required ?? false,
      })),
    }));
  };

  return (
    <SchemaContext.Provider
      value={{
        detectedSchema,
        reviewedSchema,
        uiCustomization,
        apiConfig,
        setDetectedSchema,
        setReviewedSchema,
        setUICustomization,
        setApiConfig,
        resetSchema,
        convertDetectedToReviewed,
      }}
    >
      {children}
    </SchemaContext.Provider>
  );
}

export function useSchemaContext() {
  const context = useContext(SchemaContext);
  if (context === undefined) {
    throw new Error('useSchemaContext must be used within a SchemaProvider');
  }
  return context;
}
