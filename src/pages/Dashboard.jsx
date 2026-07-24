import { useApp } from '../context/AppContext'
import { fmt, aColor, initials } from '../lib/supabase'

export default function Dashboard({ openSettle }) {
  const { state, computeBalances, pName, gName } = useApp()
  const bal = computeBalances()
  const myBal = bal['you'] || 0
  const owe = Math.max(0, -myBal)
  const owed = Math.max(0, myBal)

  const recent = state.expenses.slice(0, 6)
  const friends = state.people.filter(p => p.id !== 'you')

  return (
    <div>
      <div className="metric-grid">
        <div className="metric-card">
          <div className="metric-label">Net balance</div>
          <div className={`metric-value ${myBal > 0 ? 'pos' : myBal < 0 ? 'neg' : ''}`}>
            {myBal >= 0 ? '+' : '-'}{fmt(myBal)}
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">You owe</div>
          <div className="metric-value neg">{fmt(owe)}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">You're owed</div>
          <div className="metric-value pos">{fmt(owed)}</div>
        </div>
      </div>

      <div className="two-col">
        <div>
          <div className="section-label">Recent expenses</div>
          <div className="card">
            {!recent.length ? (
              <div className="empty"><div className="empty-icon">🧾</div>No expenses yet</div>
            ) : recent.map(e => {
              const myShare = (e.split && e.split['you']) || 0
              const isPayer = e.paidBy === 'you'
              let note = 'settled', cls = 'chip-neutral'
              if (isPayer && myShare < e.amount) { note = `lent ${fmt(e.amount - myShare)}`; cls = 'chip-green' }
              else if (!isPayer && myShare > 0) { note = `owe ${fmt(myShare)}`; cls = 'chip-red' }
              return (
                <div className="row-item" key={e.id}>
                  <div className="row-icon" style={{ background: aColor(e.cat) + '22' }}>
                    {e.cat.split(' ')[0]}
                  </div>
                  <div className="row-info">
                    <div className="row-title">{e.desc}</div>
                    <div className="row-sub">{e.date}{e.group ? ' · ' + gName(e.group) : ''} · by {pName(e.paidBy)}</div>
                  </div>
                  <div className="row-right">
                    <div className="row-amount">{fmt(e.amount)}</div>
                    <span className={`chip ${cls}`} style={{ marginTop: 3 }}>{note}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div>
          <div className="section-label">Balances</div>
          <div className="card">
            {!friends.length ? (
              <div className="empty"><div className="empty-icon">👥</div>Add friends to see balances</div>
            ) : friends.map(p => {
              const myNet = -(bal[p.id] || 0)
              let chip = <span className="chip chip-neutral">✓ settled</span>
              if (myNet > 0.01) chip = <span className="chip chip-green">owed {fmt(myNet)}</span>
              else if (myNet < -0.01) chip = <span className="chip chip-red">owe {fmt(-myNet)}</span>
              return (
                <div className="row-item" key={p.id}>
                  <div className="avatar" style={{ background: aColor(p.name), width: 36, height: 36, fontSize: 12 }}>
                    {initials(p.name)}
                  </div>
                  <div className="row-info">
                    <div className="row-title">{p.name}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {chip}
                    {Math.abs(myNet) > 0.01 && (
                      <button className="btn btn-sm" onClick={() => openSettle({ personId: p.id, net: myNet })}>
                        Settle
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
