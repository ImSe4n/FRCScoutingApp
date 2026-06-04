import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { tba } from '../api/client'
import LoadingSpinner from '../components/LoadingSpinner'
import { MapPin, ChevronRight, Search } from 'lucide-react'

const EVENT_TYPE_LABELS = {
  0: 'Regional', 1: 'District', 2: 'District Championship',
  3: 'Championship Division', 4: 'Championship Finals', 5: 'District Championship Division',
  6: 'FOC', 99: 'Off-Season', 100: 'Preseason',
}

export default function EventBrowser() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const search = searchParams.get('search')
    if (search) setFilter(search)
    tba.events(2026)
      .then(r => {
        const sorted = [...(r.data ?? [])].sort((a, b) => (a.start_date ?? '').localeCompare(b.start_date ?? ''))
        setEvents(sorted)
      })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner text="Loading 2026 REBUILT events..." />

  const filtered = events.filter(ev => {
    const matchText = filter
      ? ev.name?.toLowerCase().includes(filter.toLowerCase()) ||
        ev.key?.toLowerCase().includes(filter.toLowerCase()) ||
        ev.city?.toLowerCase().includes(filter.toLowerCase())
      : true
    const matchType = typeFilter === 'all' || String(ev.event_type) === typeFilter
    return matchText && matchType
  })

  const types = [...new Set(events.map(e => e.event_type))]
    .filter(t => t != null)
    .sort()

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">2026 REBUILT Events</h1>
          <p className="text-sm text-slate-500 mt-0.5">{events.length} events · live data from The Blue Alliance</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
          <input className="input pl-8 text-sm" placeholder="Search events..." value={filter}
            onChange={e => setFilter(e.target.value)} />
        </div>
        <select className="input w-48 text-sm"
          value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="all">All types</option>
          {types.map(t => (
            <option key={t} value={String(t)}>{EVENT_TYPE_LABELS[t] ?? `Type ${t}`}</option>
          ))}
        </select>
      </div>

      {/* Events grid */}
      {filtered.length === 0 && (
        <p className="text-slate-500 text-sm">No events match your filter.</p>
      )}
      <div className="space-y-2">
        {filtered.map(ev => (
          <div key={ev.key}
            className="card flex items-center justify-between hover:border-slate-600 cursor-pointer transition-all"
            onClick={() => navigate(`/event/${ev.key}`)}>
            <div className="flex items-start gap-4">
              <div className="text-center w-14 shrink-0">
                <p className="text-xs text-slate-500">{ev.start_date?.slice(5, 7)}/{ev.start_date?.slice(8, 10)}</p>
                <p className="text-xs text-slate-600">–</p>
                <p className="text-xs text-slate-500">{ev.end_date?.slice(5, 7)}/{ev.end_date?.slice(8, 10)}</p>
              </div>
              <div>
                <p className="font-medium text-white">{ev.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <MapPin size={10} /> {ev.city}, {ev.state_prov} {ev.country !== 'USA' ? `· ${ev.country}` : ''}
                  </span>
                  <span className="text-xs text-slate-700">·</span>
                  <span className="text-xs text-slate-600 italic">{EVENT_TYPE_LABELS[ev.event_type] ?? ev.event_type_string}</span>
                </div>
                <p className="text-xs text-slate-700 mt-0.5 font-mono">{ev.key}</p>
              </div>
            </div>
            <ChevronRight className="text-slate-600 shrink-0" size={16} />
          </div>
        ))}
      </div>
    </div>
  )
}
