import { Navigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

/**
 * Props:
 *   adminOnly  boolean  — if true, also requires role === 'admin'
 *   children   node
 */
export default function ProtectedRoute({ adminOnly = false, children }) {
  const user    = useAuthStore(s => s.user)
  const isAdmin = useAuthStore(s => s.role === 'admin')

  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />

  return children
}
