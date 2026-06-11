import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function AdminRoute() {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
