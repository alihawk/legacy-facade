/**
 * ConfirmDialog template for generated projects
 *
 * Modal dialog for confirming destructive actions
 */
export const confirmDialogTemplate = () => `import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700',
    info: 'bg-blue-600 hover:bg-blue-700',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
        <div className="flex items-start gap-4">
          <div className={\`p-3 rounded-full \${variant === 'danger' ? 'bg-red-100' : 'bg-yellow-100'}\`}>
            <AlertTriangle className={\`w-6 h-6 \${variant === 'danger' ? 'text-red-600' : 'text-yellow-600'}\`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="mt-2 text-gray-600">{message}</p>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={\`px-4 py-2 rounded-lg text-white transition-colors \${variantStyles[variant]}\`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
`;
