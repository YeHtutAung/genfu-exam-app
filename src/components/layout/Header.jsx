import { Link, useLocation } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

export default function Header() {
  const user = useAuthStore(s => s.user)
  const role = useAuthStore(s => s.role)
  const signOut = useAuthStore(s => s.signOut)
  const location = useLocation()

  // Hide header on login page
  if (location.pathname === '/login') return null

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-xl font-bold text-gray-900">
          原付試験
        </Link>

        <nav className="flex items-center gap-4">
          {user ? (
            <>
              {role === 'admin' && (
                <Link
                  to="/admin"
                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  管理
                </Link>
              )}
              <span className="text-sm text-gray-500">{user.email}</span>
              <button
                onClick={signOut}
                className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                ログアウト
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              ログイン
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
