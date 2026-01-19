import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import type { RootState } from '@/store/app/rootReducer'
import { getRole } from './localStorage'
import UnauthorizedPage from '@/pages/UnauthorizedPage'

interface RoleProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: string[]
}

const RoleProtectedRoute = ({ children, allowedRoles }: RoleProtectedRouteProps) => {
  const { role: authRole } = useSelector((state: RootState) => state.auth)
  const storedRole = getRole()
  const userRole = authRole || storedRole

  // Check if user has required role
  const hasAccess = allowedRoles.includes(userRole || '')

  if (!hasAccess) {
    return <UnauthorizedPage />
  }

  return <>{children}</>
}

export default RoleProtectedRoute
