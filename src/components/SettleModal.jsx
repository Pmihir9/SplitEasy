import { useState, useEffect } from 'react'
import { supabase, isDemoMode, fmt, todayStr } from '../lib/supabase'
import { useApp } from '../context/AppContext'

// ── SETTLE MODAL ──────────────────────────────────────────────────────────────
export function SettleModal({ onClose, showToast, defaults }) {
  const { state, dispatch, computeBalances, pName } = useApp()
  const bal = computeBalances()
  const [from, setFrom] = useState(defaults?.net < 0 ? 'you' : (defaults?.personId || 'you'))
  const [to, setTo]     = useState(defaults?.net < 0 ? (defaults?.personId || '') : 'you')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')

  const suggest = (() => {
    if (from === to) return null
    const fb = bal[from] || 0, tb = bal[to] || 0
    if (fb < -0.01 && tb > 0.01) {
      const a = Math.min(-fb, tb).toFixed(2)
      return { text: `Suggested: ${pName(from)} pays ${pName(to)} $${a}`, amount: a }
    }
    return null
  })()

  useEffect(() => {
    if (suggest && !amount) setAmount(suggest.amount)
  }, [from, to])

  async function save() {
    const amt = parseFloat(amount)
    if (from === to) { showToast('⚠ From and To must differ'); return }
    if (!amt || amt <= 0) { showToast('⚠ Enter a valid amount'); return }

    const pay = { id: 'pay' + Date.now(), from, to, amount: amt, note, date: todayStr() }

    if (!isDemoMode && supabase && state.user?.id !== 'demo') {
      const uid = state.user.id
      const { error } = await supabase.from('payments').insert({
        from_id: from === 'you' ? uid : from,
        to_id: to === 'you' ? uid : to,
        amount: amt, note, user_id: uid,
      })
      if (error) { showToast('Error: ' + error.message); return }
    }

    dispatch({ type: 'ADD_PAYMENT', payload: pay })
    onClose()
    showToast(`✓ Payment of ${fmt(amt)} recorded!`)
  }

  const opts = state.people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <div className="modal-title">Settle up</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">From</label>
            <select className="form-select" value={from} onChange={e => { setFrom(e.target.value); setAmount('') }}>{opts}</select>
          </div>
          <div className="form-group">
            <label className="form-label">To</label>
            <select className="form-select" value={to} onChange={e => { setTo(e.target.value); setAmount('') }}>{opts}</select>
          </div>
          <div className="form-group">
            <label className="form-label">Amount ($)</label>
            <input className="form-input" type="number" min="0" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
          </div>
          <div className="form-group">
            <label className="form-label">Note (optional)</label>
            <input className="form-input" value={note} onChange={e => setNote(e.target.value)} placeholder="Venmo, cash, bank transfer…" />
          </div>
          {suggest && <div className="suggest-box">{suggest.text}</div>}
        </div>
        <div className="modal-foot">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={save}>Record payment</button>
        </div>
      </div>
    </div>
  )
}

// ── GROUP MODAL ───────────────────────────────────────────────────────────────
export function GroupModal({ onClose, showToast }) {
  const { state, dispatch } = useApp()
  const [name, setName] = useState('')
  const [type, setType] = useState('🏠 Home')
  const [members, setMembers] = useState(Object.fromEntries(state.people.map(p => [p.id, true])))

  function toggleMember(id) {
    if (id === 'you') return
    setMembers(prev => ({ ...prev, [id]: !prev[id] }))
  }

  async function save() {
    if (!name.trim()) { showToast('⚠ Enter a group name'); return }
    const memberIds = state.people.filter(p => members[p.id]).map(p => p.id)
    const emoji = type.split(' ')[0]

    if (!isDemoMode && supabase && state.user?.id !== 'demo') {
      const uid = state.user.id
      const { data, error } = await supabase.from('groups').insert({ name, type: emoji, user_id: uid }).select().single()
      if (error) { showToast('Error: ' + error.message); return }
      const mems = memberIds.filter(m => m !== 'you').map(m => ({ group_id: data.id, person_id: m }))
      if (mems.length) await supabase.from('group_members').insert(mems)
      dispatch({ type: 'ADD_GROUP', payload: { id: data.id, name, type: emoji, members: memberIds } })
    } else {
      dispatch({ type: 'ADD_GROUP', payload: { id: 'g' + Date.now(), name, type: emoji, members: memberIds } })
    }

    onClose()
    showToast('✓ Group created!')
  }

  const TYPES = ['🏠 Home','✈ Trip','💼 Work','🎉 Event','📦 Other']

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <div className="modal-title">Create a group</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Name</label>
            <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Apartment, Paris trip…" />
          </div>
          <div className="form-group">
            <label className="form-label">Type</label>
            <select className="form-select" value={type} onChange={e => setType(e.target.value)}>
              {TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Members</label>
            {state.people.map(p => (
              <div className="pcheck" key={p.id}>
                <input type="checkbox" checked={!!members[p.id]} onChange={() => toggleMember(p.id)} disabled={p.id === 'you'} />
                <span className="pcheck-name">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={save}>Create group</button>
        </div>
      </div>
    </div>
  )
}

// ── FRIEND MODAL ──────────────────────────────────────────────────────────────
export function FriendModal({ onClose, showToast }) {
  const { state, dispatch } = useApp()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  async function save() {
    if (!name.trim()) { showToast('⚠ Enter a name'); return }

    if (!isDemoMode && supabase && state.user?.id !== 'demo') {
      const uid = state.user.id
      const { data, error } = await supabase.from('people').insert({ name, email, user_id: uid }).select().single()
      if (error) { showToast('Error: ' + error.message); return }
      await supabase.from('friendships').insert({ user_id: uid, friend_id: data.id })
      dispatch({ type: 'ADD_PERSON', payload: { id: data.id, name, email } })
    } else {
      dispatch({ type: 'ADD_PERSON', payload: { id: 'p' + Date.now(), name, email } })
    }

    onClose()
    showToast(`✓ ${name} added!`)
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <div className="modal-title">Add a friend</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Name</label>
            <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Friend's name" />
          </div>
          <div className="form-group">
            <label className="form-label">Email (optional)</label>
            <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="friend@email.com" />
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={save}>Add friend</button>
        </div>
      </div>
    </div>
  )
}

// ── TOAST ─────────────────────────────────────────────────────────────────────
export function Toast({ message }) {
  return <div className="toast">{message}</div>
}

export default SettleModal
