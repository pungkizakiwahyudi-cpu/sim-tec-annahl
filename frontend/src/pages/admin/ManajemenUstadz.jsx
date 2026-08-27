import React, { useEffect, useState, useCallback } from 'react'
import {
  Plus, Search, Pencil, Trash2, RefreshCw,
  Mail, BookOpen, Hash, UserCheck, Users,
  GraduationCap, Award
} from 'lucide-react'
import api from '@/api/axios'
import Modal from '@/components/ui/Modal'
import Alert from '@/components/ui/Alert'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

// Helper Inisial Avatar
const getInitials = (name = '') => {
  if (!name) return 'U'
  return name
    .replace(/^(Ustadz|Ustadzah|Ust\.|Ustz\.)\s+/i, '') // Menghilangkan gelar panggil agar inisial nama asli
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

// ── Form Ustadz (Create / Edit) ──────────────────────────
const FormUstadz = ({ initial, onSubmit, loading, error }) => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    nip: '',
    jenis_kelamin: 'Laki-laki',
    bidang_ajar: '',
    ...initial,
  })

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name || '',
        email: initial.email || '',
        password: '',
        nip: initial.nip || '',
        jenis_kelamin: initial.jenis_kelamin || initial.user?.jenis_kelamin || 'Laki-laki',
        bidang_ajar: initial.bidang_ajar || '',
        ...initial,
      })
    }
  }, [initial])

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const isEdit = !!initial?.id

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form) }} className="space-y-4 pt-1">
      {error && <Alert type="error" message={error} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Nama Lengkap <span className="text-rose-500">*</span>
          </label>
          <input
            name="name"
            value={form.name || ''}
            onChange={handleChange}
            placeholder="Ustadz Ahmad Fauzi"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0B4832] focus:ring-2 focus:ring-[#0B4832]/20 transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            NIP <span className="text-rose-500">*</span>
          </label>
          <input
            name="nip"
            value={form.nip || ''}
            onChange={handleChange}
            placeholder="NIP001"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0B4832] focus:ring-2 focus:ring-[#0B4832]/20 transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Email <span className="text-rose-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={form.email || ''}
            onChange={handleChange}
            placeholder="ustadz@email.com"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0B4832] focus:ring-2 focus:ring-[#0B4832]/20 transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Password{' '}
            {isEdit ? (
              <span className="text-slate-400 font-normal lowercase">(opsional)</span>
            ) : (
              <span className="text-rose-500">*</span>
            )}
          </label>
          <input
            type="password"
            name="password"
            value={form.password || ''}
            onChange={handleChange}
            placeholder={isEdit ? '••••••••' : 'Minimal 6 karakter'}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0B4832] focus:ring-2 focus:ring-[#0B4832]/20 transition-all"
            required={!isEdit}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Jenis Kelamin <span className="text-rose-500">*</span>
          </label>
          <select
            name="jenis_kelamin"
            value={form.jenis_kelamin || 'Laki-laki'}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0B4832] focus:ring-2 focus:ring-[#0B4832]/20 transition-all cursor-pointer"
            required
          >
            <option value="Laki-laki">Laki-laki</option>
            <option value="Perempuan">Perempuan</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Bidang Ajar <span className="text-rose-500">*</span>
          </label>
          <input
            name="bidang_ajar"
            value={form.bidang_ajar || ''}
            onChange={handleChange}
            placeholder="Tahfidz Al-Quran / Tajwid"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0B4832] focus:ring-2 focus:ring-[#0B4832]/20 transition-all"
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 bg-[#0B4832] hover:bg-[#083827] text-white text-sm font-semibold rounded-xl shadow-md transition-all duration-200 flex items-center gap-2 cursor-pointer"
        >
          {loading ? (
            <><LoadingSpinner size="sm" color="white" /> Menyimpan...</>
          ) : (
            isEdit ? 'Simpan Perubahan' : 'Tambah Ustadz'
          )}
        </button>
      </div>
    </form>
  )
}

