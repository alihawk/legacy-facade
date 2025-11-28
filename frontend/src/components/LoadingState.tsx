import { Loader2, Ghost } from "lucide-react";

interface LoadingStateProps {
  message?: string;
}

export function LoadingSpinner({ message = "Loading..." }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <Ghost className="w-16 h-16 text-green-500/50 ghost-float" />
      <Loader2 className="w-8 h-8 animate-spin text-green-500" />
      <span className="text-gray-400">{message}</span>
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <Ghost className="w-20 h-20 text-gray-600" />
      <p className="text-gray-400 text-lg">{message}</p>
    </div>
  );
}
