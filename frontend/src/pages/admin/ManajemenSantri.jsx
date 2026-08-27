import React, { useEffect, useState, useCallback } from 'react'
import {
  Plus, Search, Pencil, Trash2,
  UserCheck, UserX, RefreshCw, ChevronDown, Users,
  Mail, Phone, Calendar, UserPlus, CheckCircle2, Award, Hash,
  Download
} from 'lucide-react'
import api from '@/api/axios'
import Modal from '@/components/ui/Modal'
import Alert from '@/components/ui/Alert'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Pagination from '@/components/ui/Pagination'

// Helper Inisial Avatar
const getInitials = (name = '') => {
  if (!name) return 'S'
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

// ── Form Santri (Create / Edit) ──────────────────────────
const FormSantri = ({ initial, onSubmit, loading, error }) => {
  const [form, setForm] = useState({
    name:             '',
    email:            '',
    password:         '',
    nis:              '',
    jenis_kelamin:    'Laki-laki',
    kategori:         'akhi',
    tempat_lahir:     '',
    tanggal_lahir:    '',
    nama_orang_tua:   '',
    no_hp_orang_tua:  '',
    alamat:           '',
    status:           'pendaftar_baru',
    ...initial,
  })

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(form)
  }

  const isEdit = !!initial?.id

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-1">
      {error && <Alert type="error" message={error} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Nama Lengkap <span className="text-rose-500">*</span>
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Muhammad Rizki"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0B4832] focus:ring-2 focus:ring-[#0B4832]/20 transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            NIS <span className="text-rose-500">*</span>
          </label>
          <input
            name="nis"
            value={form.nis}
            onChange={handleChange}
            placeholder="NIS001"
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
            value={form.email}
            onChange={handleChange}
            placeholder="santri@email.com"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0B4832] focus:ring-2 focus:ring-[#0B4832]/20 transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Password {isEdit && <span className="text-slate-400 font-normal lowercase">(opsional)</span>}
            {!isEdit && <span className="text-rose-500"> *</span>}
          </label>
          <input
            type="password"
            name="password"
            value={form.password}
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
            value={form.jenis_kelamin}
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
            Kategori <span className="text-rose-500">*</span>
          </label>
          <select
            name="kategori"
            value={form.kategori || 'akhi'}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0B4832] focus:ring-2 focus:ring-[#0B4832]/20 transition-all cursor-pointer"
            required
          >
            <option value="akhi">Akhi (Laki-laki)</option>
            <option value="akhwat">Akhwat (Perempuan)</option>
            <option value="anak_anak">Anak-anak</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Tempat Lahir
          </label>
          <input
            name="tempat_lahir"
            value={form.tempat_lahir}
            onChange={handleChange}
            placeholder="Contoh: Bekasi"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0B4832] focus:ring-2 focus:ring-[#0B4832]/20 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Tanggal Lahir <span className="text-rose-500">*</span>
          </label>
          <input
            type="date"
            name="tanggal_lahir"
            value={form.tanggal_lahir}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0B4832] focus:ring-2 focus:ring-[#0B4832]/20 transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Nama Orang Tua
          </label>
          <input
            name="nama_orang_tua"
            value={form.nama_orang_tua}
            onChange={handleChange}
            placeholder="Nama Ayah / Ibu"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0B4832] focus:ring-2 focus:ring-[#0B4832]/20 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            No. HP Orang Tua <span className="text-rose-500">*</span>
          </label>
          <input
            name="no_hp_orang_tua"
            value={form.no_hp_orang_tua}
            onChange={handleChange}
            placeholder="08123456789"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0B4832] focus:ring-2 focus:ring-[#0B4832]/20 transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Status <span className="text-rose-500">*</span>
          </label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0B4832] focus:ring-2 focus:ring-[#0B4832]/20 transition-all cursor-pointer"
            required
          >
            <option value="pendaftar_baru">Pendaftar Baru</option>
            <option value="aktif">Aktif</option>
            <option value="alumni">Alumni</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Alamat <span className="text-rose-500">*</span>
        </label>
        <textarea
          name="alamat"
          value={form.alamat}
          onChange={handleChange}
          placeholder="Jl. Contoh No. 1, Babelan, Bekasi"
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0B4832] focus:ring-2 focus:ring-[#0B4832]/20 transition-all resize-none"
          rows={3}
          required
        />
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
            isEdit ? 'Simpan Perubahan' : 'Tambah Santri'
          )}
        </button>
      </div>
    </form>
  )
}

