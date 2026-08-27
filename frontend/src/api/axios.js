import axios from 'axios'

// Buat instance Axios dengan baseURL dari .env
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false,
})

// ── REQUEST INTERCEPTOR ──────────────────────────────────
// Sisipkan Bearer Token secara otomatis di setiap request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sim_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// ── RESPONSE INTERCEPTOR ─────────────────────────────────
// Tangani error 401 (token kedaluwarsa / tidak valid)
api.interceptors.response.use(
  (response) => {
    // Respons sukses langsung dikembalikan
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Hapus token & data user dari localStorage
      localStorage.removeItem('sim_token')
      localStorage.removeItem('sim_user')

      // Redirect ke halaman login
      // Gunakan window.location agar state Zustand juga ter-reset
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default api