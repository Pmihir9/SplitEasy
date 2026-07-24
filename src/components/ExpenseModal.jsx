import { useState } from 'react'
import { supabase, isDemoMode, fmt, todayStr } from '../lib/supabase'
import { useApp } from '../context/AppContext'

const CATS = ['🍽 Food','🏠 Housing','🚗 Transport','🛒 Groceries','🎉 Fun','✈ Travel','⚡ Utilities','📦 Other']

export default function ExpenseModal({ onClose, showToast }) {
  const { state, dispatch } = useApp()
  const [desc, setDesc] = useState('')
  const [amount, setAmount] = useState('')
  const [cat, setCat] = useState(CATS[0])
  const [paidBy, setPaidBy] = useState('you')
  const [group, setGroup] = useState('')
  const [mode, setMode] = useState('equal')
  const [checked, setChecked] = useState(() => Object.fromEntries(state.people.map(p => [p.id, true])))
  const [customAmts, setCustomAmts] = useState({})

  const amt = parseFloat(amount) || 0
  const checkedPeople = state.people.filter(p => checked[p.id])
  const equalShare = checkedPeople.length ? (amt / checkedPeople.length).toFixed(2) : '0.00'

  function toggleCheck(id) {
    if (id === 'you') return
    setChecked(prev => ({ ...prev, [id]: !prev[id] }))
  }

  async function save() {
    if (!desc.trim() || amt <= 0) { showToast('⚠ Fill in description and amount'); return }
    if (!checkedPeople.length) { showToast('⚠ Select at least one person'); return }

    const split = {}
    if (mode === 'equal') {
      checkedPeople.forEach(p => { split[p.id] = parseFloat(equalShare) })
    } else {
      checkedPeople.forEach(p => {
        const v = parseFloat(customAmts[p.id]) || (amt / checkedPeople.length)
        split[p.id] = mode === 'percent' ? parseFloat((amt * v / 100).toFixed(2)) : parseFloat(v.toFixed(2))
      })
    }

    if (!isDemoMode && supabase && state.user?.id !== 'demo') {
      const uid = state.user.id
      const { data, error } = await supabase.from('expenses').insert({
        description: desc, amount: amt, category: cat,
        paid_by: paidBy === 'you' ? uid : paidBy,
        group_id: group || null, user_id: uid,
      }).select().single()
      if (error) { showToast('Error: ' + error.message); return }
      const splits = Object.entries(split).map(([pid, a]) => ({
        expense_id: data.id,
        person_id: pid === 'you' ? uid : pid,
        amount: a,
      }))
      await supabase.from('expense_splits').insert(splits)
      dispatch({ type: 'ADD_EXPENSE', payload: { id: data.id, desc, amount: amt, cat, paidBy, group, split, date: todayStr() } })
    } else {
      dispatch({ type: 'ADD_EXPENSE', payload: { id: 'e' + Date.now(), desc, amount: amt, cat, paidBy, group, split, date: todayStr() } })
    }

    onClose()
    showToast('✓ Expense added!')
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <div className="modal-title">Add an expense</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Description</label>
            <input className="form-input" value={desc} onChange={e => setDesc(e.target.value)} placeholder="What was this for?" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="form-group">
              <label className="form-label">Amount ($)</label>
              <input className="form-input" type="number" min="0" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={cat} onChange={e => setCat(e.target.value)}>
                {CATS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="form-group">
              <label className="form-label">Paid by</label>
              <select className="form-select" value={paidBy} onChange={e => setPaidBy(e.target.value)}>
                {state.people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Group (optional)</label>
              <select className="form-select" value={group} onChange={e => setGroup(e.target.value)}>
                <option value="">None</option>
                {state.groups.map(g => <option key={g.id} value={g.id}>{g.type.split(' ')[0]} {g.name}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Split method</label>
            <div className="split-tabs">
              {['equal','percent','exact'].map(m => (
                <button key={m} className={`split-tab ${mode === m ? 'active' : ''}`} onClick={() => setMode(m)}>
                  {m === 'equal' ? 'Equal' : m === 'percent' ? 'Percent' : 'Exact'}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Split between</label>
            {state.people.map(p => (
              <div className="pcheck" key={p.id}>
                <input type="checkbox" checked={!!checked[p.id]} onChange={() => toggleCheck(p.id)} disabled={p.id === 'you'} />
                <span className="pcheck-name">{p.name}</span>
                {mode === 'equal' ? (
                  <span className="pcheck-amt">{checked[p.id] && amt > 0 ? '$' + equalShare : '—'}</span>
                ) : (
                  checked[p.id] && (
                    <input
                      type="number" min="0" step={mode === 'percent' ? '0.1' : '0.01'}
                      placeholder={mode === 'percent' ? (100 / checkedPeople.length).toFixed(1) : equalShare}
                      value={customAmts[p.id] || ''}
                      onChange={e => setCustomAmts(prev => ({ ...prev, [p.id]: e.target.value }))}
                    />
                  )
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={save}>Add expense</button>
        </div>
      </div>
    </div>
  )
}
