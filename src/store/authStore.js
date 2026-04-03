import { create } from 'zustand'
import { supabase } from '../lib/supabase'

const useAuthStore = create((set, get) => ({
  // ── State ──────────────────────────────────────────────────
  user: null,      // Supabase auth user object
  profile: null,   // Row from public.profiles
  role: null,      // 'admin' | 'user' | null
  loading: true,   // true until initial session check resolves
  error: null,

  // ── Computed ───────────────────────────────────────────────
  get isAdmin() {
    return get().role === 'admin'
  },

  // ── Internal ───────────────────────────────────────────────
  fetchProfile: async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      set({ error: error.message, profile: null, role: null })
      return
    }

    set({ profile: data, role: data.role })
  },

  // ── Auth actions ───────────────────────────────────────────
  signInWithEmail: async (email, password) => {
    set({ loading: true, error: null })
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      set({ loading: false, error: error.message })
      return { error }
    }

    await get().fetchProfile(data.user.id)
    set({ user: data.user, loading: false })
    return { error: null }
  },

  signInWithGoogle: async () => {
    set({ error: null })
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` },
    })
    if (error) set({ error: error.message })
    return { error: error ?? null }
  },

  signInWithFacebook: async () => {
    set({ error: null })
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: { redirectTo: `${window.location.origin}/` },
    })
    if (error) set({ error: error.message })
    return { error: error ?? null }
  },

  signOut: async () => {
    set({ loading: true, error: null })
    const { error } = await supabase.auth.signOut()
    if (error) {
      set({ loading: false, error: error.message })
      return { error }
    }
    set({ user: null, profile: null, role: null, loading: false })
    return { error: null }
  },

  // ── Bootstrap — call once in App.jsx ──────────────────────
  init: () => {
    // Resolve the current session immediately
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        await get().fetchProfile(session.user.id)
        set({ user: session.user, loading: false })
      } else {
        set({ loading: false })
      }
    })

    // Keep state in sync with auth changes (OAuth redirects, token refresh, sign-out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await get().fetchProfile(session.user.id)
          set({ user: session.user })
        } else {
          set({ user: null, profile: null, role: null })
        }
      }
    )

    // Return unsubscribe so App.jsx can clean up on unmount
    return () => subscription.unsubscribe()
  },
}))

export default useAuthStore
