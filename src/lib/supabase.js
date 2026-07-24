import { createClient } from '@supabase/supabase-js'

// 🔑 Replace these with your Supabase project values
// Found at: supabase.com → your project → Settings → API
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const isDemoMode = !SUPABASE_URL || SUPABASE_URL === ''

export const supabase = isDemoMode
  ? null
  : createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Utility helpers
export const aColor = (name = '?') => {
  const palette = ['#1D9E75','#378ADD','#D85A30','#D4537E','#BA7517','#7F77DD','#639922','#5B8DB8']
  let h = 0
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % palette.length
  return palette[h]
}

export const initials = (name = '?') =>
  name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

export const fmt = (n) => '$' + Math.abs(n).toFixed(2)

export const todayStr = () =>
  new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
