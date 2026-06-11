import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/carriers', label: 'Carriers' },
  { to: '/drivers', label: 'Drivers' },
  { to: '/loads', label: 'Loads' },
]

export function Layout() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen lg:flex">
      <aside className="w-full border-b border-surface-200 bg-surface-900 text-white lg:fixed lg:inset-y-0 lg:w-64 lg:border-b-0 lg:border-r">
        <div className="flex h-full flex-col">
          <div className="border-b border-white/10 px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-300">
              DispatchFlow
            </p>
            <h1 className="mt-1 text-xl font-bold">AI Dispatch</h1>
          </div>

          <nav className="flex flex-1 flex-col gap-1 p-4">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/30'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-white/10 p-4">
            <div className="rounded-xl bg-white/5 px-4 py-3">
              <p className="text-sm font-medium text-white">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-slate-400">{user?.email}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-brand-300">
                {user?.role}
              </p>
            </div>
            {user?.role === 'ADMIN' && (
              <a
                href={import.meta.env.VITE_ADMIN_URL ?? 'http://localhost:5174'}
                className="mt-3 block text-center text-xs text-brand-300 hover:text-brand-200"
              >
                Open admin console →
              </a>
            )}
            <button
              type="button"
              onClick={logout}
              className="mt-3 w-full rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/10"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 lg:pl-64">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
