import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Schema Context for Resource Review and Customization Flow
 *
 * This context manages the state for the entire schema review process,
 * from initial API detection through user customization to final output.
 */
import { createContext, useContext, useState } from 'react';
import { DEFAULT_UI_CUSTOMIZATION } from '../types/schemaTypes';
const SchemaContext = createContext(undefined);
export function SchemaProvider({ children }) {
    const [detectedSchema, setDetectedSchema] = useState(null);
    const [reviewedSchema, setReviewedSchema] = useState(null);
    const [uiCustomization, setUICustomization] = useState(DEFAULT_UI_CUSTOMIZATION);
    const [apiConfig, setApiConfig] = useState(null);
    const resetSchema = () => {
        setDetectedSchema(null);
        setReviewedSchema(null);
        setUICustomization(DEFAULT_UI_CUSTOMIZATION);
        setApiConfig(null);
    };
    // Convert detected schema to reviewed format with defaults
    const convertDetectedToReviewed = (detected) => {
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
                type: field.type || 'string',
                isPrimaryKey: field.name === resource.primaryKey,
                isVisible: true,
                isRequired: field.required ?? false,
            })),
        }));
    };
    return (_jsx(SchemaContext.Provider, { value: {
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
        }, children: children }));
}
export function useSchemaContext() {
    const context = useContext(SchemaContext);
    if (context === undefined) {
        throw new Error('useSchemaContext must be used within a SchemaProvider');
    }
    return context;
}
