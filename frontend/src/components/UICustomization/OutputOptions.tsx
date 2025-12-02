/**
 * OutputOptions Component
 * 
 * Output selection interface for Preview/Download/Deploy options.
 * Allows users to choose what to do with their generated portal.
 */

import { Eye, Download, Rocket } from 'lucide-react';

interface OutputOptionsProps {
  preview: boolean;
  download: boolean;
  deploy: boolean;
  onChange: (key: 'preview' | 'download' | 'deploy', value: boolean) => void;
}

const OPTIONS = [
  {
    key: 'preview' as const,
    icon: Eye,
    label: 'Preview',
    description: 'Live preview in browser',
  },
  {
    key: 'download' as const,
    icon: Download,
    label: 'Download',
    description: 'ZIP project for local dev',
  },
  {
    key: 'deploy' as const,
    icon: Rocket,
    label: 'Deploy',
    description: 'Deploy to Vercel (1-click)',
  },
];

export function OutputOptions({ preview, download, deploy, onChange }: OutputOptionsProps) {
  const values = { preview, download, deploy };

  return (
    <div className="bg-white border rounded-xl p-5">
      <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
        <span>📤</span>
        Output Options
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        Choose what you want to do with your generated portal.
      </p>

      <div className="grid grid-cols-3 gap-3">
        {OPTIONS.map(({ key, icon: Icon, label, description }) => (
          <button
            key={key}
            onClick={() => onChange(key, !values[key])}
            className={`
              relative flex flex-col items-center p-4 rounded-xl border-2 transition-all
              ${values[key]
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            {values[key] && (
              <span className="absolute top-2 right-2 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">
                ✓
              </span>
            )}
            <Icon className={`w-8 h-8 mb-2 ${values[key] ? 'text-blue-600' : 'text-gray-400'}`} />
            <span className={`font-medium ${values[key] ? 'text-blue-700' : 'text-gray-700'}`}>
              {label}
            </span>
            <span className="text-xs text-gray-500 text-center mt-1">{description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
