import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'
import type { RootState } from '@/store/app/rootReducer'
import { getAuthToken } from './localStorage'
import { Loader2 } from 'lucide-react'
import { LOGIN_PAGE} from "@/constants/routerConstants"


interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth)
  const location = useLocation()

  // Check if token exists in localStorage as fallback
  const token = getAuthToken()

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated and no token
  if (!isAuthenticated && !token) {
    return <Navigate to={LOGIN_PAGE} state={{ from: location }} replace />
  }

  

  // If authenticated or has token, render children
  return <>{children}</>
}

export default ProtectedRoute