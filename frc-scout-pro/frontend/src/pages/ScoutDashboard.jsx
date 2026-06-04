import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { scout, tba } from '../api/client'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import StatCard from '../components/StatCard'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { RefreshCw, Download } from 'lucide-react'

export default function ScoutDashboard() {
  const { user } = useAuth()
  const [teams, setTeams]       = useState([])
  const [events, setEvents]     = useState([])
  const [eventFilter, setEventFilter] = useState('')
  const [loading, setLoading]   = useState(true)
  const [sortKey, setSortKey]   = useState('avg_score')
  const [sortDir, setSortDir]   = useState(-1)
  const [chartMetric, setChartMetric] = useState('avg_score')
  const navigate = useNavigate()

  async function load() {
    setLoading(true)
    try {
      const r = await scout.summary(eventFilter || null)
      setTeams(r.data ?? [])
    } catch { setTeams([]) }
    finally  { setLoading(false) }
  }

  useEffect(() => {
    tba.events(2026).then(r => setEvents(r.data ?? [])).catch(() => {})
  }, [])

  useEffect(() => { load() }, [eventFilter])

  function toggleSort(key) {
    if (sortKey === key) setSortDir(d => -d)
    else { setSortKey(key); setSortDir(-1) }
  }

  const sorted = [...teams].sort((a, b) => sortDir * ((a[sortKey] ?? 0) - (b[sortKey] ?? 0)))
  const chartData = sorted.slice(0, 15).map(t => ({
    team: String(t.team_number), [chartMetric]: t[chartMetric],
  }))

  function exportCSV() {
    const header = 'Team,Matches,Avg Score,Avg Auto Fuel,Avg Tele Fuel,Avg End Fuel,Avg Total Fuel,Avg Climb,Avg Driver'
    const rows = sorted.map(t =>
      `${t.team_number},${t.match_count},${t.avg_score},${t.avg_auto_fuel},${t.avg_tele_fuel},${t.avg_end_fuel},${t.avg_total_fuel},${t.avg_climb_level},${t.avg_driver_rating}`
    )
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'scout_2026.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return <LoadingSpinner text="Loading scout data..." />

  const totalMatches = teams.reduce((s, t) => s + t.match_count, 0)
  const best = sorted[0]

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-white">Scout Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {user?.team_name ?? 'Your team'} · {teams.length} teams · {totalMatches} observations
          </p>
        </div>
        <div className="flex gap-2">
          {/* Event filter dropdown */}
          <select className="input w-52 text-sm py-1.5" value={eventFilter}
            onChange={e => setEventFilter(e.target.value)}>
            <option value="">All events</option>
            {events.map(ev => <option key={ev.key} value={ev.key}>{ev.name} · {ev.key}</option>)}
          </select>
          <button onClick={load} className="btn-ghost flex items-center gap-1 text-sm">
            <RefreshCw size={13} />
          </button>
          {teams.length > 0 && (
            <button onClick={exportCSV} className="btn-ghost flex items-center gap-1 text-sm">
              <Download size={13} /> CSV
            </button>
          )}
        </div>
      </div>

      {teams.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-slate-500 mb-3">No scout data yet.</p>
          <a href="/scout" onClick={e => { e.preventDefault(); navigate('/scout') }}
            className="btn-primary">Add first observation</a>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-3 mb-4">
            <StatCard label="Teams Scouted" value={teams.length} />
            <StatCard label="Observations" value={totalMatches} />
            <StatCard label="Top Team" value={best?.team_number} color="text-blue-400"
              sub={`${best?.avg_score?.toFixed(1)} pts avg`} />
            <StatCard label="Field Avg Score"
              value={(teams.reduce((s, t) => s + t.avg_score, 0) / teams.length).toFixed(1)}
              color="text-yellow-400" />
          </div>

          <div className="card mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-400">Top 15 Teams</h3>
              <select className="input w-44 text-xs py-1" value={chartMetric}
                onChange={e => setChartMetric(e.target.value)}>
                <option value="avg_score">Avg Score</option>
                <option value="avg_auto_fuel">Avg Auto Fuel</option>
                <option value="avg_tele_fuel">Avg Tele Fuel</option>
                <option value="avg_end_fuel">Avg End Fuel</option>
                <option value="avg_total_fuel">Avg Total Fuel</option>
                <option value="avg_climb_level">Avg Climb Level</option>
                <option value="avg_driver_rating">Avg Driver Rating</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="team" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155' }}
                  formatter={v => [typeof v === 'number' ? v.toFixed(2) : v]} />
                <Bar dataKey={chartMetric} fill="#3b82f6" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-500 border-b border-slate-800">
                  {[
                    ['team_number','Team'],['match_count','Obs'],
                    ['avg_score','Avg Score'],['avg_auto_fuel','Auto Fuel'],
                    ['avg_tele_fuel','Tele Fuel'],['avg_end_fuel','End Fuel'],
                    ['avg_total_fuel','Total Fuel'],['avg_climb_level','Climb'],
                    ['avg_driver_rating','Driver'],
                  ].map(([key, label]) => (
                    <th key={key} className="text-left pb-2 pr-3 cursor-pointer hover:text-white whitespace-nowrap"
                      onClick={() => toggleSort(key)}>
                      {label}{sortKey === key ? (sortDir === -1 ? ' ↓' : ' ↑') : ''}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map(t => (
                  <tr key={t.team_number}
                    className="border-b border-slate-800/50 hover:bg-slate-800/30 cursor-pointer"
                    onClick={() => navigate(`/team/${t.team_number}`)}>
                    <td className="py-2 pr-3 text-blue-400 font-bold">{t.team_number}</td>
                    <td className="py-2 pr-3 text-slate-400">{t.match_count}</td>
                    <td className="py-2 pr-3 text-white font-medium">{t.avg_score?.toFixed(1)}</td>
                    <td className="py-2 pr-3 text-green-400">{t.avg_auto_fuel?.toFixed(1)}</td>
                    <td className="py-2 pr-3 text-blue-400">{t.avg_tele_fuel?.toFixed(1)}</td>
                    <td className="py-2 pr-3 text-yellow-400">{t.avg_end_fuel?.toFixed(1)}</td>
                    <td className="py-2 pr-3 text-white">{t.avg_total_fuel?.toFixed(1)}</td>
                    <td className="py-2 pr-3 text-slate-300">L{Math.round(t.avg_climb_level ?? 0)}</td>
                    <td className="py-2 text-slate-300">{t.avg_driver_rating?.toFixed(1)}/5</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
