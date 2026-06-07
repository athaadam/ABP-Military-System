import type { ReactNode } from 'react'
import { useAppSelector } from '../store/hooks'
import { Navigate } from 'react-router-dom'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: ('superadmin' | 'admin' | 'user')[]
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isAuthenticated, isInitializing } = useAppSelector((state) => state.auth)

  // Show loading state while initializing
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-screen bg-transparent">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/20 border border-blue-500/30 mb-4 animate-spin">
            <div className="w-8 h-8 rounded-full border-2 border-transparent border-t-blue-400"></div>
          </div>
          <p className="text-slate-300">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && !requiredRole.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}
