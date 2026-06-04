import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { tba } from '../api/client'
import LoadingSpinner from '../components/LoadingSpinner'
import { MapPin, Trophy, BarChart2, Users, Swords } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function EventView() {
  const { key } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [tab, setTab] = useState('rankings')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    tba.eventFull(key)
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [key])

  if (loading) return <LoadingSpinner text={`Loading ${key}...`} />
  if (!data?.event) return <div className="card text-red-400">Event {key} not found.</div>

  const ev = data.event
  const teams = data.teams ?? []
  const matches = data.matches ?? []
  const rankings = data.rankings?.rankings ?? []
  const oprs = data.oprs ?? {}
  const alliances = data.alliances ?? []
  const awards = data.awards ?? []

  const oprList = Object.entries(oprs.oprs ?? {})
    .map(([k, v]) => ({ team: k.replace('frc', ''), opr: v, dpr: oprs.dprs?.[k] ?? 0, ccwm: oprs.ccwms?.[k] ?? 0 }))
    .sort((a, b) => b.opr - a.opr)
    .slice(0, 20)

  const qualMatches = matches.filter(m => m.comp_level === 'qm')
    .sort((a, b) => a.match_number - b.match_number)

  const elimMatches = matches.filter(m => m.comp_level !== 'qm')
    .sort((a, b) => (a.actual_time ?? 0) - (b.actual_time ?? 0))

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="card mb-4">
        <h1 className="text-2xl font-bold text-white mb-1">{ev.name}</h1>
        <div className="flex flex-wrap gap-4 text-sm text-slate-400">
          <span className="flex items-center gap-1"><MapPin size={13} />{ev.city}, {ev.state_prov}</span>
          <span>{ev.start_date} — {ev.end_date}</span>
          {ev.week != null && <span>Week {ev.week + 1}</span>}
          <span className="font-mono text-slate-600 text-xs">{ev.key}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b border-slate-800 pb-2 overflow-x-auto">
        {[
          ['rankings', 'Rankings'],
          ['oprs', 'OPRs'],
          ['teams', 'Teams'],
          ['qual', 'Qual Matches'],
          ['elim', 'Elim Matches'],
          ['alliances', 'Alliances'],
          ['awards', 'Awards'],
        ].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`px-3 py-1.5 text-sm whitespace-nowrap rounded-t-lg transition-colors ${
              tab === id ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-500 hover:text-white'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* Rankings */}
      {tab === 'rankings' && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-500 border-b border-slate-800">
                <th className="text-left pb-2 pr-4">Rank</th>
                <th className="text-left pb-2 pr-4">Team</th>
                <th className="text-right pb-2 pr-4">W-L-T</th>
                <th className="text-right pb-2 pr-4">DQ</th>
                <th className="text-right pb-2">Played</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map(r => (
                <tr key={r.team_key} className="border-b border-slate-800/50 hover:bg-slate-800/30 cursor-pointer"
                  onClick={() => navigate(`/team/${r.team_key.replace('frc', '')}`)}>
                  <td className="py-2 pr-4 font-bold text-slate-300">#{r.rank}</td>
                  <td className="py-2 pr-4 text-blue-400 font-medium">{r.team_key.replace('frc', '')}</td>
                  <td className="py-2 pr-4 text-right text-slate-400">
                    {r.record ? `${r.record.wins}-${r.record.losses}-${r.record.ties}` : '—'}
                  </td>
                  <td className="py-2 pr-4 text-right text-slate-500">{r.dq}</td>
                  <td className="py-2 text-right text-slate-500">{r.matches_played}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rankings.length === 0 && <p className="text-slate-500 text-sm py-4">Rankings not yet available.</p>}
        </div>
      )}

      {/* OPRs */}
      {tab === 'oprs' && (
        <div className="space-y-4">
          {oprList.length === 0 && <p className="card text-slate-500 text-sm">OPR data not yet available.</p>}
          {oprList.length > 0 && (
            <div className="card">
              <h3 className="text-sm font-semibold text-slate-400 mb-3">Top 20 OPR</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={oprList} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis type="category" dataKey="team" width={40} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155' }}
                    formatter={(v, n) => [v.toFixed(2), n.toUpperCase()]} />
                  <Bar dataKey="opr" fill="#3b82f6" radius={[0, 3, 3, 0]} />
                  <Bar dataKey="dpr" fill="#ef4444" radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-500 border-b border-slate-800">
                  <th className="text-left pb-2 pr-4">Team</th>
                  <th className="text-right pb-2 pr-4">OPR</th>
                  <th className="text-right pb-2 pr-4">DPR</th>
                  <th className="text-right pb-2">CCWM</th>
                </tr>
              </thead>
              <tbody>
                {oprList.map(r => (
                  <tr key={r.team} className="border-b border-slate-800/50 hover:bg-slate-800/30 cursor-pointer"
                    onClick={() => navigate(`/team/${r.team}`)}>
                    <td className="py-2 pr-4 text-blue-400 font-medium">{r.team}</td>
                    <td className="py-2 pr-4 text-right text-green-400">{r.opr.toFixed(2)}</td>
                    <td className="py-2 pr-4 text-right text-red-400">{r.dpr.toFixed(2)}</td>
                    <td className="py-2 text-right text-yellow-400">{r.ccwm.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Teams */}
      {tab === 'teams' && (
        <div className="grid grid-cols-3 gap-2">
          {teams.sort((a, b) => a.team_number - b.team_number).map(t => (
            <div key={t.key} className="card hover:border-slate-600 cursor-pointer transition-colors"
              onClick={() => navigate(`/team/${t.team_number}`)}>
              <p className="text-blue-400 font-bold">{t.team_number}</p>
              <p className="text-sm text-slate-300 truncate">{t.nickname}</p>
              <p className="text-xs text-slate-600 mt-0.5">{t.city}, {t.state_prov}</p>
            </div>
          ))}
        </div>
      )}

      {/* Qual Matches */}
      {tab === 'qual' && <MatchTable matches={qualMatches} />}

      {/* Elim Matches */}
      {tab === 'elim' && <MatchTable matches={elimMatches} label="Elimination" />}

      {/* Alliances */}
      {tab === 'alliances' && (
        <div className="grid grid-cols-2 gap-3">
          {alliances.map((a, i) => (
            <div key={i} className="card">
              <p className="text-xs text-slate-500 mb-2">Alliance {i + 1}</p>
              <div className="space-y-1">
                {a.picks?.map(k => (
                  <div key={k} className="flex items-center gap-2 cursor-pointer hover:text-white"
                    onClick={() => navigate(`/team/${k.replace('frc', '')}`)}>
                    <span className={`w-2 h-2 rounded-full ${i < 8 ? 'bg-blue-500' : 'bg-red-500'}`} />
                    <span className="text-blue-400">{k.replace('frc', '')}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {alliances.length === 0 && <p className="card text-slate-500 text-sm">Alliances not yet selected.</p>}
        </div>
      )}

      {/* Awards */}
      {tab === 'awards' && (
        <div className="space-y-2">
          {awards.map((a, i) => (
            <div key={i} className="card flex items-start gap-3">
              <Trophy className="text-yellow-400 shrink-0 mt-0.5" size={16} />
              <div>
                <p className="font-medium text-white text-sm">{a.name}</p>
                {a.recipient_list?.map((r, j) => (
                  <p key={j} className="text-xs text-slate-400 mt-0.5">
                    {r.team_key?.replace('frc', 'Team ')} {r.awardee && `— ${r.awardee}`}
                  </p>
                ))}
              </div>
            </div>
          ))}
          {awards.length === 0 && <p className="text-slate-500 text-sm">No awards recorded yet.</p>}
        </div>
      )}
    </div>
  )
}

function MatchTable({ matches, label = 'Qualification' }) {
  if (matches.length === 0)
    return <p className="card text-slate-500 text-sm">No {label.toLowerCase()} matches yet.</p>

  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-slate-500 border-b border-slate-800">
            <th className="text-left pb-2 pr-3">Match</th>
            <th className="text-left pb-2 pr-3">Red Alliance</th>
            <th className="text-right pb-2 pr-3">Red</th>
            <th className="text-right pb-2 pr-3">Blue</th>
            <th className="text-left pb-2">Blue Alliance</th>
          </tr>
        </thead>
        <tbody>
          {matches.map(m => {
            const redScore = m.alliances?.red?.score
            const blueScore = m.alliances?.blue?.score
            const redWon = redScore != null && blueScore != null && redScore > blueScore
            return (
              <tr key={m.key} className="border-b border-slate-800/50">
                <td className="py-2 pr-3 text-slate-400 whitespace-nowrap">
                  {m.comp_level?.toUpperCase()} {m.match_number}
                </td>
                <td className="py-2 pr-3">
                  <div className="flex gap-1 flex-wrap">
                    {m.alliances?.red?.team_keys?.map(k => (
                      <span key={k} className="badge-red">{k.replace('frc', '')}</span>
                    ))}
                  </div>
                </td>
                <td className={`py-2 pr-3 text-right font-bold ${redWon ? 'text-red-400' : 'text-slate-400'}`}>
                  {redScore ?? '?'}
                </td>
                <td className={`py-2 pr-3 text-right font-bold ${!redWon && blueScore != null ? 'text-blue-400' : 'text-slate-400'}`}>
                  {blueScore ?? '?'}
                </td>
                <td className="py-2">
                  <div className="flex gap-1 flex-wrap">
                    {m.alliances?.blue?.team_keys?.map(k => (
                      <span key={k} className="badge-blue">{k.replace('frc', '')}</span>
                    ))}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
