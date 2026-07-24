import { useApp } from '../context/AppContext'
import { fmt } from '../lib/supabase'

export default function Activity() {
  const { state, pName } = useApp()
  const acts = [
    ...state.expenses.map(e => ({
      id: 'ae' + e.id,
      text: `${pName(e.paidBy)} added "${e.desc}" — ${fmt(e.amount)}`,
      date: e.date, color: '#1D9E75',
    })),
    ...state.payments.map(p => ({
      id: 'ap' + p.id,
      text: `${pName(p.from)} paid ${pName(p.to)} ${fmt(p.amount)}${p.note ? ' (' + p.note + ')' : ''}`,
      date: p.date, color: '#378ADD',
    })),
  ]
  return (
    <div>
      <div className="section-label">All activity</div>
      <div className="card">
        {!acts.length ? (
          <div className="empty"><div className="empty-icon">📋</div>No activity yet</div>
        ) : acts.slice(0, 40).map(a => (
          <div className="act-row" key={a.id}>
            <div className="act-dot" style={{ background: a.color }} />
            <div>
              <div style={{ fontSize: 13, lineHeight: 1.4 }}>{a.text}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{a.date}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
