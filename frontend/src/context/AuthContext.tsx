import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { LoginRequest, RegisterRequest, Role, User } from '../types'
import * as authApi from '../api/auth'
import { setToken } from '../api/client'

const USER_STORAGE_KEY = 'dispatchflow_user'

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isAdmin: boolean
  login: (request: LoginRequest) => Promise<void>
  register: (request: RegisterRequest) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function persistUser(user: User | null) {
  if (user) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(USER_STORAGE_KEY)
  }
}

function loadUser(): User | null {
  const raw = localStorage.getItem(USER_STORAGE_KEY)
  if (!raw) {
    return null
  }
  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

function toUser(response: Awaited<ReturnType<typeof authApi.login>>): User {
  return {
    userId: response.userId,
    email: response.email,
    firstName: response.firstName,
    lastName: response.lastName,
    role: response.role,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => loadUser())

  useEffect(() => {
    const token = localStorage.getItem('dispatchflow_token')
    if (!token) {
      setUser(null)
      persistUser(null)
    }
  }, [])

  const login = useCallback(async (request: LoginRequest) => {
    const response = await authApi.login(request)

    if (response.role === 'ADMIN') {
      window.location.href = import.meta.env.VITE_ADMIN_URL ?? 'http://localhost:5174/login'
      return
    }

    setToken(response.token)
    const nextUser = toUser(response)
    setUser(nextUser)
    persistUser(nextUser)
  }, [])

  const register = useCallback(async (request: RegisterRequest) => {
    const response = await authApi.register(request)
    setToken(response.token)
    const nextUser = toUser(response)
    setUser(nextUser)
    persistUser(nextUser)
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    persistUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user && !!localStorage.getItem('dispatchflow_token'),
      isAdmin: user?.role === ('ADMIN' as Role),
      login,
      register,
      logout,
    }),
    [user, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
