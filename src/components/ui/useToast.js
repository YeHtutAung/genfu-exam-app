import { useContext } from 'react'
import ToastContext from './ToastContext'

export default function useToast() {
  const context = useContext(ToastContext)
  if (!context) return { showToast: () => {} }
  return context
}
