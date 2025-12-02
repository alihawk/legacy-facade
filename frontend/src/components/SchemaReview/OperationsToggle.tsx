/**
 * OperationsToggle Component
 * 
 * Allows users to enable/disable CRUD operations for a resource.
 * Displays as toggleable chips with icons and descriptions.
 */

import { ResourceOperations } from '../../types/schemaTypes';

interface OperationsToggleProps {
  operations: ResourceOperations;
  onChange: (operations: ResourceOperations) => void;
}

const OPERATION_INFO = [
  { key: 'list', label: 'List', description: 'View all records', icon: '📋' },
  { key: 'detail', label: 'View Details', description: 'View single record', icon: '👁️' },
  { key: 'create', label: 'Create', description: 'Add new records', icon: '➕' },
  { key: 'update', label: 'Update', description: 'Edit existing records', icon: '✏️' },
  { key: 'delete', label: 'Delete', description: 'Remove records', icon: '🗑️' },
];

export function OperationsToggle({ operations, onChange }: OperationsToggleProps) {
  const handleToggle = (key: keyof ResourceOperations) => {
    onChange({ ...operations, [key]: !operations[key] });
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">Operations</label>
      <div className="flex flex-wrap gap-3">
        {OPERATION_INFO.map(({ key, label, description, icon }) => (
          <label
            key={key}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all
              ${operations[key as keyof ResourceOperations]
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
              }
            `}
            title={description}
          >
            <input
              type="checkbox"
              checked={operations[key as keyof ResourceOperations]}
              onChange={() => handleToggle(key as keyof ResourceOperations)}
              className="sr-only"
            />
            <span>{icon}</span>
            <span className="text-sm font-medium">{label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
