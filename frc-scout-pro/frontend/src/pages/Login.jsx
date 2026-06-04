import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { Cpu, AlertCircle } from 'lucide-react'

export default function Login() {
  const [tab, setTab] = useState('login')   // 'login' | 'create' | 'join'
  const [form, setForm] = useState({
    username: '', password: '', team_name: '', frc_number: '', team_code: '',
  })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  function set(k) { return e => setForm(p => ({ ...p, [k]: e.target.value })) }

  function parseError(err) {
    const detail = err.response?.data?.detail
    if (!detail) return err.message ?? 'Something went wrong'
    if (typeof detail === 'string') return detail
    // Pydantic v2 returns an array of validation error objects
    if (Array.isArray(detail)) {
      return detail.map(d => {
        const field = d.loc?.slice(1).join('.') ?? ''
        return field ? `${field}: ${d.msg}` : d.msg
      }).join(' · ')
    }
    return JSON.stringify(detail)
  }

  async function submit(e) {
    e.preventDefault()
    setError(null)

    // Client-side validation
    if (!form.username.trim()) { setError('Username is required'); return }
    if (!form.password)        { setError('Password is required'); return }
    if (tab === 'create' && !form.team_name.trim()) { setError('Team name is required'); return }
    if (tab === 'join'   && !form.team_code.trim()) { setError('Team code is required'); return }

    setLoading(true)
    try {
      if (tab === 'login') {
        const r = await auth.login({ username: form.username, password: form.password })
        login(r.data)
        navigate('/')
      } else {
        const payload = {
          username: form.username.trim(),
          password: form.password,
          ...(tab === 'create'
            ? {
                team_name: form.team_name.trim(),
                frc_number: form.frc_number ? parseInt(form.frc_number) : null,
              }
            : { team_code: form.team_code.trim().toUpperCase() }),
        }
        const r = await auth.register(payload)
        login(r.data)
        navigate('/')
      }
    } catch (err) {
      setError(parseError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e] px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Cpu className="text-blue-400" size={28} />
            <span className="text-2xl font-extrabold text-white">Scout Pro</span>
          </div>
          <p className="text-xs text-blue-400 tracking-widest uppercase font-semibold">
            FRC REBUILT 2026
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 mb-4">
          {[
            ['login',  'Sign In'],
            ['create', 'Create Team'],
            ['join',   'Join Team'],
          ].map(([id, label]) => (
            <button key={id} type="button" onClick={() => { setTab(id); setError(null) }}
              className={`flex-1 py-2 text-sm rounded-lg transition-colors font-medium ${
                tab === id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}>
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="card space-y-4">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Username</label>
            <input className="input" placeholder="your_username" value={form.username}
              onChange={set('username')} required autoComplete="username" />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Password</label>
            <input className="input" type="password" placeholder="••••••••" value={form.password}
              onChange={set('password')} required autoComplete={tab === 'login' ? 'current-password' : 'new-password'} />
          </div>

          {tab === 'create' && (
            <>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Team Name</label>
                <input className="input" placeholder="e.g. Charged Up Scouting" value={form.team_name}
                  onChange={set('team_name')} required />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">
                  Your FRC Team Number <span className="text-slate-600">(optional)</span>
                </label>
                <input className="input" type="number" placeholder="e.g. 1234" value={form.frc_number}
                  onChange={set('frc_number')} />
              </div>
            </>
          )}

          {tab === 'join' && (
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Team Code</label>
              <input className="input tracking-widest uppercase font-mono text-lg text-center"
                placeholder="ABC123" maxLength={6} value={form.team_code}
                onChange={set('team_code')} required />
              <p className="text-xs text-slate-600 mt-1">Get this from your team admin</p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-400 bg-red-950 border border-red-800 px-3 py-2 rounded-lg">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 font-semibold">
            {loading ? 'Please wait...' : tab === 'login' ? 'Sign In' : tab === 'create' ? 'Create Team & Sign Up' : 'Join Team & Sign Up'}
          </button>
        </form>

        {tab === 'login' && (
          <p className="text-center text-xs text-slate-600 mt-4">
            No account?{' '}
            <button onClick={() => setTab('create')} className="text-blue-400 hover:underline">Create a team</button>
            {' '}or{' '}
            <button onClick={() => setTab('join')} className="text-blue-400 hover:underline">join one</button>
          </p>
        )}
      </div>
    </div>
  )
}
