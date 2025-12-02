/**
 * FieldsEditor Component
 * 
 * Table-based editor for managing resource fields.
 * Allows adding, removing, and editing field properties.
 */

import { Plus, Trash2 } from 'lucide-react';
import { ReviewedField, FIELD_TYPES, FieldType } from '../../types/schemaTypes';

interface FieldsEditorProps {
  fields: ReviewedField[];
  onChange: (fields: ReviewedField[]) => void;
}

export function FieldsEditor({ fields, onChange }: FieldsEditorProps) {
  const handleFieldChange = (index: number, updates: Partial<ReviewedField>) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...updates };
    
    // If setting as primary key, unset others
    if (updates.isPrimaryKey) {
      newFields.forEach((f, i) => {
        if (i !== index) f.isPrimaryKey = false;
      });
    }
    
    onChange(newFields);
  };

  const handleAddField = () => {
    onChange([
      ...fields,
      {
        name: `field_${fields.length + 1}`,
        displayName: `Field ${fields.length + 1}`,
        type: 'string',
        isPrimaryKey: false,
        isVisible: true,
        isRequired: false,
      },
    ]);
  };

  const handleRemoveField = (index: number) => {
    onChange(fields.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">Fields</label>
        <button
          onClick={handleAddField}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Field
        </button>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-gray-600">Name</th>
              <th className="px-3 py-2 text-left font-medium text-gray-600">Display Name</th>
              <th className="px-3 py-2 text-left font-medium text-gray-600">Type</th>
              <th className="px-3 py-2 text-center font-medium text-gray-600">Primary Key</th>
              <th className="px-3 py-2 text-center font-medium text-gray-600">Visible</th>
              <th className="px-3 py-2 text-center font-medium text-gray-600">Required</th>
              <th className="px-3 py-2 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {fields.map((field, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={field.name}
                    onChange={(e) => handleFieldChange(index, { name: e.target.value })}
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={field.displayName}
                    onChange={(e) => handleFieldChange(index, { displayName: e.target.value })}
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                </td>
                <td className="px-3 py-2">
                  <select
                    value={field.type}
                    onChange={(e) => handleFieldChange(index, { type: e.target.value as FieldType })}
                    className="w-full px-2 py-1 border rounded text-sm bg-white"
                  >
                    {FIELD_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2 text-center">
                  <input
                    type="radio"
                    name="primaryKey"
                    checked={field.isPrimaryKey}
                    onChange={() => handleFieldChange(index, { isPrimaryKey: true })}
                    className="w-4 h-4 text-blue-600"
                  />
                </td>
                <td className="px-3 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={field.isVisible}
                    onChange={(e) => handleFieldChange(index, { isVisible: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </td>
                <td className="px-3 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={field.isRequired}
                    onChange={(e) => handleFieldChange(index, { isRequired: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </td>
                <td className="px-3 py-2">
                  <button
                    onClick={() => handleRemoveField(index)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
