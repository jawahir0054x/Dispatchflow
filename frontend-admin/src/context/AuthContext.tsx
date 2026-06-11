import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { LoginRequest, User } from '../types'
import * as authApi from '../api/auth'
import { ApiClientError } from '../api/client'
import { setToken } from '../api/client'

const USER_STORAGE_KEY = 'dispatchflow_admin_user'

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  login: (request: LoginRequest) => Promise<void>
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => loadUser())

  const login = useCallback(async (request: LoginRequest) => {
    const response = await authApi.login(request)

    if (response.role !== 'ADMIN') {
      throw new ApiClientError(
        'Admin access only. Please use the dispatcher portal.',
        403,
      )
    }

    setToken(response.token)
    const nextUser: User = {
      userId: response.userId,
      email: response.email,
      firstName: response.firstName,
      lastName: response.lastName,
      role: response.role,
    }
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
      isAuthenticated: !!user && !!localStorage.getItem('dispatchflow_admin_token'),
      login,
      logout,
    }),
    [user, login, logout],
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
