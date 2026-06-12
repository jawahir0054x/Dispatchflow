import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { CarriersPage } from './pages/CarriersPage'
import { DashboardPage } from './pages/DashboardPage'
import { DispatchBoardPage } from './pages/DispatchBoardPage'
import { DocumentsPage } from './pages/DocumentsPage'
import { DriversPage } from './pages/DriversPage'
import { LoadsPage } from './pages/LoadsPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route index element={<DashboardPage />} />
              <Route path="dispatch" element={<DispatchBoardPage />} />
              <Route path="carriers" element={<CarriersPage />} />
              <Route path="drivers" element={<DriversPage />} />
              <Route path="loads" element={<LoadsPage />} />
              <Route path="documents" element={<DocumentsPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
