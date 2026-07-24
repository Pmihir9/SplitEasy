import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, isDemoMode } from '../lib/supabase'
import { useApp } from '../context/AppContext'

export default function AuthPage() {
  const [tab, setTab] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { dispatch, loadAll, seedDemo } = useApp()
  const navigate = useNavigate()

  async function handleLogin(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass })
    setLoading(false)
    if (error) { setError(error.message); return }
    dispatch({ type: 'SET_USER', payload: data.user })
    await loadAll(data.user)
    navigate('/')
  }

  async function handleSignup(e) {
    e.preventDefault()
    if (!name.trim()) { setError('Name is required'); return }
    setError(''); setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email, password: pass, options: { data: { name } }
    })
    setLoading(false)
    if (error) { setError(error.message); return }
    if (data.user) {
      await supabase.from('people').insert({ user_id: data.user.id, name, email })
      dispatch({ type: 'SET_USER', payload: data.user })
      await loadAll(data.user)
    }
    navigate('/')
  }

  function handleDemo() {
    const demoUser = { id: 'demo', email: 'demo@splitease.app', user_metadata: { name: 'You' } }
    dispatch({ type: 'SET_USER', payload: demoUser })
    seedDemo()
    navigate('/')
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">Split<span>Ease</span></div>
          <div className="auth-sub">Split expenses. Stay friends.</div>
        </div>
        <div className="auth-body">
          <div className="auth-tabs">
            <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setError('') }}>
              Sign in
            </button>
            <button className={`auth-tab ${tab === 'signup' ? 'active' : ''}`} onClick={() => { setTab('signup'); setError('') }}>
              Create account
            </button>
          </div>

          {tab === 'login' ? (
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" required />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-input" type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" required />
              </div>
              {error && <div className="form-error" style={{ marginBottom: '0.75rem' }}>{error}</div>}
              <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" required />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-input" type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="Min. 6 characters" minLength={6} required />
              </div>
              {error && <div className="form-error" style={{ marginBottom: '0.75rem' }}>{error}</div>}
              <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
                {loading ? 'Creating account…' : 'Create account'}
              </button>
            </form>
          )}

          <div className="auth-demo">
            <a href="#" onClick={e => { e.preventDefault(); handleDemo() }}>
              Try demo mode (no account needed) →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
