import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { scout } from '../api/client'
import LoadingSpinner from '../components/LoadingSpinner'
import StatCard from '../components/StatCard'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts'
import { RefreshCw, Download, Trash2 } from 'lucide-react'

export default function ScoutDashboard() {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortKey, setSortKey] = useState('avg_score')
  const [sortDir, setSortDir] = useState(-1)
  const [chartMetric, setChartMetric] = useState('avg_score')
  const navigate = useNavigate()

  async function load() {
    setLoading(true)
    try {
      const r = await scout.summary()
      setTeams(r.data ?? [])
    } catch {
      setTeams([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function toggleSort(key) {
    if (sortKey === key) setSortDir(d => -d)
    else { setSortKey(key); setSortDir(-1) }
  }

  const sorted = [...teams].sort((a, b) => sortDir * (a[sortKey] - b[sortKey]))

  const chartData = sorted.slice(0, 15).map(t => ({
    team: String(t.team_number),
    [chartMetric]: t[chartMetric],
  }))

  function exportCSV() {
    const header = 'Team,Matches,Avg Score,Avg Auto High,Avg Auto Low,Mobility,Avg Tele High,Avg Tele Low,Avg Climb,Avg Driver'
    const rows = teams.map(t =>
      `${t.team_number},${t.match_count},${t.avg_score},${t.avg_auto_high},${t.avg_auto_low},${t.mobility_rate},${t.avg_tele_high},${t.avg_tele_low},${t.avg_climb_level},${t.avg_driver_rating}`
    )
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'scout_data_2026.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return <LoadingSpinner text="Loading scout data..." />

  const totalMatches = teams.reduce((s, t) => s + t.match_count, 0)
  const bestTeam = teams[0]

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Scout Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">REBUILT 2026 · {teams.length} teams · {totalMatches} observations</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="btn-ghost flex items-center gap-2">
            <RefreshCw size={14} /> Refresh
          </button>
          {teams.length > 0 && (
            <button onClick={exportCSV} className="btn-ghost flex items-center gap-2">
              <Download size={14} /> Export CSV
            </button>
          )}
        </div>
      </div>

      {teams.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-slate-500 mb-3">No scout data yet.</p>
          <a href="/scout" onClick={e => { e.preventDefault(); navigate('/scout') }}
            className="btn-primary">Add your first observation</a>
        </div>
      ) : (
        <>
          {/* Quick stats */}
          <div className="grid grid-cols-4 gap-3 mb-5">
            <StatCard label="Teams Scouted" value={teams.length} />
            <StatCard label="Total Observations" value={totalMatches} />
            <StatCard label="Top Team" value={bestTeam?.team_number} color="text-blue-400"
              sub={`Avg ${bestTeam?.avg_score?.toFixed(1)} pts`} />
            <StatCard label="Avg Score" value={(teams.reduce((s, t) => s + t.avg_score, 0) / teams.length).toFixed(1)}
              color="text-yellow-400" />
          </div>

          {/* Chart */}
          <div className="card mb-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-400">Top 15 Teams</h3>
              <select className="input w-44 text-xs py-1"
                value={chartMetric} onChange={e => setChartMetric(e.target.value)}>
                <option value="avg_score">Avg Score</option>
                <option value="avg_auto_high">Avg Auto High</option>
                <option value="avg_tele_high">Avg Tele High</option>
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
                  formatter={v => [typeof v === 'number' ? v.toFixed(2) : v, chartMetric]} />
                <Bar dataKey={chartMetric} fill="#3b82f6" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Table */}
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-500 border-b border-slate-800">
                  {[
                    ['team_number', 'Team'],
                    ['match_count', 'Matches'],
                    ['avg_score', 'Avg Score'],
                    ['avg_auto_high', 'Auto High'],
                    ['avg_tele_high', 'Tele High'],
                    ['avg_climb_level', 'Climb Lvl'],
                    ['avg_driver_rating', 'Driver'],
                    ['mobility_rate', 'Mobility'],
                  ].map(([key, label]) => (
                    <th key={key} className="text-left pb-2 pr-3 cursor-pointer hover:text-white"
                      onClick={() => toggleSort(key)}>
                      {label} {sortKey === key ? (sortDir === -1 ? '↓' : '↑') : ''}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((t, i) => (
                  <tr key={t.team_number}
                    className="border-b border-slate-800/50 hover:bg-slate-800/30 cursor-pointer"
                    onClick={() => navigate(`/team/${t.team_number}`)}>
                    <td className="py-2 pr-3 text-blue-400 font-bold">{t.team_number}</td>
                    <td className="py-2 pr-3 text-slate-400">{t.match_count}</td>
                    <td className="py-2 pr-3 text-white font-medium">{t.avg_score?.toFixed(1)}</td>
                    <td className="py-2 pr-3 text-green-400">{t.avg_auto_high?.toFixed(1)}</td>
                    <td className="py-2 pr-3 text-blue-400">{t.avg_tele_high?.toFixed(1)}</td>
                    <td className="py-2 pr-3 text-yellow-400">L{Math.round(t.avg_climb_level)}</td>
                    <td className="py-2 pr-3 text-slate-300">{t.avg_driver_rating?.toFixed(1)}/5</td>
                    <td className="py-2">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        t.mobility_rate > 0.7 ? 'badge-green' : t.mobility_rate > 0.3 ? 'badge-yellow' : 'badge-red'
                      }`}>
                        {(t.mobility_rate * 100).toFixed(0)}%
                      </span>
                    </td>
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
