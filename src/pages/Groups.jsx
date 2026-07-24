import { useApp } from '../context/AppContext'
import { fmt, aColor, initials } from '../lib/supabase'

export function Groups({ openGroup }) {
  const { state } = useApp()
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button className="btn btn-primary btn-sm" onClick={openGroup}>+ New group</button>
      </div>
      {!state.groups.length ? (
        <div className="empty"><div className="empty-icon">◈</div>No groups yet</div>
      ) : (
        <div className="groups-grid">
          {state.groups.map(g => {
            const exps = state.expenses.filter(e => e.group === g.id)
            const total = exps.reduce((s, e) => s + e.amount, 0)
            const members = (g.members || []).map(m => state.people.find(p => p.id === m)).filter(Boolean)
            return (
              <div className="group-card" key={g.id}>
                <span className="group-emoji">{g.type.split(' ')[0]}</span>
                <div className="group-name">{g.name}</div>
                <div className="group-meta">{members.length} members · {exps.length} expense{exps.length !== 1 ? 's' : ''}</div>
                <div className="group-total">{fmt(total)}</div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function Friends({ openFriend }) {
  const { state, computeBalances } = useApp()
  const bal = computeBalances()
  const friends = state.people.filter(p => p.id !== 'you')

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button className="btn btn-primary btn-sm" onClick={openFriend}>+ Add friend</button>
      </div>
      <div className="card">
        {!friends.length ? (
          <div className="empty"><div className="empty-icon">🤝</div>No friends yet</div>
        ) : friends.map(p => {
          const myNet = -(bal[p.id] || 0)
          let chip = <span className="chip chip-neutral">settled</span>
          if (myNet > 0.01) chip = <span className="chip chip-green">owed {fmt(myNet)}</span>
          else if (myNet < -0.01) chip = <span className="chip chip-red">owes {fmt(-myNet)}</span>
          const expCount = state.expenses.filter(e => e.split && e.split[p.id] !== undefined).length
          return (
            <div className="row-item" key={p.id}>
              <div className="avatar" style={{ background: aColor(p.name), width: 38, height: 38, fontSize: 13 }}>
                {initials(p.name)}
              </div>
              <div className="row-info">
                <div className="row-title">{p.name}</div>
                <div className="row-sub">{p.email || ''}{expCount ? ` · ${expCount} expenses` : ''}</div>
              </div>
              {chip}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function Activity() {
  const { state, pName } = useApp()
  const acts = [
    ...state.expenses.map(e => ({
      id: 'ae' + e.id, text: `${pName(e.paidBy)} added "${e.desc}" — ${fmt(e.amount)}`,
      date: e.date, color: '#1D9E75',
    })),
    ...state.payments.map(p => ({
      id: 'ap' + p.id, text: `${pName(p.from)} paid ${pName(p.to)} ${fmt(p.amount)}${p.note ? ' (' + p.note + ')' : ''}`,
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

export default Groups
