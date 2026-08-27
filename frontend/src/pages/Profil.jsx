import React, { useEffect, useState } from 'react'
import { User, Mail, Save, RefreshCw, Lock, KeyRound } from 'lucide-react'
import api from '@/api/axios'
import useAuthStore from '@/store/authStore'
import Alert from '@/components/ui/Alert'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const Profil = () => {
  const { user, setUser } = useAuthStore()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        password: '',
        password_confirmation: '',
      })
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(''), 4000)
      return () => clearTimeout(t)
    }
  }, [success])

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        name: form.name,
        email: form.email,
      }
      if (form.password) {
        payload.password = form.password
        payload.password_confirmation = form.password_confirmation
      }
      const res = await api.put('/me', payload)
      const updatedUser = res.data?.data || user
      localStorage.setItem('sim_user', JSON.stringify(updatedUser))
      setUser(updatedUser)
      setForm((prev) => ({ ...prev, password: '', password_confirmation: '' }))
      setSuccess('Profil berhasil diperbarui.')
    } catch (err) {
      const errs = err.response?.data?.errors
      setError(errs ? Object.values(errs).flat().join(' ') : (err.response?.data?.message || 'Gagal memperbarui profil.'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Profil Saya</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Kelola informasi akun Anda
          </p>
        </div>
      </div>

      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
          <User className="w-5 h-5 text-emerald-500" />
          <h3 className="font-bold text-slate-800 text-sm">Informasi Akun</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Nama lengkap"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 text-sm transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="email@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 text-sm transition-all"
                required
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
          <Lock className="w-5 h-5 text-emerald-500" />
          <h3 className="font-bold text-slate-800 text-sm">Ganti Password</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Password Baru
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Kosongkan jika tidak ingin ganti"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 text-sm transition-all"
                minLength={6}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Konfirmasi Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                name="password_confirmation"
                type="password"
                value={form.password_confirmation}
                onChange={handleChange}
                placeholder="Ulangi password baru"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 text-sm transition-all"
                minLength={6}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
            disabled={saving}
          >
            {saving ? (
              <><LoadingSpinner size="sm" color="white" /> Menyimpan...</>
            ) : (
              <><Save className="w-4 h-4" /> Simpan Perubahan</>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default Profil