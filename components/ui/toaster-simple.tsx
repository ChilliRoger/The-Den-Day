'use client'

import { useToast } from '@/hooks/use-toast-simple'

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed bottom-0 right-0 z-50 p-4 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`max-w-sm p-4 rounded-lg shadow-lg border ${
            toast.type === 'error' 
              ? 'bg-red-50 border-red-200 text-red-800'
              : toast.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              {toast.title && (
                <div className="font-medium text-sm">{toast.title}</div>
              )}
              {toast.description && (
                <div className="text-sm mt-1">{toast.description}</div>
              )}
            </div>
            <button
              onClick={() => toast.id && dismiss(toast.id)}
              className="ml-2 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
