import { useState } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { supabase, isDemoMode, initials, aColor } from '../lib/supabase'
import { useApp } from '../context/AppContext'
import Dashboard from './Dashboard'
import Groups from './Groups'
import Friends from './Friends'
import Activity from './Activity'
import ExpenseModal from '../components/ExpenseModal'
import SettleModal, { GroupModal, FriendModal, Toast } from '../components/SettleModal'

export default function AppShell() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [modal, setModal] = useState(null)
  const [toast, setToast] = useState(null)
  const [settleDefaults, setSettleDefaults] = useState(null)

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2800)
  }

  async function signOut() {
    if (!isDemoMode && supabase) await supabase.auth.signOut()
    dispatch({ type: 'RESET' })
    navigate('/login')
  }

  const userName = state.user?.user_metadata?.name || state.user?.email?.split('@')[0] || 'You'

  const tabs = [
    { label: 'Dashboard', path: '/' },
    { label: 'Groups',    path: '/groups' },
    { label: 'Friends',   path: '/friends' },
    { label: 'Activity',  path: '/activity' },
  ]

  function openSettle(defaults) {
    setSettleDefaults(defaults || null)
    setModal('settle')
  }

  return (
    <div className="app-shell">
      <nav className="topnav">
        <div className="nav-logo">Split<span>Ease</span></div>
        <div className="nav-tabs">
          {tabs.map(t => (
            <button
              key={t.path}
              className={`nav-tab ${location.pathname === t.path ? 'active' : ''}`}
              onClick={() => navigate(t.path)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="nav-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => openSettle()}>Settle up</button>
          <button className="btn btn-primary btn-sm" onClick={() => setModal('expense')}>+ Add expense</button>
          <div
            className="avatar"
            style={{ background: aColor(userName), cursor: 'pointer' }}
            title={`${userName} — click to sign out`}
            onClick={signOut}
          >
            {initials(userName)}
          </div>
        </div>
      </nav>

      <div className="main-content fade-up">
        <Routes>
          <Route path="/"         element={<Dashboard openSettle={openSettle} showToast={showToast} />} />
          <Route path="/groups"   element={<Groups openGroup={() => setModal('group')} showToast={showToast} />} />
          <Route path="/friends"  element={<Friends openFriend={() => setModal('friend')} showToast={showToast} />} />
          <Route path="/activity" element={<Activity />} />
        </Routes>
      </div>

      {modal === 'expense' && <ExpenseModal onClose={() => setModal(null)} showToast={showToast} />}
      {modal === 'settle'  && <SettleModal  onClose={() => setModal(null)} showToast={showToast} defaults={settleDefaults} />}
      {modal === 'group'   && <GroupModal   onClose={() => setModal(null)} showToast={showToast} />}
      {modal === 'friend'  && <FriendModal  onClose={() => setModal(null)} showToast={showToast} />}

      {toast && <Toast message={toast} />}
    </div>
  )
}
