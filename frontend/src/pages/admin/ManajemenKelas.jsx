import React, { useEffect, useState, useCallback } from 'react'
import { Plus, Pencil, Trash2, RefreshCw, BookOpen, Users, Check } from 'lucide-react'
import api from '@/api/axios'
import Modal from '@/components/ui/Modal'
import Alert from '@/components/ui/Alert'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

// ── Form Kelas ───────────────────────────────────────────
const FormKelas = ({ initial, ustadzList, santriList, onSubmit, loading, error }) => {
  const [form, setForm] = useState({
    nama_kelas: '',
    program_belajar: '',
    kategori: 'akhi',
    ustadz_id: '',
    santri_ids: [],
    ...initial,
  })

  useEffect(() => {
    if (initial) {
      setForm({
        nama_kelas: initial.nama_kelas || '',
        program_belajar: initial.program_belajar || '',
        kategori: initial.kategori || 'akhi',
        ustadz_id: initial.ustadz_id ? String(initial.ustadz_id) : '',
        santri_ids: initial.santri_ids || initial.santri?.map((s) => s.id) || [],
        ...initial,
      })
    }
  }, [initial])

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  // Toggle santri di/dari kelas
  const toggleSantri = (id) => {
    setForm((prev) => {
      const currentIds = prev.santri_ids || []
      const ids = currentIds.includes(id)
        ? currentIds.filter((s) => s !== id)
        : [...currentIds, id]
      return { ...prev, santri_ids: ids }
    })
  }

  const isEdit = !!initial?.id

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form) }} className="space-y-4 pt-1">
      {error && <Alert type="error" message={error} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Nama Kelas */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Nama Kelas <span className="text-red-500">*</span>
          </label>
          <input
            name="nama_kelas"
            value={form.nama_kelas || ''}
            onChange={handleChange}
            placeholder="Kelas Tahsin Malam Rabu"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 text-sm transition-all"
            required
          />
        </div>

        {/* Program Belajar */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Program Belajar <span className="text-red-500">*</span>
          </label>
          <input
            name="program_belajar"
            value={form.program_belajar || ''}
            onChange={handleChange}
            placeholder="Tahfidz 30 Juz"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 text-sm transition-all"
            required
          />
        </div>

        {/* Kategori Kelas */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Kategori <span className="text-red-500">*</span>
          </label>
          <select
            name="kategori"
            value={form.kategori || 'akhi'}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 text-sm transition-all bg-white"
            required
          >
            <option value="akhi">Akhi (Laki-laki)</option>
            <option value="akhwat">Akhwat (Perempuan)</option>
            <option value="anak_anak">Anak-anak</option>
          </select>
        </div>

        {/* Ustadz Pengampu */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Ustadz Pengampu <span className="text-red-500">*</span>
          </label>
          <select
            name="ustadz_id"
            value={form.ustadz_id || ''}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 text-sm transition-all bg-white"
            required
          >
            <option value="">-- Pilih Ustadz Pengampu --</option>
            {(ustadzList || []).map((u) => (
              <option key={u.id} value={u.id}>
                {u.user?.name || u.nama || u.name || 'Ustadz'} — {u.bidang_ajar || '-'} ({u.nip || '-'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Pilih Santri (Checkbox) */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Daftarkan Santri ke Kelas Ini
          <span className="text-slate-400 font-normal ml-1">
            ({(form.santri_ids || []).length} dipilih)
          </span>
        </label>
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
          {(!santriList || santriList.length === 0) ? (
            <p className="text-center text-slate-400 text-sm py-6">
              Belum ada santri aktif tersedia.
            </p>
          ) : (
            <div className="max-h-48 overflow-y-auto divide-y divide-slate-100">
              {santriList.map((s) => {
                const checked = (form.santri_ids || []).includes(s.id)
                return (
                  <label
                    key={s.id}
                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors
                      ${checked ? 'bg-emerald-50/70' : 'hover:bg-slate-50'}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSantri(s.id)}
                      className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {s.user?.name || s.nama || s.name || '-'}
                      </p>
                      <p className="text-xs text-slate-400">{s.nis || '-'}</p>
                    </div>
                    {checked && (
                      <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 flex-shrink-0">
                        <Check className="w-3.5 h-3.5" /> Dipilih
                      </span>
                    )}
                  </label>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-3">
        <button 
          type="submit" 
          disabled={loading} 
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {loading
            ? <><LoadingSpinner size="sm" color="white" /> Menyimpan...</>
            : isEdit ? 'Simpan Perubahan' : 'Buat Kelas'
          }
        </button>
      </div>
    </form>
  )
}

// ── Main Component ───────────────────────────────────────
const ManajemenKelas = () => {
  const [kelas, setKelas]                 = useState([])
  const [ustadzList, setUstadzList]       = useState([])
  const [santriList, setSantriList]       = useState([])
  const [loading, setLoading]             = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError]                 = useState('')
  const [formError, setFormError]         = useState('')
  const [success, setSuccess]             = useState('')
  const [modalCreate, setModalCreate]     = useState(false)
  const [modalEdit, setModalEdit]         = useState(false)
  const [modalDelete, setModalDelete]     = useState(false)
  const [selected, setSelected]           = useState(null)

  // Helper aman ekstrak array dari response API
  const extractArray = (res) => {
    if (Array.isArray(res?.data)) return res.data
    if (Array.isArray(res?.data?.data)) return res.data.data
    if (Array.isArray(res?.data?.data?.data)) return res.data.data.data
    return []
  }

  // Fetch semua data yang dibutuhkan
  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [kelasRes, ustadzRes, santriRes] = await Promise.all([
        api.get('/admin/kelas'),
        api.get('/admin/ustadz'),
        api.get('/admin/santri', { params: { status: 'aktif' } }),
      ])
      
      setKelas(extractArray(kelasRes))
      setUstadzList(extractArray(ustadzRes))
      setSantriList(extractArray(santriRes))
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data kelas.')
      setKelas([])
      setUstadzList([])
      setSantriList([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(''), 4000)
      return () => clearTimeout(t)
    }
  }, [success])

  const openEdit = (k) => {
    setFormError('')
    setSelected({
      id:              k.id,
      nama_kelas:      k.nama_kelas || '',
      program_belajar: k.program_belajar || '',
      kategori:        k.kategori || 'akhi',
      ustadz_id:       k.ustadz_id ? String(k.ustadz_id) : '',
      santri_ids:      k.santri?.map((s) => s.id) || [],
    })
    setModalEdit(true)
  }

  const handleCreate = async (formData) => {
    setActionLoading(true)
    setFormError('')
    try {
      await api.post('/admin/kelas', {
        ...formData,
        kategori: formData.kategori || 'akhi',
        ustadz_id: formData.ustadz_id ? parseInt(formData.ustadz_id, 10) : null,
      })
      setSuccess('Kelas berhasil dibuat.')
      setModalCreate(false)
      fetchAll()
    } catch (err) {
      const errs = err.response?.data?.errors
      setFormError(errs ? Object.values(errs).flat().join(' ') : (err.response?.data?.message || 'Gagal membuat kelas'))
    } finally {
      setActionLoading(false)
    }
  }

  const handleEdit = async (formData) => {
    setActionLoading(true)
    setFormError('')
    try {
      await api.put(`/admin/kelas/${selected.id}`, {
        ...formData,
        kategori: formData.kategori || 'akhi',
        ustadz_id: formData.ustadz_id ? parseInt(formData.ustadz_id, 10) : null,
      })
      setSuccess('Kelas berhasil diperbarui.')
      setModalEdit(false)
      fetchAll()
    } catch (err) {
      const errs = err.response?.data?.errors
      setFormError(errs ? Object.values(errs).flat().join(' ') : (err.response?.data?.message || 'Gagal memperbarui kelas'))
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selected?.id) return
    setActionLoading(true)
    try {
      await api.delete(`/admin/kelas/${selected.id}`)
      setSuccess('Kelas berhasil dihapus.')
      setModalDelete(false)
      fetchAll()
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menghapus kelas.')
      setModalDelete(false)
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen Kelas</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Total {(kelas || []).length} kelas terdaftar
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchAll} 
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors flex items-center justify-center" 
            disabled={loading}
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => { setSelected(null); setFormError(''); setModalCreate(true) }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Kelas</span>
          </button>
        </div>
      </div>

      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}
      {error   && <Alert type="error"   message={error}   onClose={() => setError('')} />}

      {/* Grid Kartu Kelas */}
      {loading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : !kelas || kelas.length === 0 ? (
        <div className="card text-center py-16 text-slate-400">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Belum ada kelas terdaftar.</p>
          <p className="text-sm mt-1">Buat kelas pertama untuk mulai mengelola pembelajaran.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {kelas.map((k) => (
            <div
              key={k.id}
              className="card p-5 hover:shadow-md transition-shadow duration-200"
            >
              {/* Header kartu */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(k)}
                    className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                    title="Edit Kelas"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { setSelected(k); setModalDelete(true) }}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                    title="Hapus Kelas"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Info kelas */}
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-bold text-slate-800 text-base leading-tight">
                  {k.nama_kelas || '-'}
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                  k.kategori === 'akhi'       ? 'bg-sky-50 text-sky-700 border border-sky-200' :
                  k.kategori === 'akhwat'     ? 'bg-pink-50 text-pink-700 border border-pink-200' :
                  k.kategori === 'anak_anak'  ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                  'bg-slate-50 text-slate-600 border border-slate-200'
                }`}>
                  {k.kategori === 'akhi' ? 'Akhi' :
                   k.kategori === 'akhwat' ? 'Akhwat' :
                   k.kategori === 'anak_anak' ? 'Anak-anak' : '—'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4">{k.program_belajar || '-'}</p>

              {/* Ustadz pengampu */}
              <div className="flex items-center gap-2 mb-3 p-2.5 bg-teal-50 rounded-lg">
                <div className="w-6 h-6 bg-teal-100 rounded-md flex items-center justify-center flex-shrink-0">
                  <span className="text-teal-600 text-xs font-bold">U</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-teal-700 truncate">
                    {k.ustadz?.user?.name || k.ustadz?.nama || k.ustadz?.name || 'Belum ada pengampu'}
                  </p>
                  <p className="text-xs text-teal-500 truncate">
                    {k.ustadz?.bidang_ajar || '-'}
                  </p>
                </div>
              </div>

              {/* Jumlah santri */}
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Users className="w-3.5 h-3.5" />
                <span>
                  <span className="font-bold text-slate-700">
                    {k.santri?.length || 0}
                  </span>{' '}
                  santri terdaftar
                </span>
              </div>

              {/* Avatar santri */}
              {k.santri && k.santri.length > 0 && (
                <div className="flex items-center mt-3 gap-1">
                  {k.santri.slice(0, 5).map((s, i) => {
                    const santriName = s.user?.name || s.nama || s.name || 'S'
                    return (
                      <div
                        key={s.id || i}
                        className="w-7 h-7 rounded-full bg-emerald-200 border-2 border-white flex items-center justify-center -ml-1 first:ml-0"
                        style={{ zIndex: 5 - i }}
                        title={santriName}
                      >
                        <span className="text-emerald-700 text-xs font-bold">
                          {santriName[0]?.toUpperCase()}
                        </span>
                      </div>
                    )
                  })}
                  {k.santri.length > 5 && (
                    <div className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center -ml-1">
                      <span className="text-slate-500 text-xs font-bold">
                        +{k.santri.length - 5}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal Buat */}
      <Modal
        isOpen={modalCreate}
        onClose={() => setModalCreate(false)}
        title="Buat Kelas Baru"
        size="lg"
      >
        <FormKelas
          ustadzList={ustadzList}
          santriList={santriList}
          onSubmit={handleCreate}
          loading={actionLoading}
          error={formError}
        />
      </Modal>

      {/* Modal Edit */}
      <Modal
        isOpen={modalEdit}
        onClose={() => setModalEdit(false)}
        title="Edit Kelas"
        size="lg"
      >
        <FormKelas
          initial={selected}
          ustadzList={ustadzList}
          santriList={santriList}
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
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-slate-700 font-medium">
            Hapus kelas{' '}
            <span className="font-bold text-red-600">"{selected?.nama_kelas || 'Kelas'}"</span>?
          </p>
          <p className="text-slate-500 text-sm mt-2">
            Semua data absensi dan nilai di kelas ini akan ikut terhapus.
          </p>
        </div>
        <div className="flex gap-3 justify-center mt-6">
          <button
            onClick={() => setModalDelete(false)}
            className="btn-secondary"
            disabled={actionLoading}
          >
            Batal
          </button>
          <button
            onClick={handleDelete}
            className="btn-danger"
            disabled={actionLoading}
          >
            {actionLoading
              ? <><LoadingSpinner size="sm" color="white" /> Menghapus...</>
              : 'Ya, Hapus'
            }
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default ManajemenKelas