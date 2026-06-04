import { useState, useEffect, useCallback } from 'react'
import { scout, tba } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { CheckCircle, AlertCircle, Search } from 'lucide-react'

const DEFAULT_FORM = {
  team_number: '', match_number: '', event_key: '', scouter_name: '',
  auto_fuel: 0, tele_fuel: 0, end_fuel: 0,
  climb_level: 0,
  defence_time: 0,
  driver_rating: 3, accuracy_rating: 3,
  minor_penalties: 0, major_penalties: 0,
  notes: '',
}

const CLIMB_LABELS = ['None (0pt)', 'Low  (+10pt)', 'Mid  (+20pt)', 'High (+30pt)']

function Spinner({ value, onChange, min = 0, max = 200 }) {
  return (
    <div className="flex items-center gap-2">
      <button type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-7 h-7 rounded bg-slate-700 hover:bg-slate-600 text-white font-bold transition-colors">−</button>
      <span className="w-10 text-center font-mono">{value}</span>
      <button type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="w-7 h-7 rounded bg-slate-700 hover:bg-slate-600 text-white font-bold transition-colors">+</button>
    </div>
  )
}

function Stars({ value, onChange, max = 5 }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }, (_, i) => (
        <button key={i} type="button" onClick={() => onChange(i + 1)}
          className={`w-7 h-7 rounded text-xs font-bold transition-colors ${
            i < value ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-500 hover:bg-slate-600'
          }`}>{i + 1}</button>
      ))}
    </div>
  )
}

