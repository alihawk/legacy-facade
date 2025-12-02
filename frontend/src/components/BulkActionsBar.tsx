import { Download, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onExport?: () => void;
  onDelete?: () => void;
  isSpooky?: boolean;
}

export function BulkActionsBar({
  selectedCount,
  onClearSelection,
  onExport,
  onDelete,
  isSpooky = false
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className={`flex items-center gap-4 px-4 py-3 rounded-xl border ${isSpooky ? 'bg-slate-800 border-cyan-500/30' : 'bg-indigo-50 border-indigo-200'}`}>
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isSpooky ? 'bg-cyan-500/20' : 'bg-indigo-100'}`}>
          <span className={`text-sm font-bold ${isSpooky ? 'text-cyan-400' : 'text-indigo-600'}`}>{selectedCount}</span>
        </div>
        <span className={`text-sm font-medium ${isSpooky ? 'text-cyan-400' : 'text-gray-700'}`}>
          {selectedCount} selected
        </span>
      </div>

      <div className={`h-6 w-px ${isSpooky ? 'bg-cyan-500/30' : 'bg-gray-200'}`} />

      <div className="flex items-center gap-2">
        {onExport && (
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className={`rounded-xl ${isSpooky ? 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        )}

        {onDelete && (
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className={`rounded-xl ${isSpooky ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' : 'border-red-200 text-red-600 hover:bg-red-50'}`}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className={`rounded-xl ${isSpooky ? 'text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
