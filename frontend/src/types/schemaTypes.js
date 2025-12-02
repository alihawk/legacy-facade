/**
 * Schema Types for Resource Review and Customization
 *
 * These types define the structure for reviewed and customized resources
 * after the initial API analysis phase.
 */
export const DEFAULT_UI_CUSTOMIZATION = {
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
export const FIELD_TYPES = [
    { value: 'string', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'boolean', label: 'Yes/No' },
    { value: 'date', label: 'Date' },
    { value: 'datetime', label: 'Date & Time' },
    { value: 'email', label: 'Email' },
    { value: 'url', label: 'URL' },
    { value: 'currency', label: 'Currency' },
];
