import { createContext, useContext, useReducer, useCallback } from 'react'
import { supabase, isDemoMode, todayStr } from '../lib/supabase'

const AppContext = createContext(null)

const initialState = {
  user: null,
  people: [],
  groups: [],
  expenses: [],
  payments: [],
  loading: false,
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_USER': return { ...state, user: action.payload }
    case 'SET_DATA': return { ...state, ...action.payload }
    case 'SET_LOADING': return { ...state, loading: action.payload }
    case 'ADD_EXPENSE':
      return { ...state, expenses: [action.payload, ...state.expenses] }
    case 'ADD_PAYMENT':
      return { ...state, payments: [action.payload, ...state.payments] }
    case 'ADD_GROUP':
      return { ...state, groups: [...state.groups, action.payload] }
    case 'ADD_PERSON':
      return { ...state, people: [...state.people, action.payload] }
    case 'RESET': return { ...initialState }
    default: return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const loadAll = useCallback(async (user) => {
    if (isDemoMode || !supabase) return
    dispatch({ type: 'SET_LOADING', payload: true })
    const uid = user.id

    const [{ data: ppl }, { data: grps }, { data: exps }, { data: pays }] = await Promise.all([
      supabase.from('people').select('*').eq('user_id', uid),
      supabase.from('groups').select('*, group_members(person_id)').eq('user_id', uid),
      supabase.from('expenses').select('*, expense_splits(person_id, amount)')
        .eq('user_id', uid).order('created_at', { ascending: false }),
      supabase.from('payments').select('*')
        .or(`from_id.eq.${uid},to_id.eq.${uid}`)
        .order('created_at', { ascending: false }),
    ])

    const me = { id: 'you', name: user.user_metadata?.name || 'You', email: user.email }

    const people = [me, ...(ppl || []).map(p => ({ ...p }))]

    const groups = (grps || []).map(g => ({
      ...g,
      members: ['you', ...(g.group_members || []).map(m => m.person_id)],
    }))

    const expenses = (exps || []).map(e => {
      const split = {}
      ;(e.expense_splits || []).forEach(s => {
        split[s.person_id === uid ? 'you' : s.person_id] = s.amount
      })
      return {
        id: e.id,
        desc: e.description,
        amount: e.amount,
        cat: e.category,
        paidBy: e.paid_by === uid ? 'you' : e.paid_by,
        group: e.group_id || '',
        split,
        date: new Date(e.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      }
    })

    const payments = (pays || []).map(p => ({
      id: p.id,
      from: p.from_id === uid ? 'you' : p.from_id,
      to: p.to_id === uid ? 'you' : p.to_id,
      amount: p.amount,
      note: p.note || '',
      date: new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    }))

    dispatch({ type: 'SET_DATA', payload: { people, groups, expenses, payments, loading: false } })
  }, [])

  const seedDemo = useCallback(() => {
    const people = [
      { id: 'you', name: 'You', email: 'demo@splitease.app' },
      { id: 'p1', name: 'Alex Kim', email: 'alex@ex.com' },
      { id: 'p2', name: 'Sara Lee', email: 'sara@ex.com' },
      { id: 'p3', name: 'Jordan Park', email: 'jordan@ex.com' },
    ]
    const groups = [
      { id: 'g1', name: 'Apartment', type: '🏠', members: ['you', 'p1', 'p2'] },
      { id: 'g2', name: 'NYC Trip', type: '✈', members: ['you', 'p2', 'p3'] },
    ]
    const mkExp = (desc, amount, cat, paidBy, group, split) => ({
      id: 'e' + Math.random().toString(36).slice(2),
      desc, amount, cat, paidBy, group, split, date: todayStr(),
    })
    const expenses = [
      mkExp('Groceries', 84.50, '🛒 Groceries', 'you', 'g1', { you: 28.17, p1: 28.17, p2: 28.16 }),
      mkExp('Rent (April)', 3000, '🏠 Housing', 'p1', 'g1', { you: 1000, p1: 1000, p2: 1000 }),
      mkExp('Hotel', 240, '✈ Travel', 'you', 'g2', { you: 80, p2: 80, p3: 80 }),
      mkExp('Dinner out', 96, '🍽 Food', 'p2', '', { you: 32, p2: 32, p3: 32 }),
      mkExp('Taxi', 45, '🚗 Transport', 'p3', 'g2', { you: 15, p2: 15, p3: 15 }),
    ]
    dispatch({ type: 'SET_DATA', payload: { people, groups, expenses, payments: [] } })
  }, [])

  const computeBalances = useCallback(() => {
    const bal = {}
    for (const p of state.people) bal[p.id] = 0
    for (const e of state.expenses) {
      for (const [pid, share] of Object.entries(e.split || {})) {
        if (pid === e.paidBy) bal[pid] = (bal[pid] || 0) + (e.amount - share)
        else bal[pid] = (bal[pid] || 0) - share
      }
    }
    for (const p of state.payments) {
      bal[p.from] = (bal[p.from] || 0) + p.amount
      bal[p.to] = (bal[p.to] || 0) - p.amount
    }
    return bal
  }, [state.expenses, state.payments, state.people])

  const pName = useCallback((id) => {
    if (id === 'you') return 'You'
    return state.people.find(p => p.id === id)?.name || id
  }, [state.people])

  const gName = useCallback((id) => {
    return state.groups.find(g => g.id === id)?.name || ''
  }, [state.groups])

  return (
    <AppContext.Provider value={{ state, dispatch, loadAll, seedDemo, computeBalances, pName, gName }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
