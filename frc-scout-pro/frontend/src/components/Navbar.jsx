import { NavLink } from 'react-router-dom'
import {
  Home, Users, Calendar, ClipboardList, LayoutDashboard,
  Swords, ListOrdered, Cpu
} from 'lucide-react'

const links = [
  { to: '/',          icon: Home,          label: 'Home'        },
  { to: '/events',    icon: Calendar,      label: 'Events'      },
  { to: '/scout',     icon: ClipboardList, label: 'Scout Entry' },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/predict',   icon: Swords,        label: 'Predictor'   },
  { to: '/picklist',  icon: ListOrdered,   label: 'Pick List'   },
]

export default function Navbar() {
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
      <nav className="flex-1 px-2 py-4 space-y-0.5">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-800">
        <p className="text-xs text-slate-600">Powered by The Blue Alliance</p>
      </div>
    </aside>
  )
}
