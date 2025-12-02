/**
 * FeatureToggleGroup Component
 * 
 * A group of feature toggle checkboxes with descriptions.
 * Used for organizing related features in the UI customization step.
 */

interface Feature {
  key: string;
  label: string;
  description: string;
  disabled?: boolean;
  comingSoon?: boolean;
}

interface FeatureToggleGroupProps {
  title: string;
  icon: string;
  features: Feature[];
  values: Record<string, boolean>;
  onChange: (key: string, value: boolean) => void;
}

export function FeatureToggleGroup({
  title,
  icon,
  features,
  values,
  onChange
}: FeatureToggleGroupProps) {
  return (
    <div className="bg-white border rounded-xl p-5">
      <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
        <span>{icon}</span>
        {title}
      </h3>
      
      <div className="space-y-3">
        {features.map((feature) => (
          <label
            key={feature.key}
            className={`
              flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors
              ${feature.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}
              ${values[feature.key] ? 'bg-blue-50' : ''}
            `}
          >
            <input
              type="checkbox"
              checked={values[feature.key] || false}
              onChange={(e) => onChange(feature.key, e.target.checked)}
              disabled={feature.disabled}
              className="mt-1 w-4 h-4 text-blue-600 rounded"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{feature.label}</span>
                {feature.comingSoon && (
                  <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded-full">
                    Coming Soon
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-0.5">{feature.description}</p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
