'use client'

import { useState } from 'react'

export interface ToastProps {
  id?: string
  title?: string
  description?: string
  type?: 'success' | 'error' | 'info'
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const toast = (props: ToastProps) => {
    const id = Date.now().toString()
    const newToast = { ...props, id }
    setToasts(prev => [...prev, newToast])
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newToast.id))
    }, 5000)
  }

  const dismiss = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  return {
    toasts,
    toast,
    dismiss
  }
}

export default useToast