export default function ScoutEntry() {
  const { user } = useAuth()
  const [form, setForm] = useState({ ...DEFAULT_FORM })
  const [status, setStatus] = useState(null)

  // TBA dropdown state
  const [events, setEvents] = useState([])
  const [eventMatches, setEventMatches] = useState([])
  const [eventTeams, setEventTeams] = useState([])
  const [eventsLoading, setEventsLoading] = useState(false)

  // Assignments for this scout
  const [assignments, setAssignments] = useState([])

  useEffect(() => {
    setEventsLoading(true)
    tba.events(2026)
      .then(r => setEvents((r.data ?? []).sort((a, b) => (a.start_date ?? '').localeCompare(b.start_date ?? ''))))
      .catch(() => {})
      .finally(() => setEventsLoading(false))

    scout.assignments()
      .then(r => setAssignments(r.data ?? []))
      .catch(() => {})
  }, [])

  // When event changes, load matches + teams from TBA
  useEffect(() => {
    if (!form.event_key) {
      setEventMatches([]); setEventTeams([]); return
    }
    Promise.all([
      tba.eventMatches(form.event_key).catch(() => ({ data: [] })),
      tba.eventTeams(form.event_key).catch(() => ({ data: [] })),
    ]).then(([m, t]) => {
      const sorted = (m.data ?? [])
        .filter(mx => mx.comp_level === 'qm')
        .sort((a, b) => a.match_number - b.match_number)
      setEventMatches(sorted)
      setEventTeams((t.data ?? []).sort((a, b) => a.team_number - b.team_number))
    })
  }, [form.event_key])

  function set(field) { return val => setForm(prev => ({ ...prev, [field]: val })) }
  function setE(field) { return e => setForm(prev => ({ ...prev, [field]: e.target.value })) }

  function fillFromAssignment(a) {
    setForm(prev => ({
      ...prev,
      event_key:    a.event_key,
      match_number: String(a.match_number),
      team_number:  a.frc_team_number ? String(a.frc_team_number) : '',
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.team_number) { setStatus({ type: 'error', msg: 'Team number required' }); return }
    try {
      const payload = {
        ...form,
        team_number:  parseInt(form.team_number),
        match_number: form.match_number ? parseInt(form.match_number) : null,
        scouter_name: form.scouter_name || user?.username || '',
      }
      await scout.create(payload)
      setStatus({ type: 'ok', msg: `✓ Team ${form.team_number} saved (match ${form.match_number ?? '—'})` })
      setForm(prev => ({
        ...DEFAULT_FORM,
        event_key: prev.event_key,  // keep event selection
        scouter_name: prev.scouter_name,
      }))
    } catch {
      setStatus({ type: 'error', msg: 'Save failed — is the backend running?' })
    }
  }

  // My pending assignments filtered by event
  const myAssignments = assignments.filter(a =>
    !form.event_key || a.event_key === form.event_key
  )

  return (
    <div className="max-w-2xl">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-white">Scout Entry</h1>
        <p className="text-sm text-slate-500 mt-0.5">REBUILT 2026 · fuel + climb scoring</p>
      </div>

      {/* My Assignments */}
      {myAssignments.length > 0 && (
        <div className="card mb-4 border-blue-900">
          <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">
            Your Assignments {form.event_key ? `· ${form.event_key}` : ''}
          </p>
          <div className="flex flex-wrap gap-2">
            {myAssignments.map(a => (
              <button key={a.id} type="button" onClick={() => fillFromAssignment(a)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                  a.alliance === 'red'
                    ? 'border-red-800 bg-red-950 text-red-300 hover:bg-red-900'
                    : 'border-blue-800 bg-blue-950 text-blue-300 hover:bg-blue-900'
                }`}>
                QM{a.match_number} · {a.alliance.toUpperCase()}{a.robot_position}
                {a.frc_team_number ? ` · #${a.frc_team_number}` : ''}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* ── Match Info ── */}
        <div className="card">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Match Info</h2>
          <div className="grid grid-cols-2 gap-3">

            {/* Event — TBA dropdown */}
            <div className="col-span-2">
              <label className="text-xs text-slate-500 mb-1 block">Event</label>
              <select className="input text-sm" value={form.event_key} onChange={setE('event_key')}>
                <option value="">— Select event —</option>
                {eventsLoading && <option disabled>Loading events...</option>}
                {events.map(ev => (
                  <option key={ev.key} value={ev.key}>
                    {ev.name} ({ev.start_date?.slice(0, 10)}) · {ev.key}
                  </option>
                ))}
              </select>
            </div>

            {/* Match — TBA dropdown */}
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Match</label>
              {eventMatches.length > 0 ? (
                <select className="input text-sm" value={form.match_number} onChange={setE('match_number')}>
                  <option value="">— Select match —</option>
                  {eventMatches.map(m => (
                    <option key={m.key} value={m.match_number}>
                      QM {m.match_number}
                    </option>
                  ))}
                </select>
              ) : (
                <input className="input" placeholder="Match #" value={form.match_number}
                  onChange={setE('match_number')} type="number" />
              )}
            </div>

            {/* Team number — TBA dropdown */}
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Team Being Scouted *</label>
              {eventTeams.length > 0 ? (
                <select className="input text-sm" value={form.team_number} onChange={setE('team_number')} required>
                  <option value="">— Select team —</option>
                  {eventTeams.map(t => (
                    <option key={t.key} value={t.team_number}>
                      {t.team_number} · {t.nickname}
                    </option>
                  ))}
                </select>
              ) : (
                <input className="input" placeholder="e.g. 254" value={form.team_number}
                  onChange={setE('team_number')} required type="number" />
              )}
            </div>

            <div>
              <label className="text-xs text-slate-500 mb-1 block">Scouter Name</label>
              <input className="input" placeholder={user?.username ?? 'Your name'}
                value={form.scouter_name} onChange={setE('scouter_name')} />
            </div>
          </div>
        </div>

        {/* ── Autonomous ── */}
        <div className="card border-l-2 border-l-green-600">
          <h2 className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-3">
            Autonomous <span className="text-slate-600 normal-case">(0–15s)</span>
          </h2>
          <div>
            <label className="text-xs text-slate-500 mb-2 block">Fuel Scored</label>
            <Spinner value={form.auto_fuel} onChange={set('auto_fuel')} />
          </div>
        </div>

        {/* ── Teleop ── */}
        <div className="card border-l-2 border-l-blue-600">
          <h2 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-3">
            Teleop <span className="text-slate-600 normal-case">(15s–2m15s)</span>
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-500 mb-2 block">Fuel Scored</label>
              <Spinner value={form.tele_fuel} onChange={set('tele_fuel')} />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-2 block">Defence Time (s)</label>
              <Spinner value={form.defence_time} onChange={set('defence_time')} max={150} />
            </div>
          </div>
        </div>

        {/* ── Endgame ── */}
        <div className="card border-l-2 border-l-yellow-600">
          <h2 className="text-xs font-semibold text-yellow-400 uppercase tracking-wider mb-3">
            Endgame <span className="text-slate-600 normal-case">(last 30s)</span>
          </h2>
          <div className="mb-4">
            <label className="text-xs text-slate-500 mb-2 block">Endgame Fuel Scored</label>
            <Spinner value={form.end_fuel} onChange={set('end_fuel')} />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-2 block">Climb Level</label>
            <div className="flex gap-2 flex-wrap">
              {CLIMB_LABELS.map((label, i) => (
                <button key={i} type="button" onClick={() => set('climb_level')(i)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    form.climb_level === i
                      ? 'bg-yellow-700 text-white'
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  }`}>{label}</button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Subjective ── */}
        <div className="card border-l-2 border-l-purple-600">
          <h2 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-3">Subjective</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm text-slate-400">Driver Skill</label>
              <Stars value={form.driver_rating} onChange={set('driver_rating')} />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-slate-400">Fuel Accuracy</label>
              <Stars value={form.accuracy_rating} onChange={set('accuracy_rating')} />
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
          <textarea className="input resize-none" rows={3} placeholder="Observations..."
            value={form.notes} onChange={setE('notes')} />
        </div>

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
