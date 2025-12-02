/**
 * ResourceCard Component
 * 
 * Expandable card for reviewing and editing a single resource.
 * Integrates OperationsToggle and FieldsEditor components.
 */

import { useState } from 'react';
import { ChevronDown, ChevronUp, Edit2, Trash2, Package } from 'lucide-react';
import { ReviewedResource } from '../../types/schemaTypes';
import { OperationsToggle } from './OperationsToggle';
import { FieldsEditor } from './FieldsEditor';

interface ResourceCardProps {
  resource: ReviewedResource;
  onChange: (resource: ReviewedResource) => void;
  onDelete: () => void;
}

export function ResourceCard({ resource, onChange, onDelete }: ResourceCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);

  const operationCount = Object.values(resource.operations).filter(Boolean).length;

  return (
    <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <Package className="w-5 h-5 text-blue-600" />
          
          {isEditingName ? (
            <input
              type="text"
              value={resource.displayName}
              onChange={(e) => onChange({ ...resource, displayName: e.target.value })}
              onBlur={() => setIsEditingName(false)}
              onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
              onClick={(e) => e.stopPropagation()}
              className="px-2 py-1 border rounded font-semibold"
              autoFocus
            />
          ) : (
            <span className="font-semibold text-gray-900">{resource.displayName}</span>
          )}
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditingName(true);
            }}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            {resource.fields.length} fields • {operationCount} operations
          </span>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 text-gray-400 hover:text-red-500"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      {/* Body */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Endpoint */}
          <div>
            <label className="text-sm font-medium text-gray-700">Endpoint</label>
            <input
              type="text"
              value={resource.endpoint}
              onChange={(e) => onChange({ ...resource, endpoint: e.target.value })}
              className="mt-1 w-full px-3 py-2 border rounded-lg text-sm font-mono"
              placeholder="https://api.example.com/resource"
            />
          </div>

          {/* Operations */}
          <OperationsToggle
            operations={resource.operations}
            onChange={(operations) => onChange({ ...resource, operations })}
          />

          {/* Fields */}
          <FieldsEditor
            fields={resource.fields}
            onChange={(fields) => onChange({ ...resource, fields })}
          />
        </div>
      )}
    </div>
  );
}