// ── Main Component ───────────────────────────────────────
const ManajemenUstadz = () => {
  const [ustadz, setUstadz]               = useState([])
  const [loading, setLoading]             = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError]                 = useState('')
  const [formError, setFormError]         = useState('')
  const [success, setSuccess]             = useState('')
  const [search, setSearch]               = useState('')

  // Modal States
  const [modalCreate, setModalCreate]     = useState(false)
  const [modalEdit, setModalEdit]         = useState(false)
  const [modalDelete, setModalDelete]     = useState(false)
  const [selected, setSelected]           = useState(null)

  const fetchUstadz = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/admin/ustadz', { params: { search } })
      
      let dataList = []
      if (Array.isArray(res?.data)) {
        dataList = res.data
      } else if (Array.isArray(res?.data?.data)) {
        dataList = res.data.data
      } else if (Array.isArray(res?.data?.data?.data)) {
        dataList = res.data.data.data
      }

      setUstadz(dataList)
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data ustadz.')
      setUstadz([])
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => { fetchUstadz() }, [fetchUstadz])

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(''), 4000)
      return () => clearTimeout(t)
    }
  }, [success])

  const openEdit = (u) => {
    setFormError('')
    setSelected({
      id: u.id,
      name: u.user?.name || u.name || u.nama || '',
      email: u.user?.email || u.email || '',
      password: '',
      nip: u.nip || '',
      jenis_kelamin: u.jenis_kelamin || u.user?.jenis_kelamin || 'Laki-laki',
      bidang_ajar: u.bidang_ajar || '',
    })
    setModalEdit(true)
  }

  const handleCreate = async (form) => {
    setActionLoading(true)
    setFormError('')
    try {
      await api.post('/admin/ustadz', form)
      setSuccess('Ustadz berhasil ditambahkan.')
      setModalCreate(false)
      fetchUstadz()
    } catch (err) {
      const errs = err.response?.data?.errors
      setFormError(errs ? Object.values(errs).flat().join(' ') : (err.response?.data?.message || 'Gagal menambahkan ustadz'))
    } finally {
      setActionLoading(false)
    }
  }

  const handleEdit = async (form) => {
    setActionLoading(true)
    setFormError('')
    try {
      await api.put(`/admin/ustadz/${selected.id}`, form)
      setSuccess('Data ustadz berhasil diperbarui.')
      setModalEdit(false)
      fetchUstadz()
    } catch (err) {
      const errs = err.response?.data?.errors
      setFormError(errs ? Object.values(errs).flat().join(' ') : (err.response?.data?.message || 'Gagal mengedit ustadz'))
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selected?.id) return
    setActionLoading(true)
    try {
      await api.delete(`/admin/ustadz/${selected.id}`)
      setSuccess('Ustadz berhasil dihapus.')
      setModalDelete(false)
      fetchUstadz()
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menghapus ustadz.')
      setModalDelete(false)
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* ----------------- HEADER ----------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Manajemen Ustadz</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Kelola data tenaga pengajar, NIP, serta bidang ajar TPQ.
          </p>
        </div>
        <button
          onClick={() => { setSelected(null); setFormError(''); setModalCreate(true) }}
          className="px-4 py-2.5 bg-[#0B4832] hover:bg-[#083827] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Ustadz Baru</span>
        </button>
      </div>

      {/* Alert Notifications */}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}
      {error   && <Alert type="error"   message={error}   onClose={() => setError('')} />}

      {/* ----------------- STATS CARDS ----------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/30 p-4 rounded-2xl border border-emerald-100 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#0B4832] text-white flex items-center justify-center shrink-0 shadow-sm">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Ustadz / Ustz</p>
            <p className="text-2xl font-black text-[#0B4832]">{ustadz.length}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-100/60 to-teal-50/20 p-4 rounded-2xl border border-teal-200/80 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-teal-800 uppercase tracking-wider">Aktif Mengampu</p>
            <p className="text-2xl font-black text-teal-700">
              {ustadz.filter((u) => (u.kelas?.length || u.kelas_count || 0) > 0).length}
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-100/60 to-emerald-50/20 p-4 rounded-2xl border border-emerald-200/80 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Pengajar Al-Qur'an</p>
            <p className="text-2xl font-black text-emerald-700">
              {ustadz.filter((u) => u.bidang_ajar?.toLowerCase().includes('qur') || u.bidang_ajar?.toLowerCase().includes('tahfidz')).length}
            </p>
          </div>
        </div>
      </div>

      {/* ----------------- SEARCH BAR ----------------- */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              placeholder="Cari nama ustadz atau NIP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#0B4832] focus:ring-2 focus:ring-[#0B4832]/20 transition-all"
            />
          </div>
          <button
            onClick={fetchUstadz}
            disabled={loading}
            className="px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl transition-colors flex items-center justify-center gap-1.5 font-medium text-xs cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ----------------- TABEL DATA IMPROVED ----------------- */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : !ustadz || ustadz.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30 text-[#0B4832]" />
            <p className="font-bold text-slate-700 text-base">Tidak ada data ustadz ditemukan.</p>
            <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian Anda.</p>
          </div>
        ) : (
          <>
          {/* Tampilan Kartu (Mobile) */}
          <div className="lg:hidden divide-y divide-slate-100">
            {ustadz.map((u, idx) => {
              const namaUstadz = u.user?.name || u.nama || u.name || '-'
              const emailUstadz = u.user?.email || u.email || '-'
              const jmlKelas = u.kelas?.length || u.kelas_count || 0
              return (
                <div key={u.id || idx} className="p-4 hover:bg-emerald-50/40 transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0B4832] to-emerald-500 text-white font-black flex items-center justify-center text-xs shrink-0 shadow-md ring-2 ring-emerald-600/10">
                        {getInitials(namaUstadz)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-sm leading-snug truncate">{namaUstadz}</p>
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/70 font-mono mt-1">
                          <Hash className="w-2.5 h-2.5 opacity-70" />
                          <span>{u.nip || '-'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => openEdit(u)}
                        title="Edit Data"
                        className="p-1.5 rounded-lg text-sky-600 bg-sky-50 hover:bg-sky-100 transition-colors cursor-pointer"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => { setSelected(u); setModalDelete(true) }}
                        title="Hapus Data"
                        className="p-1.5 rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600 min-w-0">
                      <Mail className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{emailUstadz}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <BookOpen className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span>
                        <span className="font-bold text-slate-700">{jmlKelas}</span> Kelas
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-[#0B4832] border border-emerald-200/80 rounded-lg text-xs font-semibold">
                        {u.bidang_ajar || '-'}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Tampilan Tabel (Desktop) */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0B4832] text-white text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4 text-center w-12">NO</th>
                  <th className="py-3.5 px-4">NAMA / NIP</th>
                  <th className="py-3.5 px-4">EMAIL</th>
                  <th className="py-3.5 px-4">BIDANG AJAR</th>
                  <th className="py-3.5 px-4 text-center">JUMLAH KELAS</th>
                  <th className="py-3.5 px-4 text-right">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                {ustadz.map((u, idx) => {
                  const namaUstadz = u.user?.name || u.nama || u.name || '-'
                  const emailUstadz = u.user?.email || u.email || '-'
                  const jmlKelas = u.kelas?.length || u.kelas_count || 0

                  return (
                    <tr key={u.id || idx} className="hover:bg-emerald-50/40 transition-colors group">
                      {/* Nomor */}
                      <td className="py-4 px-4 text-center text-slate-400 font-bold">{idx + 1}</td>

                      {/* 🌟 NAMA / NIP */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          {/* Avatar Gradient Halus */}
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0B4832] to-emerald-500 text-white font-black flex items-center justify-center text-xs shrink-0 shadow-md ring-2 ring-emerald-600/10">
                            {getInitials(namaUstadz)}
                          </div>
                          <div className="space-y-1">
                            <p className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-[#0B4832] transition-colors leading-snug">
                              {namaUstadz}
                            </p>
                            {/* NIP Badge Soft Emerald */}
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/70 font-mono shadow-2xs">
                              <Hash className="w-2.5 h-2.5 opacity-70" />
                              <span>{u.nip || '-'}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 🌟 EMAIL Pill Capsule */}
                      <td className="py-4 px-4">
                        <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700 group-hover:border-emerald-200 group-hover:bg-white transition-all shadow-2xs">
                          <div className="p-1 rounded-lg bg-emerald-100/60 text-emerald-800">
                            <Mail className="w-3 h-3" />
                          </div>
                          <span className="font-medium text-[11px] truncate max-w-[190px]">{emailUstadz}</span>
                        </div>
                      </td>

                      {/* 🌟 BIDANG AJAR */}
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-[#0B4832] border border-emerald-200/80 rounded-lg text-xs font-semibold shadow-2xs">
                          {u.bidang_ajar || '-'}
                        </span>
                      </td>

                      {/* 🌟 JUMLAH KELAS */}
                      <td className="py-4 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100/80 text-slate-700 font-semibold text-xs border border-slate-200/60">
                          <BookOpen className="w-3.5 h-3.5 text-teal-600" />
                          <span>{jmlKelas}</span>
                          <span className="text-[10px] text-slate-400 font-normal">Kelas</span>
                        </div>
                      </td>

                      {/* ACTION BUTTONS */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEdit(u)}
                            title="Edit Data"
                            className="p-1.5 rounded-lg text-sky-600 bg-sky-50 hover:bg-sky-100 transition-colors cursor-pointer"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => { setSelected(u); setModalDelete(true) }}
                            title="Hapus Data"
                            className="p-1.5 rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          </>
        )}
      </div>

      {/* Modal Tambah */}
      <Modal
        isOpen={modalCreate}
        onClose={() => setModalCreate(false)}
        title="Tambah Ustadz Baru"
        size="lg"
      >
        <FormUstadz
          onSubmit={handleCreate}
          loading={actionLoading}
          error={formError}
        />
      </Modal>

      {/* Modal Edit */}
      <Modal
        isOpen={modalEdit}
        onClose={() => setModalEdit(false)}
        title="Edit Data Ustadz"
        size="lg"
      >
        <FormUstadz
          initial={selected}
          onSubmit={handleEdit}
          loading={actionLoading}
          error={formError}
        />
      </Modal>

      {/* Modal Hapus */}
      <Modal
        isOpen={modalDelete}
        onClose={() => setModalDelete(false)}
        title="Konfirmasi Hapus"
        size="sm"
      >
        <div className="text-center py-2">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-200">
            <Trash2 className="w-8 h-8 text-rose-600" />
          </div>
          <p className="text-slate-700 font-medium text-sm">
            Hapus ustadz <span className="font-bold text-rose-600">"{selected?.user?.name || selected?.nama || selected?.name || 'Ustadz'}"</span>?
          </p>
          <p className="text-slate-500 text-xs mt-2 leading-relaxed">
            Semua kelas yang diampu akan kehilangan pengampu. Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>
        <div className="flex gap-3 justify-center mt-6">
          <button
            onClick={() => setModalDelete(false)}
            disabled={actionLoading}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={handleDelete}
            disabled={actionLoading}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
          >
            {actionLoading ? <><LoadingSpinner size="sm" color="white" /> Menghapus...</> : 'Ya, Hapus'}
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default ManajemenUstadz