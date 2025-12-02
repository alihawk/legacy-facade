/**
 * FieldRenderer template for generated projects
 *
 * Smart field rendering based on type (email, url, date, boolean, etc.)
 */
export const fieldRendererTemplate = () => `import { format, formatDistanceToNow } from 'date-fns';
import { ExternalLink, Mail, Check, X } from 'lucide-react';

interface FieldRendererProps {
  value: any;
  type: string;
  mode: 'list' | 'detail' | 'form';
  onChange?: (value: any) => void;
  name?: string;
}

export function FieldRenderer({ value, type, mode, onChange, name }: FieldRendererProps) {
  // Handle null/undefined
  if (value === null || value === undefined) {
    if (mode === 'form') {
      return renderFormInput(type, '', onChange, name);
    }
    return <span className="text-gray-400">—</span>;
  }

  // Form mode - render inputs
  if (mode === 'form') {
    return renderFormInput(type, value, onChange, name);
  }

  // Display modes (list/detail)
  switch (type) {
    case 'email':
      return (
        <a 
          href={\`mailto:\${value}\`}
          className="text-blue-600 hover:underline flex items-center gap-1"
        >
          <Mail className="w-3 h-3" />
          {value}
        </a>
      );

    case 'url':
      const displayUrl = mode === 'list' 
        ? value.replace(/^https?:\\/\\//, '').slice(0, 30) + (value.length > 30 ? '...' : '')
        : value;
      return (
        <a 
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline flex items-center gap-1"
        >
          <ExternalLink className="w-3 h-3" />
          {displayUrl}
        </a>
      );

    case 'boolean':
      return value ? (
        <span className="inline-flex items-center gap-1 text-green-600">
          <Check className="w-4 h-4" /> {mode === 'detail' && 'Yes'}
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-red-500">
          <X className="w-4 h-4" /> {mode === 'detail' && 'No'}
        </span>
      );

    case 'date':
      try {
        const date = new Date(value);
        const formatted = format(date, 'MMM d, yyyy');
        const relative = mode === 'detail' ? \` (\${formatDistanceToNow(date, { addSuffix: true })})\` : '';
        return <span>{formatted}{relative}</span>;
      } catch {
        return <span>{value}</span>;
      }

    case 'datetime':
      try {
        const date = new Date(value);
        const formatted = format(date, 'MMM d, yyyy h:mm a');
        const relative = mode === 'detail' ? \` (\${formatDistanceToNow(date, { addSuffix: true })})\` : '';
        return <span>{formatted}{relative}</span>;
      } catch {
        return <span>{value}</span>;
      }

    case 'number':
      return (
        <span className="font-mono tabular-nums">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
      );

    case 'currency':
      return (
        <span className="font-mono tabular-nums">
          $\{typeof value === 'number' ? value.toLocaleString(undefined, { minimumFractionDigits: 2 }) : value}
        </span>
      );

    default:
      // String - truncate in list mode
      const strValue = String(value);
      if (mode === 'list' && strValue.length > 50) {
        return (
          <span title={strValue}>
            {strValue.slice(0, 50)}...
          </span>
        );
      }
      return <span>{strValue}</span>;
  }
}

function renderFormInput(type: string, value: any, onChange?: (v: any) => void, name?: string) {
  const baseClass = "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
  
  switch (type) {
    case 'email':
      return (
        <input
          type="email"
          value={value || ''}
          onChange={(e) => onChange?.(e.target.value)}
          className={baseClass}
          placeholder="email@example.com"
        />
      );

    case 'url':
      return (
        <input
          type="url"
          value={value || ''}
          onChange={(e) => onChange?.(e.target.value)}
          className={baseClass}
          placeholder="https://example.com"
        />
      );

    case 'boolean':
      return (
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange?.(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      );

    case 'date':
      return (
        <input
          type="date"
          value={value ? new Date(value).toISOString().split('T')[0] : ''}
          onChange={(e) => onChange?.(e.target.value)}
          className={baseClass}
        />
      );

    case 'datetime':
      return (
        <input
          type="datetime-local"
          value={value ? new Date(value).toISOString().slice(0, 16) : ''}
          onChange={(e) => onChange?.(e.target.value)}
          className={baseClass}
        />
      );

    case 'number':
    case 'currency':
      return (
        <input
          type="number"
          value={value || ''}
          onChange={(e) => onChange?.(parseFloat(e.target.value) || 0)}
          className={baseClass}
          step={type === 'currency' ? '0.01' : '1'}
        />
      );

    default:
      // Check if value is long - use textarea
      if (String(value).length > 100) {
        return (
          <textarea
            value={value || ''}
            onChange={(e) => onChange?.(e.target.value)}
            className={\`\${baseClass} min-h-[100px]\`}
            rows={4}
          />
        );
      }
      return (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange?.(e.target.value)}
          className={baseClass}
        />
      );
  }
}
`;
