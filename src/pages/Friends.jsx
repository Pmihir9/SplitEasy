import { useApp } from '../context/AppContext'
import { fmt, aColor, initials } from '../lib/supabase'

export default function Friends({ openFriend }) {
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
              <div className="avatar" style={{ background: aColor(p.name), width: 38, height: 38, fontSize: 13 }}>{initials(p.name)}</div>
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
