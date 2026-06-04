import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Zap, Trophy, Calendar, BarChart2 } from 'lucide-react'

const FEATURE_CARDS = [
  {
    icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-950 border-blue-800',
    title: 'Event Browser',
    desc: 'Browse all 2026 REBUILT events, live match scores, rankings, and OPR leaderboards.',
    link: '/events',
  },
  {
    icon: BarChart2, color: 'text-purple-400', bg: 'bg-purple-950 border-purple-800',
    title: 'Scout Dashboard',
    desc: 'View averaged stats for every team you\'ve scouted with interactive charts.',
    link: '/dashboard',
  },
  {
    icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-950 border-yellow-800',
    title: 'Match Predictor',
    desc: 'Predict match outcomes blending your scout data with TBA OPR ratings.',
    link: '/predict',
  },
  {
    icon: Trophy, color: 'text-green-400', bg: 'bg-green-950 border-green-800',
    title: 'Pick List',
    desc: 'Generate a weighted pick list using custom sliders for auto, tele, climb, and defence.',
    link: '/picklist',
  },
]

export default function Home() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  function handleSearch(e) {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return
    if (/^\d+$/.test(trimmed)) {
      navigate(`/team/${trimmed}`)
    } else {
      navigate(`/events?search=${encodeURIComponent(trimmed)}`)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero */}
      <div className="text-center pt-10 pb-12">
        <p className="text-xs text-blue-400 tracking-[0.3em] uppercase font-semibold mb-3">
          FRC 2026
        </p>
        <h1 className="text-5xl font-extrabold tracking-tight mb-3">
          REBUILT Scout Pro
        </h1>
        <p className="text-slate-400 text-lg mb-8">
          Real-time scouting powered by The Blue Alliance API
        </p>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              className="input pl-9"
              placeholder="Team number or event name..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary whitespace-nowrap">
            Search
          </button>
        </form>

        <p className="text-xs text-slate-600 mt-2">
          Enter a team number (e.g. 254) or event name to search
        </p>
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-2 gap-4">
        {FEATURE_CARDS.map(({ icon: Icon, color, bg, title, desc, link }) => (
          <a
            key={link}
            href={link}
            onClick={e => { e.preventDefault(); navigate(link) }}
            className={`card border ${bg} hover:opacity-80 transition-opacity cursor-pointer`}
          >
            <Icon className={`${color} mb-3`} size={24} />
            <h3 className="font-semibold text-white mb-1">{title}</h3>
            <p className="text-sm text-slate-400">{desc}</p>
          </a>
        ))}
      </div>

      {/* Quick team lookup */}
      <div className="mt-8 card">
        <h2 className="font-semibold text-slate-300 mb-3 text-sm uppercase tracking-wider">
          Quick Team Lookup
        </h2>
        <div className="flex flex-wrap gap-2">
          {[254, 1114, 2056, 3310, 1678, 118, 971, 4414].map(t => (
            <button
              key={t}
              onClick={() => navigate(`/team/${t}`)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
