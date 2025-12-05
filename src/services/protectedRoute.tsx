import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'
import type { RootState } from '@/store/app/rootReducer'
import { getAuthToken, getRole } from './localStorage'
import { Loader2, ShieldAlert } from 'lucide-react'
import { LOGIN_PAGE} from "@/constants/routerConstants"


interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, role: authRole } = useSelector((state: RootState) => state.auth)
  const location = useLocation()

  // Check if token exists in localStorage as fallback
  const token = getAuthToken()
  const storedRole = getRole()
  
  // Get role from Redux state or localStorage
  const userRole = authRole || storedRole

  // Show loading spinner while checking authentication or if we have token but no role yet
  if (isLoading || (token && !userRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated and no token
  if (!isAuthenticated && !token) {
    return <Navigate to={LOGIN_PAGE} state={{ from: location }} replace />
  }

  // Check if user is admin or organizer (case-insensitive)
  const normalizedRole = userRole?.toLowerCase()
  const isAuthorized = normalizedRole === 'admin' || normalizedRole === 'organizer'

  // Show unauthorized message if user is not admin or organizer
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <ShieldAlert className="h-12 w-12 text-red-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-6">
              This application is restricted to administrators and organizers only.
            </p>
            <button
              onClick={() => window.location.href = LOGIN_PAGE}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  // If authenticated or has token, render children
  return <>{children}</>
}

export default ProtectedRoute


