import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LogIn, Mail, Lock } from 'lucide-react'
import useAuthStore from '@/store/authStore'
import Alert from '@/components/ui/Alert'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

// Coba beberapa format logo secara berurutan
const LOGO_CANDIDATES = [
  '/logo-tec-annahl.png',
  '/logo-tec-annahl.jpg',
  '/logo-tec-annahl.jpeg',
  '/logo-tec-annahl.svg',
  '/logo.png',
  '/logo.jpg',
  '/logo.svg',
]

const Login = () => {
  const navigate = useNavigate()
  const { login, isAuthenticated, user, loading, error, clearError } = useAuthStore()
  const [logoIndex, setLogoIndex] = useState(0)
  const [logoError, setLogoError] = useState(false)

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState('')

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin')  navigate('/admin/dashboard', { replace: true })
      if (user.role === 'ustadz') navigate('/ustadz/dashboard', { replace: true })
      if (user.role === 'santri') navigate('/santri/dashboard', { replace: true })
    }
  }, [isAuthenticated, user, navigate])

  useEffect(() => {
    return () => clearError()
  }, [])

  const handleChange = (e) => {
    setLocalError('')
    clearError()
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError('')

    if (!form.email.trim()) {
      setLocalError('Email wajib diisi.')
      return
    }
    if (!form.password.trim()) {
      setLocalError('Password wajib diisi.')
      return
    }

    await login(form.email.trim(), form.password)
  }

  const displayError = localError || error

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAF9] font-sans p-4 sm:p-6">
      {/* Background Pattern Decorative */}
      <div className="fixed inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#0B4832 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />
      <div className="fixed -top-24 -left-24 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed -bottom-20 -right-20 w-80 h-80 bg-amber-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-6">
          {!logoError && logoIndex < LOGO_CANDIDATES.length ? (
            <img
              src={LOGO_CANDIDATES[logoIndex]}
              alt="Logo TEC AN-NAHL"
              className="w-20 h-20 rounded-2xl shadow-lg"
              onError={() => {
                setLogoIndex((prev) => prev + 1)
                setLogoError(logoIndex >= LOGO_CANDIDATES.length - 1)
              }}
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-[#0B4832] flex items-center justify-center shadow-lg">
              <span className="text-amber-400 text-4xl font-bold">ن</span>
            </div>
          )}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#0B4832]">TEC AN-NAHL</h1>
            <p className="text-xs text-amber-700">Islamic Management System</p>
          </div>
        </div>

        {/* Card Wrapper */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Selamat Datang</h2>
            <p className="text-slate-500 text-sm mt-1">
              Silakan masuk ke akun Anda untuk melanjutkan.
            </p>
          </div>

          {/* Alert error */}
          {displayError && (
            <Alert
              type="error"
              message={displayError}
              onClose={() => {
                setLocalError('')
                clearError()
              }}
              className="mb-5"
            />
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="admin@tec-annahl.com"
                  disabled={loading}
                  autoFocus
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#0B4832] focus:ring-2 focus:ring-[#0B4832]/20 transition-all duration-200"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <a href="#forgot" className="text-xs text-amber-700 hover:text-[#0B4832] font-semibold transition-colors">
                  Lupa Password?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  disabled={loading}
                  className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#0B4832] focus:ring-2 focus:ring-[#0B4832]/20 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                className="w-4 h-4 rounded border-slate-300 text-[#0B4832] focus:ring-[#0B4832]"
              />
              <label htmlFor="remember" className="ml-2 text-xs text-slate-600">
                Ingat Saya di perangkat ini
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-[#0B4832] hover:bg-[#083827] active:scale-[0.99] text-white font-semibold rounded-xl shadow-lg shadow-[#0B4832]/20 transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" color="white" />
                  <span>Memproses Login...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Masuk ke Sistem</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Quick Demo Credentials */}
        <div className="mt-6 p-4 rounded-xl bg-amber-50/60 border border-amber-200/40 text-xs text-slate-600">
          <p className="font-bold text-amber-700 mb-2 flex items-center gap-1.5">
            <span>💡</span> Akun Akses Demo:
          </p>
          <div className="space-y-1 font-mono text-[11px]">
            <div className="flex justify-between"><span className="font-sans font-bold text-emerald-800">Admin:</span> admin@tec-annahl.com / pass</div>
            <div className="flex justify-between"><span className="font-sans font-bold text-teal-800">Ustadz:</span> ahmad@tec-annahl.com / pass</div>
          </div>
        </div>

        <div className="text-center mt-6 text-xs text-slate-400">
          © {new Date().getFullYear()} TEC AN-NAHL — Islamic System. All rights reserved.
        </div>
      </div>
    </div>
  )
}

export default Login