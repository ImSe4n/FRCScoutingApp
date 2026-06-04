import { useState, useEffect } from 'react'
import { analytics } from '../api/client'
import LoadingSpinner from '../components/LoadingSpinner'
import { ListOrdered, Download, RefreshCw } from 'lucide-react'

function Slider({ label, value, onChange, color = 'bg-blue-600' }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-400 mb-1">
        <span>{label}</span>
        <span className="font-mono text-white">{value.toFixed(1)}</span>
      </div>
      <input type="range" min={0} max={5} step={0.1} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full accent-blue-500 h-1.5 rounded" />
    </div>
  )
}

export default function PickList() {
  const [weights, setWeights] = useState({
    w_auto: 1.0, w_tele: 1.0, w_climb: 1.0, w_defence: 0.5, w_driver: 0.5,
  })
  const [eventKey, setEventKey] = useState('')
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState(false)

  function setW(key) { return v => setWeights(prev => ({ ...prev, [key]: v })) }

  async function generate() {
    setLoading(true)
    try {
      const r = await analytics.picklist(weights, eventKey || null)
      setList(r.data ?? [])
      setGenerated(true)
    } catch {
      setList([])
    } finally {
      setLoading(false)
    }
  }

  function exportCSV() {
    const header = 'Rank,Team,Weighted Score,Avg Score,Matches,TBA OPR'
    const rows = list.map(t =>
      `${t.rank},${t.team_number},${t.weighted_score},${t.avg_score?.toFixed(2)},${t.match_count},${t.tba_opr?.toFixed(2) ?? '—'}`
    )
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'picklist_2026.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Pick List Generator</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Weighted ranking blending scout data with TBA OPR — REBUILT 2026
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-5">
        {/* Weight sliders */}
        <div className="col-span-2 card">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Scoring Weights</h2>
          <div className="space-y-4">
            <Slider label="Autonomous" value={weights.w_auto} onChange={setW('w_auto')} />
            <Slider label="Teleop" value={weights.w_tele} onChange={setW('w_tele')} />
            <Slider label="Climb / Endgame" value={weights.w_climb} onChange={setW('w_climb')} />
            <Slider label="Defence Capability" value={weights.w_defence} onChange={setW('w_defence')} />
            <Slider label="Driver Skill" value={weights.w_driver} onChange={setW('w_driver')} />
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3">
          <div className="card">
            <label className="text-xs text-slate-500 mb-1 block">Event Key (optional)</label>
            <input className="input text-sm" placeholder="e.g. 2026onto"
              value={eventKey} onChange={e => setEventKey(e.target.value)} />
            <p className="text-xs text-slate-600 mt-1">Adds TBA OPR to blend</p>
          </div>
          <div className="card space-y-2 text-xs text-slate-500">
            <p><span className="text-slate-300 font-medium">Formula</span></p>
            <p>Scout data × 0.7 + TBA OPR × 0.3</p>
            <p>Sorted by weighted score (merge sort)</p>
          </div>
        </div>
      </div>

      <button onClick={generate} disabled={loading}
        className="btn-primary w-full py-3 text-base font-semibold flex items-center justify-center gap-2 mb-5">
        <ListOrdered size={18} />
        {loading ? 'Generating...' : 'Generate Pick List'}
      </button>

      {loading && <LoadingSpinner text="Generating pick list..." />}

      {generated && !loading && (
        <>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-slate-400">{list.length} teams ranked</p>
            {list.length > 0 && (
              <button onClick={exportCSV} className="btn-ghost flex items-center gap-2 text-xs">
                <Download size={13} /> Export CSV
              </button>
            )}
          </div>

          {list.length === 0 ? (
            <div className="card text-center py-8 text-slate-500">
              No scout data found. Add observations on the Scout Entry page first.
            </div>
          ) : (
            <div className="card overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-slate-500 border-b border-slate-800">
                    <th className="text-left pb-2 pr-3">Rank</th>
                    <th className="text-left pb-2 pr-3">Team</th>
                    <th className="text-right pb-2 pr-3">Weighted Score</th>
                    <th className="text-right pb-2 pr-3">Avg Score</th>
                    <th className="text-right pb-2 pr-3">TBA OPR</th>
                    <th className="text-right pb-2 pr-3">Avg Climb</th>
                    <th className="text-right pb-2">Matches</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map(t => (
                    <tr key={t.team_number}
                      className="border-b border-slate-800/50 hover:bg-slate-800/30">
                      <td className="py-2 pr-3">
                        <span className={`font-bold ${
                          t.rank === 1 ? 'text-yellow-400' :
                          t.rank === 2 ? 'text-slate-300' :
                          t.rank === 3 ? 'text-orange-400' : 'text-slate-500'
                        }`}>
                          #{t.rank}
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-blue-400 font-bold">{t.team_number}</td>
                      <td className="py-2 pr-3 text-right text-white font-medium">
                        {t.weighted_score?.toFixed(2)}
                      </td>
                      <td className="py-2 pr-3 text-right text-slate-300">
                        {t.avg_score?.toFixed(2)}
                      </td>
                      <td className="py-2 pr-3 text-right text-yellow-400">
                        {t.tba_opr?.toFixed(2) ?? '—'}
                      </td>
                      <td className="py-2 pr-3 text-right text-slate-400">
                        L{Math.round(t.avg_climb_level ?? 0)}
                      </td>
                      <td className="py-2 text-right text-slate-500">{t.match_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
