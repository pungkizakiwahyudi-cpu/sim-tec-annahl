import { create } from 'zustand'
import api from '@/api/axios'

const useAuthStore = create((set, get) => ({
  // ── STATE ────────────────────────────────────────────
  user:            null,
  token:           null,
  isAuthenticated: false,
  loading:         false,
  error:           null,

  // ── ACTIONS ──────────────────────────────────────────

  // Login: kirim kredensial ke API, simpan token & user
  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const response = await api.post('/login', { email, password })
      const { data } = response.data

      // Simpan ke localStorage agar persist saat refresh
      localStorage.setItem('sim_token', data.token)
      localStorage.setItem('sim_user', JSON.stringify(data.user))

      set({
        user:            data.user,
        token:           data.token,
        isAuthenticated: true,
        loading:         false,
        error:           null,
      })

      return { success: true, user: data.user }

    } catch (err) {
      const message = err.response?.data?.message || 'Login gagal. Periksa koneksi Anda.'
      set({ loading: false, error: message, isAuthenticated: false })
      return { success: false, message }
    }
  },

  // Logout: hapus token di server & bersihkan state lokal
  logout: async () => {
    set({ loading: true })
    try {
      await api.post('/logout')
    } catch (err) {
      // Tetap lanjutkan logout meski API gagal (misal token sudah expired)
      console.warn('Logout API error (diabaikan):', err.message)
    } finally {
      // Bersihkan localStorage
      localStorage.removeItem('sim_token')
      localStorage.removeItem('sim_user')

      // Reset state
      set({
        user:            null,
        token:           null,
        isAuthenticated: false,
        loading:         false,
        error:           null,
      })

      // Redirect ke login
      window.location.href = '/login'
    }
  },

  // checkAuth: dipanggil saat app pertama kali load
  // Ambil token dari localStorage, validasi ke /me
  checkAuth: async () => {
    const token    = localStorage.getItem('sim_token')
    const userRaw  = localStorage.getItem('sim_user')

    if (!token) {
      set({ isAuthenticated: false, loading: false })
      return
    }

    // Set token dulu agar interceptor bisa menyisipkannya
    set({ token, loading: true })

    try {
      const response = await api.get('/me')
      const user     = response.data.data

      // Perbarui data user dari server (paling fresh)
      localStorage.setItem('sim_user', JSON.stringify(user))

      set({
        user,
        token,
        isAuthenticated: true,
        loading:         false,
      })

    } catch (err) {
      // Token tidak valid / expired → bersihkan semua
      localStorage.removeItem('sim_token')
      localStorage.removeItem('sim_user')

      set({
        user:            null,
        token:           null,
        isAuthenticated: false,
        loading:         false,
      })
    }
  },

  // Update user data (dipakai saat update profil)
  setUser: (user) => set({ user }),

  // Bersihkan pesan error
  clearError: () => set({ error: null }),
}))

export default useAuthStore