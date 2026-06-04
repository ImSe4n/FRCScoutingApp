import { useState, useEffect } from 'react'
import { analytics, scout } from '../api/client'
import LoadingSpinner from '../components/LoadingSpinner'
import { Swords, TrendingUp } from 'lucide-react'

export default function MatchPredictor() {
  const [teams, setTeams] = useState([])
  const [red, setRed] = useState(['', '', ''])
  const [blue, setBlue] = useState(['', '', ''])
  const [eventKey, setEventKey] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    scout.summary().then(r => setTeams(r.data ?? [])).catch(() => setTeams([]))
  }, [])

  async function predict() {
    const redNums = red.map(v => parseInt(v)).filter(n => !isNaN(n))
    const blueNums = blue.map(v => parseInt(v)).filter(n => !isNaN(n))
    if (redNums.length !== 3 || blueNums.length !== 3) {
      setError('Select exactly 3 teams per alliance.'); return
    }
    setLoading(true); setError(null); setResult(null)
    try {
      const r = await analytics.predict(redNums, blueNums, eventKey || null)
      setResult(r.data)
    } catch {
      setError('Prediction failed. Make sure teams have scout data or OPR data available.')
    } finally {
      setLoading(false)
    }
  }

  const teamOptions = teams.map(t => t.team_number)

  function AlliancePicker({ alliance, setAlliance, color }) {
    return (
      <div className={`card border-l-2 ${color === 'red' ? 'border-l-red-600' : 'border-l-blue-600'}`}>
        <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${color === 'red' ? 'text-red-400' : 'text-blue-400'}`}>
          {color.charAt(0).toUpperCase() + color.slice(1)} Alliance
        </h3>
        <div className="space-y-2">
          {alliance.map((v, i) => (
            <div key={i}>
              <label className="text-xs text-slate-500 mb-1 block">Robot {i + 1}</label>
              <div className="flex gap-2">
                <input className="input" placeholder="Team #" value={v}
                  onChange={e => {
                    const next = [...alliance]; next[i] = e.target.value; setAlliance(next)
                  }} />
                {teamOptions.length > 0 && (
                  <select className="input w-32 text-xs"
                    value={v}
                    onChange={e => {
                      const next = [...alliance]; next[i] = e.target.value; setAlliance(next)
                    }}>
                    <option value="">Pick...</option>
                    {teamOptions.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                )}
              </div>
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
        <p className="text-sm text-slate-500 mt-0.5">
          Blends scout averages (60%) with TBA OPR (40%) to forecast outcomes
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <AlliancePicker alliance={red} setAlliance={setRed} color="red" />
        <AlliancePicker alliance={blue} setAlliance={setBlue} color="blue" />
      </div>

      <div className="card mb-4">
        <label className="text-xs text-slate-500 mb-1 block">Event Key (optional — enables OPR blend)</label>
        <input className="input" placeholder="e.g. 2026onto" value={eventKey}
          onChange={e => setEventKey(e.target.value)} />
      </div>

      {error && (
        <div className="bg-red-950 text-red-400 border border-red-800 px-4 py-2 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      <button onClick={predict} disabled={loading}
        className="btn-primary w-full py-3 text-base font-semibold flex items-center justify-center gap-2 mb-6">
        <Swords size={18} />
        {loading ? 'Predicting...' : 'Simulate Match'}
      </button>

      {result && (
        <div className="space-y-4">
          {/* Score bar */}
          <div className="card">
            <h2 className="text-sm font-semibold text-slate-400 mb-4 flex items-center gap-2">
              <TrendingUp size={15} /> Predicted Outcome
            </h2>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-center flex-1">
                <p className="text-xs text-red-400 uppercase tracking-wider mb-1">Red Alliance</p>
                <p className="text-4xl font-extrabold text-red-400">{result.red_predicted}</p>
                <p className="text-xs text-slate-500 mt-1">{(result.red_win_prob * 100).toFixed(1)}% win probability</p>
              </div>
              <div className="text-slate-600 font-bold text-xl">vs</div>
              <div className="text-center flex-1">
                <p className="text-xs text-blue-400 uppercase tracking-wider mb-1">Blue Alliance</p>
                <p className="text-4xl font-extrabold text-blue-400">{result.blue_predicted}</p>
                <p className="text-xs text-slate-500 mt-1">{(result.blue_win_prob * 100).toFixed(1)}% win probability</p>
              </div>
            </div>
            {/* Win probability bar */}
            <div className="h-3 rounded-full overflow-hidden bg-blue-800">
              <div className="h-full bg-red-500 transition-all duration-500"
                style={{ width: `${result.red_win_prob * 100}%` }} />
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>Red {(result.red_win_prob * 100).toFixed(1)}%</span>
              <span className={`font-bold ${result.predicted_winner === 'Red' ? 'text-red-400' : 'text-blue-400'}`}>
                Predicted Winner: {result.predicted_winner}
              </span>
              <span>Blue {(result.blue_win_prob * 100).toFixed(1)}%</span>
            </div>
          </div>

          {/* Per-team breakdown */}
          <div className="grid grid-cols-2 gap-4">
            <TeamBreakdown teams={result.red_teams} color="red" />
            <TeamBreakdown teams={result.blue_teams} color="blue" />
          </div>
        </div>
      )}
    </div>
  )
}

function TeamBreakdown({ teams, color }) {
  const isRed = color === 'red'
  return (
    <div className={`card border-l-2 ${isRed ? 'border-l-red-600' : 'border-l-blue-600'}`}>
      <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${isRed ? 'text-red-400' : 'text-blue-400'}`}>
        {isRed ? 'Red' : 'Blue'} Breakdown
      </h3>
      <div className="space-y-3">
        {teams.map(t => (
          <div key={t.team_number} className="border-t border-slate-800 pt-2 first:border-0 first:pt-0">
            <div className="flex justify-between mb-1">
              <span className={`font-bold ${isRed ? 'text-red-400' : 'text-blue-400'}`}>{t.team_number}</span>
              <span className="text-white font-medium">{t.avg_score?.toFixed(1)} pts avg</span>
            </div>
            <div className="grid grid-cols-3 gap-1 text-xs text-slate-500">
              <span>Auto H: {t.avg_auto_high?.toFixed(1) ?? '—'}</span>
              <span>Tele H: {t.avg_tele_high?.toFixed(1) ?? '—'}</span>
              <span>Climb: L{Math.round(t.avg_climb_level ?? 0)}</span>
            </div>
            {t.opr != null && (
              <p className="text-xs text-yellow-400 mt-1">OPR: {t.opr.toFixed(2)}</p>
            )}
            {t.match_count === 0 && (
              <p className="text-xs text-slate-600 mt-1">No scout data — using 0</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
