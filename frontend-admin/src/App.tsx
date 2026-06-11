import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AdminRoute } from './components/AdminRoute'
import { Layout } from './components/Layout'
import { AuthProvider } from './context/AuthContext'
import { CarriersPage } from './pages/CarriersPage'
import { DashboardPage } from './pages/DashboardPage'
import { DriversPage } from './pages/DriversPage'
import { LoadsPage } from './pages/LoadsPage'
import { LoginPage } from './pages/LoginPage'
import { UsersPage } from './pages/UsersPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<AdminRoute />}>
            <Route element={<Layout />}>
              <Route index element={<DashboardPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="carriers" element={<CarriersPage />} />
              <Route path="drivers" element={<DriversPage />} />
              <Route path="loads" element={<LoadsPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
