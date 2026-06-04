import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { tba, scout } from '../api/client'
import LoadingSpinner from '../components/LoadingSpinner'
import StatCard from '../components/StatCard'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, Tooltip,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts'
import { MapPin, Globe, Trophy, ChevronRight } from 'lucide-react'

export default function TeamProfile() {
  const { num } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [scoutData, setScoutData] = useState(null)
  const [tab, setTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true); setError(null)
      try {
        const [profileRes, scoutRes] = await Promise.allSettled([
          tba.teamProfile(num),
          scout.teamAverages(num),
        ])
        if (profileRes.status === 'fulfilled') setProfile(profileRes.value.data)
        else setError(`Team ${num} not found`)
        if (scoutRes.status === 'fulfilled') setScoutData(scoutRes.value.data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [num])

  if (loading) return <LoadingSpinner text={`Loading team ${num}...`} />
  if (error) return <div className="card text-red-400">{error}</div>

  const team = profile?.team
  const events = profile?.events ?? []
  const awards = profile?.awards ?? []

  const radarData = scoutData ? [
    { subject: 'Auto', value: Math.min(scoutData.avg_auto_high * 5 + scoutData.avg_auto_low * 2, 100) },
    { subject: 'Teleop', value: Math.min(scoutData.avg_tele_high * 3 + scoutData.avg_tele_low, 100) },
    { subject: 'Climb', value: scoutData.avg_climb_level * 33 },
    { subject: 'Driver', value: scoutData.avg_driver_rating * 20 },
    { subject: 'Accuracy', value: scoutData.avg_accuracy_rating * 20 },
    { subject: 'Defence', value: Math.min(scoutData.avg_defence_time * 2, 100) },
  ] : []

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="card mb-4 flex items-start justify-between">
        <div>
          <p className="text-xs text-blue-400 uppercase tracking-wider mb-1">Team</p>
          <h1 className="text-3xl font-extrabold text-white">
            {team?.team_number} — {team?.nickname ?? '—'}
          </h1>
          <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-400">
            {team?.city && (
              <span className="flex items-center gap-1">
                <MapPin size={13} /> {team.city}, {team.state_prov}, {team.country}
              </span>
            )}
            {team?.website && (
              <a href={team.website} target="_blank" rel="noreferrer"
                className="flex items-center gap-1 text-blue-400 hover:underline">
                <Globe size={13} /> Website
              </a>
            )}
          </div>
          {team?.motto && (
            <p className="text-xs text-slate-500 italic mt-1">"{team.motto}"</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Rookie Year</p>
          <p className="text-2xl font-bold text-slate-300">{team?.rookie_year ?? '—'}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b border-slate-800 pb-2">
        {['overview', 'events', 'matches', 'awards'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-1.5 text-sm rounded-t-lg capitalize transition-colors ${
              tab === t ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-500 hover:text-white'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-4">
          {/* Scout stats */}
          {scoutData ? (
            <>
              <div className="grid grid-cols-4 gap-3">
                <StatCard label="Avg Score" value={scoutData.avg_score?.toFixed(1)} color="text-blue-400" />
                <StatCard label="Matches Scouted" value={scoutData.match_count} />
                <StatCard label="Avg Climb Level" value={`L${Math.round(scoutData.avg_climb_level)}`} color="text-green-400" />
                <StatCard label="Mobility Rate" value={`${(scoutData.mobility_rate * 100).toFixed(0)}%`} color="text-yellow-400" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="card">
                  <h3 className="text-sm font-semibold text-slate-400 mb-3">Performance Radar</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                      <Radar dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="card">
                  <h3 className="text-sm font-semibold text-slate-400 mb-3">Score Trend</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={scoutData.scores_over_time ?? []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="match" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'Match', position: 'insideBottom', offset: -2, fill: '#64748b', fontSize: 11 }} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155' }} />
                      <Bar dataKey="score" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          ) : (
            <div className="card text-slate-500 text-sm">
              No scout data for team {num} yet. <a href="/scout" className="text-blue-400 hover:underline">Scout a match</a>
            </div>
          )}

          {/* TBA team info */}
          {team?.school_name && (
            <div className="card">
              <p className="text-xs text-slate-500 mb-1">School / Organization</p>
              <p className="text-sm text-slate-300">{team.school_name}</p>
            </div>
          )}
        </div>
      )}

      {tab === 'events' && (
        <div className="space-y-2">
          {events.length === 0 && <p className="text-slate-500 text-sm">No events in 2026.</p>}
          {events.map(ev => (
            <div key={ev.key}
              className="card flex items-center justify-between hover:border-slate-600 cursor-pointer transition-colors"
              onClick={() => navigate(`/event/${ev.key}`)}>
              <div>
                <p className="font-medium text-white">{ev.name}</p>
                <p className="text-xs text-slate-500">{ev.start_date} — {ev.end_date} · {ev.city}, {ev.state_prov}</p>
              </div>
              <ChevronRight className="text-slate-600" size={16} />
            </div>
          ))}
        </div>
      )}

      {tab === 'matches' && (
        <MatchTab teamNum={num} events={events} />
      )}

      {tab === 'awards' && (
        <div className="space-y-2">
          {awards.length === 0 && <p className="text-slate-500 text-sm">No awards in 2026.</p>}
          {awards.map((a, i) => (
            <div key={i} className="card flex items-center gap-3">
              <Trophy className="text-yellow-400 shrink-0" size={16} />
              <div>
                <p className="text-sm font-medium text-white">{a.name}</p>
                <p className="text-xs text-slate-500">{a.event_key}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function MatchTab({ teamNum, events }) {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    tba.teamMatches(teamNum, 2026)
      .then(r => setMatches(r.data ?? []))
      .catch(() => setMatches([]))
      .finally(() => setLoading(false))
  }, [teamNum])

  if (loading) return <LoadingSpinner />

  const sorted = [...matches].sort((a, b) =>
    (a.actual_time ?? a.predicted_time ?? 0) - (b.actual_time ?? b.predicted_time ?? 0)
  )

  return (
    <div className="space-y-1.5">
      {sorted.length === 0 && <p className="text-slate-500 text-sm">No matches recorded yet.</p>}
      {sorted.map(m => {
        const teamKey = `frc${teamNum}`
        const isRed = m.alliances?.red?.team_keys?.includes(teamKey)
        const alliance = isRed ? 'red' : 'blue'
        const myScore = isRed ? m.alliances?.red?.score : m.alliances?.blue?.score
        const oppScore = isRed ? m.alliances?.blue?.score : m.alliances?.red?.score
        const won = myScore != null && oppScore != null && myScore > oppScore

        return (
          <div key={m.key} className="card flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              <span className={`w-2 h-2 rounded-full shrink-0 ${isRed ? 'bg-red-500' : 'bg-blue-500'}`} />
              <span className="text-slate-400">{m.comp_level?.toUpperCase()} {m.match_number}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded ${
                won ? 'bg-green-950 text-green-400' : myScore != null ? 'bg-red-950 text-red-400' : 'bg-slate-800 text-slate-500'
              }`}>
                {myScore != null ? (won ? 'W' : 'L') : '—'}
              </span>
            </div>
            <div className="text-right">
              <span className={isRed ? 'text-red-400' : 'text-blue-400'}>
                {myScore ?? '?'}
              </span>
              <span className="text-slate-600 mx-1">vs</span>
              <span className="text-slate-400">{oppScore ?? '?'}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
