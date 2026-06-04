import { useEffect, useState } from 'react'
import { scout, tba, auth as authApi } from '../api/client'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import { Trash2, Plus, CheckCircle } from 'lucide-react'

const POSITIONS = [
  { alliance: 'red',  pos: 1 }, { alliance: 'red',  pos: 2 }, { alliance: 'red',  pos: 3 },
  { alliance: 'blue', pos: 1 }, { alliance: 'blue', pos: 2 }, { alliance: 'blue', pos: 3 },
]

export default function Assignments() {
  const { user } = useAuth()

  const [events, setEvents]         = useState([])
  const [eventKey, setEventKey]     = useState('')
  const [matches, setMatches]       = useState([])
  const [teams, setTeams]           = useState([])
  const [members, setMembers]       = useState([])
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading]       = useState(false)
  const [saved, setSaved]           = useState(false)

  // Quick-add form
  const [newForm, setNewForm] = useState({
    match_number: '', alliance: 'red', robot_position: 1,
    assigned_to_user_id: '', frc_team_number: '',
  })

  useEffect(() => {
    tba.events(2026).then(r => setEvents(r.data ?? [])).catch(() => {})
    authApi.members().then(r => setMembers(r.data ?? [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (!eventKey) { setMatches([]); setTeams([]); return }
    Promise.all([
      tba.eventMatches(eventKey).catch(() => ({ data: [] })),
      tba.eventTeams(eventKey).catch(() => ({ data: [] })),
    ]).then(([m, t]) => {
      const quals = (m.data ?? []).filter(mx => mx.comp_level === 'qm').sort((a, b) => a.match_number - b.match_number)
      setMatches(quals)
      setTeams((t.data ?? []).sort((a, b) => a.team_number - b.team_number))
    })
    loadAssignments()
  }, [eventKey])

  async function loadAssignments() {
    const r = await scout.assignments(eventKey || null)
    setAssignments(r.data ?? [])
  }

  async function addAssignment(e) {
    e.preventDefault()
    if (!eventKey || !newForm.match_number || !newForm.assigned_to_user_id) return
    try {
      await scout.createAssignment({
        event_key: eventKey,
        match_number: parseInt(newForm.match_number),
        alliance: newForm.alliance,
        robot_position: parseInt(newForm.robot_position),
        assigned_to_user_id: parseInt(newForm.assigned_to_user_id),
        frc_team_number: newForm.frc_team_number ? parseInt(newForm.frc_team_number) : null,
      })
      setSaved(true); setTimeout(() => setSaved(false), 1500)
      await loadAssignments()
      setNewForm(p => ({ ...p, match_number: '', frc_team_number: '' }))
    } catch {}
  }

  async function fillFromSchedule() {
    // Auto-assign from TBA match schedule in round-robin across members
    if (!matches.length || !members.length) return
    setLoading(true)
    const bulk = []
    matches.forEach((m, mi) => {
      POSITIONS.forEach((p, pi) => {
        const memberIdx = (mi * 6 + pi) % members.length
        const member = members[memberIdx]
        const tbaTeams = m.alliances?.[p.alliance]?.team_keys ?? []
        const frcNum = tbaTeams[p.pos - 1]?.replace('frc', '')
        bulk.push({
          event_key: eventKey,
          match_number: m.match_number,
          alliance: p.alliance,
          robot_position: p.pos,
          assigned_to_user_id: member.user_id,
          frc_team_number: frcNum ? parseInt(frcNum) : null,
        })
      })
    })
    try {
      await scout.bulkAssignments(bulk)
      await loadAssignments()
      setSaved(true); setTimeout(() => setSaved(false), 2000)
    } finally { setLoading(false) }
  }

  async function deleteAssignment(id) {
    await scout.deleteAssignment(id)
    setAssignments(a => a.filter(x => x.id !== id))
  }

  // Group assignments by match
  const byMatch = assignments.reduce((acc, a) => {
    const key = `${a.event_key}_${a.match_number}`
    acc[key] = acc[key] ?? []
    acc[key].push(a)
    return acc
  }, {})

  return (
    <div className="max-w-5xl">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-white">Scout Assignments</h1>
        <p className="text-sm text-slate-500 mt-0.5">Admin only · assign scouts to match positions</p>
      </div>

      {/* Event picker */}
      <div className="card mb-4">
        <label className="text-xs text-slate-500 mb-1 block">Event</label>
        <select className="input text-sm" value={eventKey} onChange={e => setEventKey(e.target.value)}>
          <option value="">— Select event —</option>
          {events.map(ev => <option key={ev.key} value={ev.key}>{ev.name} · {ev.key}</option>)}
        </select>
      </div>

      {eventKey && (
        <>
          {/* Auto-schedule button */}
          <div className="card mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Auto-Schedule All Matches</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Distributes {matches.length} qual matches across {members.length} scouts evenly
              </p>
            </div>
            <div className="flex items-center gap-2">
              {saved && <span className="text-xs text-green-400 flex items-center gap-1"><CheckCircle size={12} /> Saved!</span>}
              <button onClick={fillFromSchedule} disabled={loading || !matches.length}
                className="btn-primary flex items-center gap-2 text-sm">
                {loading ? 'Scheduling...' : 'Auto-Assign'}
              </button>
            </div>
          </div>

          {/* Manual add form */}
          <form onSubmit={addAssignment} className="card mb-4">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Add Single Assignment</h2>
            <div className="grid grid-cols-5 gap-2 items-end">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Match</label>
                <select className="input text-sm" value={newForm.match_number}
                  onChange={e => setNewForm(p => ({ ...p, match_number: e.target.value }))}>
                  <option value="">QM #</option>
                  {matches.map(m => <option key={m.key} value={m.match_number}>QM {m.match_number}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Alliance</label>
                <select className="input text-sm" value={newForm.alliance}
                  onChange={e => setNewForm(p => ({ ...p, alliance: e.target.value }))}>
                  <option value="red">Red</option>
                  <option value="blue">Blue</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Position</label>
                <select className="input text-sm" value={newForm.robot_position}
                  onChange={e => setNewForm(p => ({ ...p, robot_position: parseInt(e.target.value) }))}>
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Scout</label>
                <select className="input text-sm" value={newForm.assigned_to_user_id}
                  onChange={e => setNewForm(p => ({ ...p, assigned_to_user_id: e.target.value }))}>
                  <option value="">— Scout —</option>
                  {members.map(m => <option key={m.user_id} value={m.user_id}>{m.username}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Team # (optional)</label>
                <select className="input text-sm" value={newForm.frc_team_number}
                  onChange={e => setNewForm(p => ({ ...p, frc_team_number: e.target.value }))}>
                  <option value="">Auto from match</option>
                  {teams.map(t => <option key={t.key} value={t.team_number}>{t.team_number}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" className="btn-primary mt-3 flex items-center gap-2 text-sm">
              <Plus size={14} /> Add Assignment
            </button>
          </form>

          {/* Assignment list */}
          {Object.keys(byMatch).length === 0 ? (
            <div className="card text-slate-500 text-sm text-center py-8">
              No assignments yet. Use Auto-Assign or add manually above.
            </div>
          ) : (
            <div className="space-y-2">
              {Object.entries(byMatch)
                .sort(([a], [b]) => {
                  const [, an] = a.split('_'); const [, bn] = b.split('_')
                  return parseInt(an) - parseInt(bn)
                })
                .map(([key, row]) => {
                  const matchNum = key.split('_').pop()
                  return (
                    <div key={key} className="card">
                      <p className="text-xs font-semibold text-slate-400 mb-2">QM {matchNum}</p>
                      <div className="flex flex-wrap gap-2">
                        {row.sort((a, b) => {
                          const ao = a.alliance === 'red' ? 0 : 3
                          const bo = b.alliance === 'red' ? 0 : 3
                          return (ao + a.robot_position) - (bo + b.robot_position)
                        }).map(a => (
                          <div key={a.id}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border ${
                              a.alliance === 'red'
                                ? 'bg-red-950 border-red-800 text-red-300'
                                : 'bg-blue-950 border-blue-800 text-blue-300'
                            }`}>
                            <span className="font-medium">
                              {a.alliance.toUpperCase()}{a.robot_position}
                            </span>
                            <span className="text-slate-400">→ {a.assigned_to_username}</span>
                            {a.frc_team_number && (
                              <span className="text-slate-500">#{a.frc_team_number}</span>
                            )}
                            <button onClick={() => deleteAssignment(a.id)}
                              className="text-slate-600 hover:text-red-400 transition-colors ml-1">
                              <Trash2 size={11} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
