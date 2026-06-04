import { useState } from 'react'
import { scout, tba } from '../api/client'
import { CheckCircle, AlertCircle, Search } from 'lucide-react'

const DEFAULT_FORM = {
  team_number: '', match_number: '', event_key: '', scouter_name: '',
  auto_high: 0, auto_low: 0, auto_mobility: false,
  tele_high: 0, tele_low: 0, tele_defence_time: 0,
  end_climb_level: 0,
  driver_rating: 3, accuracy_rating: 3,
  minor_penalties: 0, major_penalties: 0,
  notes: '',
}

function Spinner({ label, value, onChange, min = 0, max = 99 }) {
  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))}
        className="w-7 h-7 rounded bg-slate-700 hover:bg-slate-600 text-white font-bold transition-colors">−</button>
      <span className="w-8 text-center font-mono text-sm">{value}</span>
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))}
        className="w-7 h-7 rounded bg-slate-700 hover:bg-slate-600 text-white font-bold transition-colors">+</button>
    </div>
  )
}

function Rating({ value, onChange, max = 5 }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }, (_, i) => (
        <button key={i} type="button" onClick={() => onChange(i + 1)}
          className={`w-7 h-7 rounded text-xs font-bold transition-colors ${
            i < value ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-500 hover:bg-slate-600'
          }`}>
          {i + 1}
        </button>
      ))}
    </div>
  )
}

const CLIMB_LABELS = ['None', 'Park (2pt)', 'Shallow (6pt)', 'Deep (12pt)']

export default function ScoutEntry() {
  const [form, setForm] = useState({ ...DEFAULT_FORM })
  const [status, setStatus] = useState(null)
  const [teamInfo, setTeamInfo] = useState(null)
  const [lookingUp, setLookingUp] = useState(false)

  function set(field) {
    return (val) => setForm(prev => ({ ...prev, [field]: val }))
  }

  async function lookupTeam() {
    if (!form.team_number) return
    setLookingUp(true)
    try {
      const r = await tba.team(form.team_number)
      setTeamInfo(r.data)
    } catch {
      setTeamInfo(null)
    } finally {
      setLookingUp(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.team_number) {
      setStatus({ type: 'error', msg: 'Team number is required.' })
      return
    }
    try {
      const payload = {
        ...form,
        team_number: parseInt(form.team_number),
        match_number: form.match_number ? parseInt(form.match_number) : null,
      }
      await scout.create(payload)
      setStatus({ type: 'ok', msg: `Team ${form.team_number} saved! Match ${form.match_number ?? '—'}` })
      setForm({ ...DEFAULT_FORM })
      setTeamInfo(null)
    } catch {
      setStatus({ type: 'error', msg: 'Failed to save entry. Is the backend running?' })
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Scout Entry</h1>
        <p className="text-sm text-slate-500 mt-0.5">Record a match observation for REBUILT 2026</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Meta */}
        <div className="card">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Match Info</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Team Number *</label>
              <div className="flex gap-2">
                <input className="input" placeholder="e.g. 254" value={form.team_number}
                  onChange={e => { set('team_number')(e.target.value); setTeamInfo(null) }} />
                <button type="button" onClick={lookupTeam}
                  className="btn-ghost px-2 border border-slate-700">
                  {lookingUp ? '...' : <Search size={14} />}
                </button>
              </div>
              {teamInfo && (
                <p className="text-xs text-blue-400 mt-1">{teamInfo.nickname} · {teamInfo.city}, {teamInfo.state_prov}</p>
              )}
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Match Number</label>
              <input className="input" placeholder="e.g. 12" value={form.match_number}
                onChange={e => set('match_number')(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Event Key</label>
              <input className="input" placeholder="e.g. 2026onto" value={form.event_key}
                onChange={e => set('event_key')(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Scouter Name</label>
              <input className="input" placeholder="Your name" value={form.scouter_name}
                onChange={e => set('scouter_name')(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Autonomous */}
        <div className="card border-l-2 border-l-green-600">
          <h2 className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-3">Autonomous (0–15s)</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-slate-500 mb-2 block">High Goal</label>
              <Spinner value={form.auto_high} onChange={set('auto_high')} />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-2 block">Low Goal</label>
              <Spinner value={form.auto_low} onChange={set('auto_low')} />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-2 block">Mobility</label>
              <button type="button"
                onClick={() => set('auto_mobility')(!form.auto_mobility)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  form.auto_mobility ? 'bg-green-700 text-white' : 'bg-slate-700 text-slate-400'
                }`}>
                {form.auto_mobility ? 'Yes' : 'No'}
              </button>
            </div>
          </div>
        </div>

        {/* Teleop */}
        <div className="card border-l-2 border-l-blue-600">
          <h2 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-3">Teleop (15s–2m15s)</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-slate-500 mb-2 block">High Goal</label>
              <Spinner value={form.tele_high} onChange={set('tele_high')} />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-2 block">Low Goal</label>
              <Spinner value={form.tele_low} onChange={set('tele_low')} />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-2 block">Defence Time (s)</label>
              <Spinner value={form.tele_defence_time} onChange={set('tele_defence_time')} max={150} />
            </div>
          </div>
        </div>

        {/* Endgame */}
        <div className="card border-l-2 border-l-yellow-600">
          <h2 className="text-xs font-semibold text-yellow-400 uppercase tracking-wider mb-3">Endgame (Last 30s)</h2>
          <div className="flex gap-2 flex-wrap">
            {CLIMB_LABELS.map((label, i) => (
              <button key={i} type="button" onClick={() => set('end_climb_level')(i)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  form.end_climb_level === i
                    ? 'bg-yellow-700 text-white'
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                }`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Subjective */}
        <div className="card border-l-2 border-l-purple-600">
          <h2 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-3">Subjective Ratings</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm text-slate-400">Driver Skill</label>
              <Rating value={form.driver_rating} onChange={set('driver_rating')} />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-slate-400">Accuracy</label>
              <Rating value={form.accuracy_rating} onChange={set('accuracy_rating')} />
            </div>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-xs text-slate-500 mb-2 block">Minor Penalties</label>
                <Spinner value={form.minor_penalties} onChange={set('minor_penalties')} max={20} />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-2 block">Major Penalties</label>
                <Spinner value={form.major_penalties} onChange={set('major_penalties')} max={10} />
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="card">
          <label className="text-xs text-slate-500 mb-2 block">Notes</label>
          <textarea className="input resize-none" rows={3} placeholder="Any observations..."
            value={form.notes} onChange={e => set('notes')(e.target.value)} />
        </div>

        {/* Status */}
        {status && (
          <div className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm ${
            status.type === 'ok'
              ? 'bg-green-950 text-green-400 border border-green-800'
              : 'bg-red-950 text-red-400 border border-red-800'
          }`}>
            {status.type === 'ok' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
            {status.msg}
          </div>
        )}

        <button type="submit" className="btn-primary w-full py-3 text-base font-semibold">
          Submit Observation
        </button>
      </form>
    </div>
  )
}
