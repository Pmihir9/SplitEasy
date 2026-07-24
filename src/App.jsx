import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase, isDemoMode } from './lib/supabase'
import { useApp } from './context/AppContext'
import AuthPage from './pages/AuthPage'
import AppShell from './pages/AppShell'

export default function App() {
  const { state, dispatch, loadAll, seedDemo } = useApp()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (isDemoMode) {
      setChecking(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        dispatch({ type: 'SET_USER', payload: session.user })
        loadAll(session.user).then(() => setChecking(false))
      } else {
        setChecking(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        dispatch({ type: 'SET_USER', payload: session.user })
        loadAll(session.user)
      } else {
        dispatch({ type: 'RESET' })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  if (checking) {
    return (
      <div className="loader">
        <div className="spinner" />
      </div>
    )
  }

  const isAuthed = !!state.user || (isDemoMode && state.people.length > 0)

  return (
    <Routes>
      <Route path="/login" element={isAuthed ? <Navigate to="/" /> : <AuthPage />} />
      <Route path="/*" element={isAuthed ? <AppShell /> : <Navigate to="/login" />} />
    </Routes>
  )
}