// ── Modal Konfirmasi Hapus ───────────────────────────────
const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, name, loading }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Konfirmasi Hapus" size="sm">
    <div className="text-center py-2">
      <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-200">
        <Trash2 className="w-8 h-8 text-rose-600" />
      </div>
      <p className="text-slate-700 font-medium text-sm">
        Hapus data santri <span className="font-bold text-rose-600">"{name}"</span>?
      </p>
      <p className="text-slate-500 text-xs mt-2 leading-relaxed">
        Semua data terkait (absensi, nilai, infaq) akan ikut terhapus secara permanen.
      </p>
    </div>
    <div className="flex gap-3 justify-center mt-6">
      <button 
        onClick={onClose} 
        disabled={loading}
        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
      >
        Batal
      </button>
      <button 
        onClick={onConfirm} 
        disabled={loading}
        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
      >
        {loading ? <><LoadingSpinner size="sm" color="white" /> Menghapus...</> : 'Ya, Hapus'}
      </button>
    </div>
  </Modal>
)

// ── Main Component ───────────────────────────────────────
const ManajemenSantri = () => {
  const [santri, setSantri]                 = useState([])
  const [loading, setLoading]               = useState(true)
  const [actionLoading, setActionLoading]   = useState(false)
  const [error, setError]                   = useState('')
  const [formError, setFormError]           = useState('')
  const [success, setSuccess]               = useState('')
  const [search, setSearch]                 = useState('')
  const [filterStatus, setFilterStatus]     = useState('')
  const [currentPage, setCurrentPage]       = useState(1)
  const [totalPages, setTotalPages]         = useState(1)
  const [totalItems, setTotalItems]         = useState(0)
  const perPage = 15

  // Modal states
  const [modalCreate, setModalCreate]       = useState(false)
  const [modalEdit, setModalEdit]           = useState(false)
  const [modalDelete, setModalDelete]       = useState(false)
  const [selectedSantri, setSelectedSantri] = useState(null)

  // Fetch data
  const fetchSantri = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = { per_page: perPage, page: currentPage }
      if (search)       params.search = search
      if (filterStatus) params.status = filterStatus
      const res = await api.get('/admin/santri', { params })

      let extractedData = []
      let paginationData = null
      if (Array.isArray(res.data)) {
        extractedData = res.data
      } else if (Array.isArray(res.data?.data)) {
        extractedData = res.data.data
        paginationData = res.data
      } else if (Array.isArray(res.data?.data?.data)) {
        extractedData = res.data.data.data
        paginationData = res.data.data
      }

      setSantri(extractedData)
      if (paginationData) {
        setTotalPages(paginationData.last_page || 1)
        setTotalItems(paginationData.total || extractedData.length)
      } else {
        setTotalPages(1)
        setTotalItems(extractedData.length)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data santri.')
    } finally {
      setLoading(false)
    }
  }, [search, filterStatus, currentPage])

  useEffect(() => {
    fetchSantri()
  }, [fetchSantri])

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(''), 4000)
      return () => clearTimeout(t)
    }
  }, [success])

  const countAktif = santri.filter((s) => s.status === 'aktif').length
  const countBaru  = santri.filter((s) => s.status === 'pendaftar_baru').length
  const countAlumni = santri.filter((s) => s.status === 'alumni').length

  const openEdit = (s) => {
    setFormError('')
    setSelectedSantri({
      id:              s.id,
      name:            s.user?.name || s.nama || s.name || '',
      email:           s.user?.email || s.email || '',
      password:        '',
      nis:             s.nis,
      jenis_kelamin:   s.jenis_kelamin || 'Laki-laki',
      kategori:        s.kategori || 'akhi',
      tempat_lahir:    s.tempat_lahir || '',
      tanggal_lahir:   s.tanggal_lahir?.split('T')[0] || s.tanggal_lahir || '',
      nama_orang_tua:  s.nama_orang_tua || '',
      no_hp_orang_tua: s.no_hp_orang_tua || s.no_hp || '',
      alamat:          s.alamat,
      status:          s.status,
    })
    setModalEdit(true)
  }

  const openDelete = (s) => {
    setSelectedSantri(s)
    setModalDelete(true)
  }

  const handleCreate = async (form) => {
    setActionLoading(true)
    setFormError('')
    try {
      await api.post('/admin/santri', form)
      setSuccess('Santri berhasil ditambahkan.')
      setModalCreate(false)
      fetchSantri()
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menambahkan santri.'
      const errs = err.response?.data?.errors
      setFormError(errs ? Object.values(errs).flat().join(' ') : msg)
    } finally {
      setActionLoading(false)
    }
  }

  const handleEdit = async (form) => {
    setActionLoading(true)
    setFormError('')
    try {
      await api.put(`/admin/santri/${selectedSantri.id}`, form)
      setSuccess('Data santri berhasil diperbarui.')
      setModalEdit(false)
      fetchSantri()
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal memperbarui data santri.'
      const errs = err.response?.data?.errors
      setFormError(errs ? Object.values(errs).flat().join(' ') : msg)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    setActionLoading(true)
    try {
      await api.delete(`/admin/santri/${selectedSantri.id}`)
      setSuccess('Santri berhasil dihapus.')
      setModalDelete(false)
      fetchSantri()
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menghapus santri.')
      setModalDelete(false)
    } finally {
      setActionLoading(false)
    }
  }

  const handlePatchStatus = async (id, status) => {
    try {
      await api.patch(`/admin/santri/${id}/status`, { status })
      setSuccess(`Status santri berhasil diubah menjadi ${status}.`)
      fetchSantri()
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengubah status.')
    }
  }

  const handleExport = async () => {
    try {
      const params = {}
      if (filterStatus) params.status = filterStatus

      const res = await api.get('/admin/laporan/santri', {
        params,
        responseType: 'blob',
      })

      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `laporan_santri_${Date.now()}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError('Gagal export laporan santri. Periksa kembali data atau filter Anda.')
    }
  }

  return (
    <div className="space-y-6">
      {/* ----------------- HEADER ----------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Manajemen Santri</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Kelola data induk, status keaktifan, dan biodata santri TPQ.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExport}
            className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            title="Export Laporan Santri (PDF)"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button
            onClick={() => { setFormError(''); setModalCreate(true) }}
            className="px-4 py-2.5 bg-[#0B4832] hover:bg-[#083827] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Santri Baru</span>
          </button>
        </div>
      </div>

      {/* Notifikasi */}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}
      {error   && <Alert type="error"   message={error}   onClose={() => setError('')} />}

      {/* ----------------- STATS CARDS ----------------- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/30 p-4 rounded-2xl border border-emerald-100 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#0B4832] text-white flex items-center justify-center shrink-0 shadow-sm">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Santri</p>
            <p className="text-2xl font-black text-[#0B4832]">{santri.length}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-100/60 to-emerald-50/20 p-4 rounded-2xl border border-emerald-200/80 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Aktif</p>
            <p className="text-2xl font-black text-emerald-700">{countAktif}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-100/60 to-amber-50/20 p-4 rounded-2xl border border-amber-200/80 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Pendaftar Baru</p>
            <p className="text-2xl font-black text-amber-600">{countBaru}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-sky-100/60 to-sky-50/20 p-4 rounded-2xl border border-sky-200/80 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-sky-800 uppercase tracking-wider">Alumni</p>
            <p className="text-2xl font-black text-sky-600">{countAlumni}</p>
          </div>
        </div>
      </div>

      {/* ----------------- FILTER & SEARCH BAR ----------------- */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama, email, atau NIS santri..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#0B4832] focus:ring-2 focus:ring-[#0B4832]/20 transition-all"
            />
          </div>

          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full sm:w-auto px-4 py-2.5 pr-9 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none focus:border-[#0B4832] focus:ring-2 focus:ring-[#0B4832]/20 transition-all appearance-none cursor-pointer"
            >
              <option value="">Semua Status</option>
              <option value="pendaftar_baru">Pendaftar Baru</option>
              <option value="aktif">Aktif</option>
              <option value="alumni">Alumni</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          <button
            onClick={fetchSantri}
            disabled={loading}
            className="px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl transition-colors flex items-center justify-center gap-1.5 font-medium text-xs cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ----------------- TABEL DATA (IMPROVED NAMA/NIS & EMAIL) ----------------- */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : santri.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30 text-[#0B4832]" />
            <p className="font-bold text-slate-700 text-base">Tidak ada data santri ditemukan.</p>
            <p className="text-xs text-slate-400 mt-1">Coba ubah kata kunci pencarian atau filter status Anda.</p>
          </div>
        ) : (
          <>
          {/* Tampilan Kartu (Mobile) */}
          <div className="lg:hidden divide-y divide-slate-100">
            {santri.map((s, idx) => {
              const namaSantri = s.user?.name || s.nama || s.name || '-'
              const emailSantri = s.user?.email || s.email || '-'
              return (
                <div key={s.id || idx} className="p-4 hover:bg-emerald-50/40 transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0B4832] to-emerald-500 text-white font-black flex items-center justify-center text-xs shrink-0 shadow-md ring-2 ring-emerald-600/10">
                        {getInitials(namaSantri)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-sm leading-snug truncate">{namaSantri}</p>
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/70 font-mono mt-1">
                          <Hash className="w-2.5 h-2.5 opacity-70" />
                          <span>{s.nis || '-'}</span>
                        </div>
                      </div>
                    </div>
                    <Badge value={s.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600 min-w-0">
                      <Mail className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{emailSantri}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600 min-w-0">
                      <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{s.no_hp_orang_tua || s.no_hp || '-'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>
                        {s.tanggal_lahir
                          ? new Date(s.tanggal_lahir).toLocaleDateString('id-ID', {
                              day: 'numeric', month: 'short', year: 'numeric',
                            })
                          : '-'}
                      </span>
                    </div>
                    <div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                        s.kategori === 'akhi'       ? 'bg-sky-50 text-sky-700 border-sky-200' :
                        s.kategori === 'akhwat'     ? 'bg-pink-50 text-pink-700 border-pink-200' :
                        s.kategori === 'anak_anak'  ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-slate-50 text-slate-600 border-slate-200'
                      }`}>
                        {s.kategori === 'akhi' ? 'Akhi' :
                         s.kategori === 'akhwat' ? 'Akhwat' :
                         s.kategori === 'anak_anak' ? 'Anak-anak' : s.kategori || '—'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                    <p className="text-xs text-slate-500 truncate">
                      <span className="font-semibold text-slate-700">Ortu:</span> {s.nama_orang_tua || '-'}
                    </p>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {s.status !== 'aktif' && (
                        <button
                          type="button"
                          onClick={() => handlePatchStatus(s.id, 'aktif')}
                          title="Set Aktif"
                          className="p-1.5 rounded-lg text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                      )}
                      {s.status !== 'alumni' && (
                        <button
                          type="button"
                          onClick={() => handlePatchStatus(s.id, 'alumni')}
                          title="Set Alumni"
                          className="p-1.5 rounded-lg text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => openEdit(s)}
                        title="Edit Data"
                        className="p-1.5 rounded-lg text-sky-600 bg-sky-50 hover:bg-sky-100 transition-colors cursor-pointer"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openDelete(s)}
                        title="Hapus Data"
                        className="p-1.5 rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
                  <th className="py-3.5 px-4">NAMA / NIS</th>
                  <th className="py-3.5 px-4">KATEGORI</th>
                  <th className="py-3.5 px-4">EMAIL</th>
                  <th className="py-3.5 px-4">ORANG TUA</th>
                  <th className="py-3.5 px-4">NO. HP ORTU</th>
                  <th className="py-3.5 px-4">TGL LAHIR</th>
                  <th className="py-3.5 px-4 text-center">STATUS</th>
                  <th className="py-3.5 px-4 text-right">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                {santri.map((s, idx) => {
                  const namaSantri = s.user?.name || s.nama || s.name || '-'
                  const emailSantri = s.user?.email || s.email || '-'

                  return (
                    <tr key={s.id || idx} className="hover:bg-emerald-50/40 transition-colors group">
                      {/* Nomor */}
                      <td className="py-4 px-4 text-center text-slate-400 font-bold">{idx + 1}</td>

                      {/* 🌟 IMPROVED: Nama & NIS */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          {/* Avatar Gradient Halus & Ring */}
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0B4832] to-emerald-500 text-white font-black flex items-center justify-center text-xs shrink-0 shadow-md ring-2 ring-emerald-600/10">
                            {getInitials(namaSantri)}
                          </div>
                          <div className="space-y-1">
                            <p className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-[#0B4832] transition-colors leading-snug">
                              {namaSantri}
                            </p>
                            {/* NIS Badge Soft Emerald dengan Icon Hash */}
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/70 font-mono shadow-2xs">
                              <Hash className="w-2.5 h-2.5 opacity-70" />
                              <span>{s.nis || '-'}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Kategori Badge */}
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                          s.kategori === 'akhi'       ? 'bg-sky-50 text-sky-700 border-sky-200' :
                          s.kategori === 'akhwat'     ? 'bg-pink-50 text-pink-700 border-pink-200' :
                          s.kategori === 'anak_anak'  ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-slate-50 text-slate-600 border-slate-200'
                        }`}>
                          {s.kategori === 'akhi' ? 'Akhi' :
                           s.kategori === 'akhwat' ? 'Akhwat' :
                           s.kategori === 'anak_anak' ? 'Anak-anak' : s.kategori || '—'}
                        </span>
                      </td>

                      {/* 🌟 IMPROVED: Email Pill Capsule */}
                      <td className="py-4 px-4">
                        <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700 group-hover:border-emerald-200 group-hover:bg-white transition-all shadow-2xs">
                          <div className="p-1 rounded-lg bg-emerald-100/60 text-emerald-800">
                            <Mail className="w-3 h-3" />
                          </div>
                          <span className="font-medium text-[11px] truncate max-w-[190px]">{emailSantri}</span>
                        </div>
                      </td>

                      {/* Orang Tua */}
                      <td className="py-4 px-4 text-slate-800 font-semibold">
                        {s.nama_orang_tua || '-'}
                      </td>

                      {/* No HP Ortu */}
                      <td className="py-4 px-4 text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="font-mono text-[11px] text-emerald-700 font-semibold">{s.no_hp_orang_tua || s.no_hp || '-'}</span>
                        </div>
                      </td>

                      {/* Tanggal Lahir */}
                      <td className="py-4 px-4 text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>
                            {s.tanggal_lahir
                              ? new Date(s.tanggal_lahir).toLocaleDateString('id-ID', {
                                  day: 'numeric', month: 'short', year: 'numeric',
                                })
                              : '-'}
                          </span>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-4 text-center">
                        <Badge value={s.status} />
                      </td>

                      {/* Action Buttons */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {s.status !== 'aktif' && (
                            <button
                              type="button"
                              onClick={() => handlePatchStatus(s.id, 'aktif')}
                              title="Set Aktif"
                              className="p-1.5 rounded-lg text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                          )}

                          {s.status !== 'alumni' && (
                            <button
                              type="button"
                              onClick={() => handlePatchStatus(s.id, 'alumni')}
                              title="Set Alumni"
                              className="p-1.5 rounded-lg text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => openEdit(s)}
                            title="Edit Data"
                            className="p-1.5 rounded-lg text-sky-600 bg-sky-50 hover:bg-sky-100 transition-colors cursor-pointer"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => openDelete(s)}
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

      {/* Pagination */}
      {!loading && santri.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={totalItems}
          perPage={perPage}
        />
      )}

      {/* Modal Tambah */}
      <Modal
        isOpen={modalCreate}
        onClose={() => setModalCreate(false)}
        title="Tambah Santri Baru"
        size="lg"
      >
        <FormSantri
          onSubmit={handleCreate}
          loading={actionLoading}
          error={formError}
        />
      </Modal>

      {/* Modal Edit */}
      <Modal
        isOpen={modalEdit}
        onClose={() => setModalEdit(false)}
        title="Edit Data Santri"
        size="lg"
      >
        <FormSantri
          initial={selectedSantri}
          onSubmit={handleEdit}
          loading={actionLoading}
          error={formError}
        />
      </Modal>

      {/* Modal Hapus */}
      <ConfirmDeleteModal
        isOpen={modalDelete}
        onClose={() => setModalDelete(false)}
        onConfirm={handleDelete}
        name={selectedSantri?.user?.name || selectedSantri?.nama || selectedSantri?.name}
        loading={actionLoading}
      />
    </div>
  )
}

export default ManajemenSantri