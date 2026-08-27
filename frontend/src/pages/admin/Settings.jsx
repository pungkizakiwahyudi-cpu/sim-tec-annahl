import React, { useEffect, useState } from 'react'
import { Settings as SettingsIcon, Save, RefreshCw, Building2, Calendar, Phone, Mail, Globe } from 'lucide-react'
import api from '@/api/axios'
import Alert from '@/components/ui/Alert'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const Settings = () => {
  const [form, setForm] = useState({
    nama_sistem: '',
    tahun_ajaran: '',
    alamat: '',
    telepon: '',
    email: '',
    website: '',
  })
  const [tahunAjarans, setTahunAjarans] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchSettings = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/admin/settings')
      const data = res.data?.data || {}
      setForm({
        nama_sistem: data.nama_sistem || '',
        tahun_ajaran: data.tahun_ajaran || '',
        alamat: data.alamat || '',
        telepon: data.telepon || '',
        email: data.email || '',
        website: data.website || '',
      })
      setTahunAjarans(data.tahun_ajarans || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat pengaturan.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSettings() }, [])

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
      await api.post('/admin/settings', form)
      setSuccess('Pengaturan berhasil disimpan.')
      fetchSettings()
    } catch (err) {
      const errs = err.response?.data?.errors
      setError(errs ? Object.values(errs).flat().join(' ') : (err.response?.data?.message || 'Gagal menyimpan pengaturan.'))
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
          <h1 className="text-2xl font-bold text-slate-800">Pengaturan Sistem</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Kelola pengaturan umum sistem
          </p>
        </div>
        <button onClick={fetchSettings} className="btn-secondary" disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
          <SettingsIcon className="w-5 h-5 text-emerald-500" />
          <h3 className="font-bold text-slate-800 text-sm">Informasi Umum</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Nama Sistem
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                name="nama_sistem"
                value={form.nama_sistem}
                onChange={handleChange}
                placeholder="SIM TEC AN-NAHL"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 text-sm transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Tahun Ajaran Aktif
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <select
                name="tahun_ajaran"
                value={form.tahun_ajaran}
                onChange={handleChange}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 text-sm transition-all appearance-none bg-white"
              >
                <option value="">-- Pilih Tahun Ajaran --</option>
                {tahunAjarans.map((ta) => (
                  <option key={ta.id} value={ta.nama}>{ta.nama}</option>
                ))}
                <option value="2025/2026">2025/2026</option>
                <option value="2026/2027">2026/2027</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Telepon
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                name="telepon"
                value={form.telepon}
                onChange={handleChange}
                placeholder="0812-3456-7890"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 text-sm transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="info@tec-annahl.id"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 text-sm transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Website
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                name="website"
                value={form.website}
                onChange={handleChange}
                placeholder="https://tec-annahl.id"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 text-sm transition-all"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Alamat
            </label>
            <textarea
              name="alamat"
              value={form.alamat}
              onChange={handleChange}
              rows={3}
              placeholder="Alamat lengkap lembaga"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 text-sm transition-all resize-none"
            />
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
              <><Save className="w-4 h-4" /> Simpan Pengaturan</>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default Settings