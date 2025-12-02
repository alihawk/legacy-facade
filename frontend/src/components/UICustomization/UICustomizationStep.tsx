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
  const { 
    reviewedSchema, 
    uiCustomization, 
    setUICustomization,
    apiConfig 
  } = useSchemaContext();

  // Redirect if no reviewed schema
  useEffect(() => {
    if (!reviewedSchema) {
      navigate('/review');
    }
  }, [reviewedSchema, navigate]);

  const handleDashboardChange = (key: string, value: boolean) => {
    setUICustomization({
      ...uiCustomization,
      dashboard: { ...uiCustomization.dashboard, [key]: value },
    });
  };

  const handleListViewChange = (key: string, value: boolean) => {
    setUICustomization({
      ...uiCustomization,
      listView: { ...uiCustomization.listView, [key]: value },
    });
  };

  const handleFormsChange = (key: string, value: boolean) => {
    setUICustomization({
      ...uiCustomization,
      forms: { ...uiCustomization.forms, [key]: value },
    });
  };

  const handleOutputChange = (key: 'preview' | 'download' | 'deploy', value: boolean) => {
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

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">2</span>
            <span>Step 2 of 2</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Customize Your Portal</h1>
          <p className="text-gray-600 mt-1">
            Choose which features to include in your generated admin portal.
          </p>
        </div>

        {/* Feature Groups */}
        <div className="space-y-4">
          <FeatureToggleGroup
            title="Dashboard Features"
            icon="📊"
            features={DASHBOARD_FEATURES}
            values={uiCustomization.dashboard}
            onChange={handleDashboardChange}
          />

          <FeatureToggleGroup
            title="List View Features"
            icon="📋"
            features={LIST_FEATURES}
            values={uiCustomization.listView}
            onChange={handleListViewChange}
          />

          <FeatureToggleGroup
            title="Form Features"
            icon="📝"
            features={FORM_FEATURES}
            values={uiCustomization.forms}
            onChange={handleFormsChange}
          />

          <ThemeSelector
            mode={uiCustomization.theme.mode}
            accentColor={uiCustomization.theme.accentColor}
            onModeChange={(mode) => setUICustomization({
              ...uiCustomization,
              theme: { ...uiCustomization.theme, mode }
            })}
            onColorChange={(accentColor) => setUICustomization({
              ...uiCustomization,
              theme: { ...uiCustomization.theme, accentColor }
            })}
          />

          <OutputOptions
            preview={uiCustomization.output.preview}
            download={uiCustomization.output.download}
            deploy={uiCustomization.output.deploy}
            onChange={handleOutputChange}
          />
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-between items-center pt-6 border-t">
          <button
            onClick={() => navigate('/review')}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Review
          </button>
          
          <button
            onClick={handleGenerate}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
          >
            <Sparkles className="w-5 h-5" />
            Generate Portal
          </button>
        </div>
      </div>
    </div>
  );
}
