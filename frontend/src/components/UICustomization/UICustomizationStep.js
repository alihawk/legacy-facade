import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * UICustomizationStep Component
 *
 * Main container for Step 2: UI Customization
 * Allows users to configure features, theme, and output options.
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useSchemaContext } from '../../context/SchemaContext';
import { FeatureToggleGroup } from './FeatureToggleGroup';
import { ThemeSelector } from './ThemeSelector';
import { OutputOptions } from './OutputOptions';
const DASHBOARD_FEATURES = [
    { key: 'statsCards', label: 'Stats Cards', description: 'Show count cards for each resource' },
    { key: 'barChart', label: 'Bar Chart', description: 'Visual chart comparing record counts' },
    { key: 'recentActivity', label: 'Recent Activity', description: 'Show recently added items' },
];
const LIST_FEATURES = [
    { key: 'bulkSelection', label: 'Bulk Selection', description: 'Checkboxes to select multiple items' },
    { key: 'bulkDelete', label: 'Bulk Delete', description: 'Delete multiple selected items at once' },
    { key: 'csvExport', label: 'CSV Export', description: 'Export selected or all items to CSV' },
    { key: 'smartFieldRendering', label: 'Smart Field Rendering', description: 'Render emails as links, dates formatted, etc.' },
];
const FORM_FEATURES = [
    { key: 'smartInputs', label: 'Smart Inputs', description: 'Date pickers, toggle switches, proper input types' },
    { key: 'fieldValidation', label: 'Field Validation', description: 'Client-side validation for required fields', disabled: true, comingSoon: true },
];
export function UICustomizationStep() {
    const navigate = useNavigate();
    const { reviewedSchema, uiCustomization, setUICustomization, apiConfig } = useSchemaContext();
    // Redirect if no reviewed schema
    useEffect(() => {
        if (!reviewedSchema) {
            navigate('/review');
        }
    }, [reviewedSchema, navigate]);
    const handleDashboardChange = (key, value) => {
        setUICustomization({
            ...uiCustomization,
            dashboard: { ...uiCustomization.dashboard, [key]: value },
        });
    };
    const handleListViewChange = (key, value) => {
        setUICustomization({
            ...uiCustomization,
            listView: { ...uiCustomization.listView, [key]: value },
        });
    };
    const handleFormsChange = (key, value) => {
        setUICustomization({
            ...uiCustomization,
            forms: { ...uiCustomization.forms, [key]: value },
        });
    };
    const handleOutputChange = (key, value) => {
        setUICustomization({
            ...uiCustomization,
            output: { ...uiCustomization.output, [key]: value },
        });
    };
    const handleGenerate = async () => {
        const { preview, download, deploy } = uiCustomization.output;
        if (!preview && !download && !deploy) {
            alert('Please select at least one output option');
            return;
        }
        // Store the final configuration in localStorage for the portal
        localStorage.setItem('portal_schema', JSON.stringify(reviewedSchema));
        localStorage.setItem('portal_config', JSON.stringify(uiCustomization));
        localStorage.setItem('api_config', JSON.stringify(apiConfig));
        if (preview) {
            navigate('/portal');
        }
        if (download) {
            // Trigger download - will be handled by ProjectGenerator
            // This will be integrated with existing download logic
            const event = new CustomEvent('downloadProject', {
                detail: { schema: reviewedSchema, config: uiCustomization }
            });
            window.dispatchEvent(event);
        }
        if (deploy) {
            // Trigger Vercel deployment
            // This will be integrated with existing deploy logic
            navigate('/portal?deploy=true');
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-gray-100", children: _jsxs("div", { className: "max-w-4xl mx-auto py-8 px-4", children: [_jsxs("div", { className: "mb-8", children: [_jsxs("div", { className: "flex items-center gap-2 text-sm text-gray-500 mb-2", children: [_jsx("span", { className: "bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold", children: "2" }), _jsx("span", { children: "Step 2 of 2" })] }), _jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Customize Your Portal" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Choose which features to include in your generated admin portal." })] }), _jsxs("div", { className: "space-y-4", children: [_jsx(FeatureToggleGroup, { title: "Dashboard Features", icon: "\uD83D\uDCCA", features: DASHBOARD_FEATURES, values: uiCustomization.dashboard, onChange: handleDashboardChange }), _jsx(FeatureToggleGroup, { title: "List View Features", icon: "\uD83D\uDCCB", features: LIST_FEATURES, values: uiCustomization.listView, onChange: handleListViewChange }), _jsx(FeatureToggleGroup, { title: "Form Features", icon: "\uD83D\uDCDD", features: FORM_FEATURES, values: uiCustomization.forms, onChange: handleFormsChange }), _jsx(ThemeSelector, { mode: uiCustomization.theme.mode, accentColor: uiCustomization.theme.accentColor, onModeChange: (mode) => setUICustomization({
                                ...uiCustomization,
                                theme: { ...uiCustomization.theme, mode }
                            }), onColorChange: (accentColor) => setUICustomization({
                                ...uiCustomization,
                                theme: { ...uiCustomization.theme, accentColor }
                            }) }), _jsx(OutputOptions, { preview: uiCustomization.output.preview, download: uiCustomization.output.download, deploy: uiCustomization.output.deploy, onChange: handleOutputChange })] }), _jsxs("div", { className: "mt-8 flex justify-between items-center pt-6 border-t", children: [_jsxs("button", { onClick: () => navigate('/review'), className: "flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors", children: [_jsx(ArrowLeft, { className: "w-5 h-5" }), "Back to Review"] }), _jsxs("button", { onClick: handleGenerate, className: "flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl", children: [_jsx(Sparkles, { className: "w-5 h-5" }), "Generate Portal"] })] })] }) }));
}
