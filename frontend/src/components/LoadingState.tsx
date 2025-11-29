import { Loader2, Inbox } from "lucide-react"

interface LoadingStateProps {
  message?: string
}

export function LoadingSpinner({ message = "Loading..." }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="p-4 bg-indigo-100 rounded-full">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
      <span className="text-gray-500 font-medium">{message}</span>
    </div>
  )
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="p-4 bg-gray-100 rounded-full">
        <Inbox className="w-12 h-12 text-gray-400" />
      </div>
      <p className="text-gray-500 text-lg">{message}</p>
    </div>
  )
}
