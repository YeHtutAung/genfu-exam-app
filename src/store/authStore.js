import { create } from 'zustand'
import { supabase } from '../lib/supabase'

const useAuthStore = create((set, get) => ({
  // ── State ──────────────────────────────────────────────────
  user: null,
  profile: null,
  role: null,
  loading: true,
  error: null,

  get isAdmin() {
    return get().role === 'admin'
  },

  fetchProfile: async (userId) => {
    try {
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
    } catch (err) {
      set({ error: err.message, profile: null, role: null })
    }
  },

  // ── Auth actions ───────────────────────────────────────────
  signInWithEmail: async (email, password) => {
    set({ error: null })
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      set({ error: error.message })
      return { error }
    }
    await get().fetchProfile(data.user.id)
    set({ user: data.user, loading: false })
    return { error: null }
  },

  signUp: async (email, password) => {
    set({ error: null })
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      set({ error: error.message })
      return { error }
    }
    // If email confirmation is enabled, session will be null
    if (data.session) {
      await get().fetchProfile(data.user.id)
      set({ user: data.user, loading: false })
      return { error: null, confirmationNeeded: false }
    }
    // Email confirmation required — don't navigate or fetch profile
    return { error: null, confirmationNeeded: true }
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
    set({ error: null })
    const { error } = await supabase.auth.signOut()
    if (error) {
      set({ error: error.message })
      return { error }
    }
    set({ user: null, profile: null, role: null })
    return { error: null }
  },

  // ── Bootstrap — call once in App.jsx ──────────────────────
  init: () => {
    // Primary bootstrap via getSession
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        await get().fetchProfile(session.user.id)
        set({ user: session.user, loading: false })
      } else {
        set({ loading: false })
      }
    }).catch(() => {
      set({ loading: false })
    })

    // Keep state in sync with ongoing auth changes
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        get().fetchProfile(session.user.id).then(() => {
          set({ user: session.user, loading: false })
        })
      } else if (event === 'SIGNED_OUT') {
        set({ user: null, profile: null, role: null })
      }
    })
  },
}))

export default useAuthStore
