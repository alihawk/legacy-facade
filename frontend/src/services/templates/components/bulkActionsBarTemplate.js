/**
 * BulkActionsBar template for generated projects
 *
 * Floating action bar that appears when items are selected
 */
export const bulkActionsBarTemplate = () => `import { Trash2, Download, X } from 'lucide-react';

interface BulkActionsBarProps {
  selectedCount: number;
  onDelete: () => void;
  onExport: () => void;
  onClearSelection: () => void;
}

export function BulkActionsBar({
  selectedCount,
  onDelete,
  onExport,
  onClearSelection
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4">
        <span className="font-medium">
          {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
        </span>
        
        <div className="h-6 w-px bg-gray-600" />
        
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
        
        <button
          onClick={onDelete}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
        
        <button
          onClick={onClearSelection}
          className="p-1.5 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
`;
