import { useEffect, useState } from 'react'
import { auth as authApi } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { Shield, User, Trash2, RefreshCw, Copy, Check } from 'lucide-react'

export default function TeamManagement() {
  const { user, updateTeamCode } = useAuth()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied]   = useState(false)

  async function load() {
    setLoading(true)
    try { setMembers((await authApi.members()).data ?? []) }
    catch {} finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function setRole(uid, role) {
    await authApi.setRole(uid, role)
    setMembers(m => m.map(x => x.user_id === uid ? { ...x, role } : x))
  }

  async function removeMember(uid) {
    if (!window.confirm('Remove this member?')) return
    await authApi.removeMember(uid)
    setMembers(m => m.filter(x => x.user_id !== uid))
  }

  async function regenCode() {
    const r = await authApi.regenerateCode()
    updateTeamCode(r.data.team_code)
  }

  function copyCode() {
    navigator.clipboard.writeText(user?.team_code ?? '')
    setCopied(true); setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Team Management</h1>
        <p className="text-sm text-slate-500 mt-0.5">{user?.team_name}</p>
      </div>

      {/* Team code card */}
      <div className="card mb-5">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Team Join Code</p>
        <div className="flex items-center gap-3">
          <span className="font-mono text-3xl font-extrabold text-white tracking-[0.3em]">
            {user?.team_code}
          </span>
          <button onClick={copyCode}
            className="btn-ghost flex items-center gap-1 text-xs">
            {copied ? <><Check size={13} className="text-green-400" /> Copied</> : <><Copy size={13} /> Copy</>}
          </button>
          <button onClick={regenCode}
            className="btn-ghost flex items-center gap-1 text-xs text-yellow-400 hover:text-yellow-300">
            <RefreshCw size={13} /> Regenerate
          </button>
        </div>
        <p className="text-xs text-slate-600 mt-2">Share this code with your scouts so they can join.</p>
        {user?.frc_number && (
          <p className="text-xs text-slate-500 mt-1">FRC Team #{user.frc_number}</p>
        )}
      </div>

      {/* Members */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Members ({members.length})
          </p>
          <button onClick={load} className="text-slate-600 hover:text-white transition-colors">
            <RefreshCw size={13} />
          </button>
        </div>
        {loading ? (
          <p className="text-slate-500 text-sm py-4 text-center">Loading...</p>
        ) : (
          <div className="space-y-2">
            {members.map(m => (
              <div key={m.user_id}
                className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                <div className="flex items-center gap-2">
                  {m.role === 'admin'
                    ? <Shield className="text-blue-400" size={14} />
                    : <User className="text-slate-500" size={14} />
                  }
                  <span className={`text-sm font-medium ${m.user_id === user?.user_id ? 'text-blue-400' : 'text-white'}`}>
                    {m.username}
                    {m.user_id === user?.user_id && <span className="text-xs text-slate-500 ml-1">(you)</span>}
                  </span>
                </div>
                {m.user_id !== user?.user_id && (
                  <div className="flex items-center gap-2">
                    <select
                      className="bg-slate-800 border border-slate-700 rounded text-xs px-2 py-1"
                      value={m.role}
                      onChange={e => setRole(m.user_id, e.target.value)}>
                      <option value="scout">Scout</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button onClick={() => removeMember(m.user_id)}
                      className="text-slate-600 hover:text-red-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
                {m.user_id === user?.user_id && (
                  <span className="text-xs text-slate-600 capitalize">{m.role}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
