/**
 * BulkActionsBar template for generated projects
 *
 * Floating action bar that appears when items are selected
 */
export const bulkActionsBarTemplate = () => `import { Trash2, Download, X } from 'lucide-react';

interface BulkActionsBarProps {
  selectedCount: number;
  onDelete?: () => void;
  onExport?: () => void;
  onClearSelection: () => void;
  isSpooky?: boolean;
}

export function BulkActionsBar({
  selectedCount,
  onDelete,
  onExport,
  onClearSelection,
  isSpooky = false
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className={\`px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 \${isSpooky ? 'bg-slate-800 border border-cyan-500/30 text-cyan-400' : 'bg-white border border-gray-200 text-gray-900 shadow-lg'}\`}>
        <span className="font-medium">
          {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
        </span>
        
        <div className={\`h-6 w-px \${isSpooky ? 'bg-cyan-500/30' : 'bg-gray-200'}\`} />
        
        {onExport && (
          <button
            onClick={onExport}
            className={\`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors \${isSpooky ? 'hover:bg-cyan-500/20 text-cyan-400' : 'hover:bg-gray-100 text-gray-700'}\`}
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        )}
        
        {onDelete && (
          <button
            onClick={onDelete}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        )}
        
        <button
          onClick={onClearSelection}
          className={\`p-1.5 rounded-lg transition-colors \${isSpooky ? 'hover:bg-cyan-500/20' : 'hover:bg-gray-100'}\`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
`;
