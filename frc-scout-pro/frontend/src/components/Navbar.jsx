import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { auth as authApi } from '../api/client'
import {
  Home, Calendar, ClipboardList, LayoutDashboard,
  Swords, ListOrdered, Cpu, LogOut, Users, Copy, RefreshCw, CalendarCheck
} from 'lucide-react'
import { useState } from 'react'

const links = [
  { to: '/',          icon: Home,           label: 'Home'        },
  { to: '/events',    icon: Calendar,       label: 'Events'      },
  { to: '/scout',     icon: ClipboardList,  label: 'Scout Entry' },
  { to: '/dashboard', icon: LayoutDashboard,label: 'Dashboard'   },
  { to: '/predict',   icon: Swords,         label: 'Predictor'   },
  { to: '/picklist',  icon: ListOrdered,    label: 'Pick List'   },
]

export default function Navbar() {
  const { user, logout, updateTeamCode } = useAuth()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  function copyCode() {
    if (!user?.team_code) return
    navigator.clipboard.writeText(user.team_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  async function regenCode() {
    try {
      const r = await authApi.regenerateCode()
      updateTeamCode(r.data.team_code)
    } catch {}
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-slate-900 border-r border-slate-800 flex flex-col z-50">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Cpu className="text-blue-400" size={20} />
          <div>
            <p className="text-xs font-bold text-blue-400 tracking-widest uppercase">REBUILT 2026</p>
            <p className="text-xs text-slate-500">Scout Pro</p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`
            }>
            <Icon size={16} />{label}
          </NavLink>
        ))}

        {/* Admin-only links */}
        {user?.role === 'admin' && (
          <>
            <div className="pt-2 pb-1 px-3">
              <p className="text-xs text-slate-600 uppercase tracking-wider">Admin</p>
            </div>
            <NavLink to="/assignments"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`
              }>
              <CalendarCheck size={16} />Assignments
            </NavLink>
            <NavLink to="/team"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`
              }>
              <Users size={16} />Team
            </NavLink>
          </>
        )}
      </nav>

      {/* User / Team section */}
      {user && (
        <div className="border-t border-slate-800 px-3 py-3 space-y-2">
          {/* Team code */}
          {user.team_code && (
            <div className="bg-slate-800 rounded-lg px-3 py-2">
              <p className="text-xs text-slate-500 mb-1">Team Code</p>
              <div className="flex items-center justify-between gap-1">
                <span className="font-mono font-bold text-white tracking-widest text-sm">
                  {user.team_code}
                </span>
                <div className="flex gap-1">
                  <button onClick={copyCode}
                    className="text-slate-500 hover:text-white transition-colors" title="Copy">
                    {copied ? <span className="text-xs text-green-400">✓</span> : <Copy size={12} />}
                  </button>
                  {user.role === 'admin' && (
                    <button onClick={regenCode}
                      className="text-slate-500 hover:text-white transition-colors" title="Regenerate">
                      <RefreshCw size={12} />
                    </button>
                  )}
                </div>
              </div>
              {user.team_name && (
                <p className="text-xs text-slate-500 mt-0.5 truncate">{user.team_name}</p>
              )}
            </div>
          )}

          {/* User info + logout */}
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs text-slate-300 font-medium truncate">{user.username}</p>
              <p className="text-xs text-slate-600 capitalize">{user.role ?? 'scout'}</p>
            </div>
            <button onClick={() => { logout(); navigate('/login') }}
              className="text-slate-500 hover:text-red-400 transition-colors shrink-0" title="Logout">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}
