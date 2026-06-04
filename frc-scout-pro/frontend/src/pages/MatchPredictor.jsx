import { useState, useEffect } from 'react'
import { analytics, tba, scout } from '../api/client'
import LoadingSpinner from '../components/LoadingSpinner'
import { Swords, TrendingUp } from 'lucide-react'

export default function MatchPredictor() {
  const [events, setEvents] = useState([])
  const [eventKey, setEventKey] = useState('')
  const [eventTeams, setEventTeams] = useState([])
  const [eventMatches, setEventMatches] = useState([])
  const [myTeams, setMyTeams] = useState([])   // scouted teams as fallback

  const [red, setRed]   = useState(['', '', ''])
  const [blue, setBlue] = useState(['', '', ''])
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  // Load event list + scouted teams on mount
  useEffect(() => {
    tba.events(2026).then(r => setEvents((r.data ?? []).sort((a, b) => (a.start_date ?? '').localeCompare(b.start_date ?? '')))).catch(() => {})
    scout.summary().then(r => setMyTeams(r.data ?? [])).catch(() => {})
  }, [])

  // When event changes, load teams + matches
  useEffect(() => {
    if (!eventKey) { setEventTeams([]); setEventMatches([]); return }
    Promise.all([
      tba.eventTeams(eventKey).catch(() => ({ data: [] })),
      tba.eventMatches(eventKey).catch(() => ({ data: [] })),
    ]).then(([t, m]) => {
      setEventTeams((t.data ?? []).sort((a, b) => a.team_number - b.team_number))
      const quals = (m.data ?? []).filter(mx => mx.comp_level === 'qm').sort((a, b) => a.match_number - b.match_number)
      setEventMatches(quals)
    })
  }, [eventKey])

  // Fill teams from a match's schedule
  function fillFromMatch(matchKey) {
    const m = eventMatches.find(mx => mx.key === matchKey)
    if (!m) return
    setRed(m.alliances?.red?.team_keys?.map(k => k.replace('frc', '')) ?? ['', '', ''])
    setBlue(m.alliances?.blue?.team_keys?.map(k => k.replace('frc', '')) ?? ['', '', ''])
  }

  async function predict() {
    const rn = red.map(v => parseInt(v)).filter(n => !isNaN(n))
    const bn = blue.map(v => parseInt(v)).filter(n => !isNaN(n))
    if (rn.length !== 3 || bn.length !== 3) {
      setError('Select exactly 3 teams per alliance.'); return
    }
    setLoading(true); setError(null); setResult(null)
    try {
      const r = await analytics.predict(rn, bn, eventKey || null)
      setResult(r.data)
    } catch {
      setError('Prediction failed.')
    } finally {
      setLoading(false)
    }
  }

  // Team options: event teams if available, otherwise scouted teams
  const teamOptions = eventTeams.length > 0
    ? eventTeams.map(t => ({ value: String(t.team_number), label: `${t.team_number} · ${t.nickname}` }))
    : myTeams.map(t => ({ value: String(t.team_number), label: String(t.team_number) }))

  function AlliancePicker({ alliance, setAlliance, color }) {
    const isRed = color === 'red'
    return (
      <div className={`card border-l-2 ${isRed ? 'border-l-red-600' : 'border-l-blue-600'}`}>
        <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${isRed ? 'text-red-400' : 'text-blue-400'}`}>
          {color.charAt(0).toUpperCase() + color.slice(1)} Alliance
        </h3>
        <div className="space-y-2">
          {alliance.map((v, i) => (
            <div key={i}>
              <label className="text-xs text-slate-500 mb-1 block">Robot {i + 1}</label>
              <select className="input text-sm" value={v}
                onChange={e => {
                  const next = [...alliance]; next[i] = e.target.value; setAlliance(next)
                }}>
                <option value="">— Pick team —</option>
                {teamOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Match Predictor</h1>
        <p className="text-sm text-slate-500 mt-0.5">Scout avg × 60% + TBA OPR × 40%</p>
      </div>

      {/* Event selector */}
      <div className="card mb-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Event (loads teams & matches)</label>
            <select className="input text-sm" value={eventKey} onChange={e => setEventKey(e.target.value)}>
              <option value="">— Select event —</option>
              {events.map(ev => (
                <option key={ev.key} value={ev.key}>
                  {ev.name} · {ev.key}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Auto-fill from match</label>
            <select className="input text-sm" disabled={!eventMatches.length}
              onChange={e => fillFromMatch(e.target.value)}>
              <option value="">— Pick a match —</option>
              {eventMatches.map(m => (
                <option key={m.key} value={m.key}>QM {m.match_number}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Alliance pickers */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <AlliancePicker alliance={red}  setAlliance={setRed}  color="red" />
        <AlliancePicker alliance={blue} setAlliance={setBlue} color="blue" />
      </div>

      {error && (
        <div className="bg-red-950 text-red-400 border border-red-800 px-4 py-2 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      <button onClick={predict} disabled={loading}
        className="btn-primary w-full py-3 font-semibold flex items-center justify-center gap-2 mb-6">
        <Swords size={18} />{loading ? 'Predicting...' : 'Simulate Match'}
      </button>

      {result && (
        <div className="space-y-4">
          <div className="card">
            <h2 className="text-sm font-semibold text-slate-400 mb-4 flex items-center gap-2">
              <TrendingUp size={15} /> Predicted Outcome
            </h2>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-center flex-1">
                <p className="text-xs text-red-400 uppercase tracking-wider mb-1">Red Alliance</p>
                <p className="text-4xl font-extrabold text-red-400">{result.red_predicted}</p>
                <p className="text-xs text-slate-500 mt-1">{(result.red_win_prob * 100).toFixed(1)}% win prob</p>
              </div>
              <div className="text-slate-600 font-bold text-xl">vs</div>
              <div className="text-center flex-1">
                <p className="text-xs text-blue-400 uppercase tracking-wider mb-1">Blue Alliance</p>
                <p className="text-4xl font-extrabold text-blue-400">{result.blue_predicted}</p>
                <p className="text-xs text-slate-500 mt-1">{(result.blue_win_prob * 100).toFixed(1)}% win prob</p>
              </div>
            </div>
            <div className="h-3 rounded-full overflow-hidden bg-blue-800">
              <div className="h-full bg-red-500 transition-all duration-500"
                style={{ width: `${result.red_win_prob * 100}%` }} />
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>Red {(result.red_win_prob * 100).toFixed(1)}%</span>
              <span className={`font-bold ${result.predicted_winner === 'Red' ? 'text-red-400' : 'text-blue-400'}`}>
                Winner: {result.predicted_winner} (+{result.margin})
              </span>
              <span>Blue {(result.blue_win_prob * 100).toFixed(1)}%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {['red', 'blue'].map((color, ci) => (
              <div key={color} className={`card border-l-2 ${ci === 0 ? 'border-l-red-600' : 'border-l-blue-600'}`}>
                <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${ci === 0 ? 'text-red-400' : 'text-blue-400'}`}>
                  {color.charAt(0).toUpperCase() + color.slice(1)} Breakdown
                </h3>
                {(result[`${color}_teams`] ?? []).map(t => (
                  <div key={t.team_number} className="border-t border-slate-800 pt-2 first:border-0 first:pt-0 mb-2">
                    <div className="flex justify-between mb-0.5">
                      <span className={`font-bold ${ci === 0 ? 'text-red-400' : 'text-blue-400'}`}>{t.team_number}</span>
                      <span className="text-white text-sm">{t.avg_score?.toFixed(1)} pts</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 text-xs text-slate-500">
                      <span>Auto: {t.avg_auto_fuel?.toFixed(1) ?? '—'}</span>
                      <span>Tele: {t.avg_tele_fuel?.toFixed(1) ?? '—'}</span>
                      <span>Climb: L{Math.round(t.avg_climb_level ?? 0)}</span>
                    </div>
                    {t.opr != null && <p className="text-xs text-yellow-400 mt-0.5">OPR: {t.opr.toFixed(2)}</p>}
                    {t.match_count === 0 && <p className="text-xs text-slate-600">No scout data</p>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
