import React, { useEffect, useState, useCallback } from 'react'
import {
  BookOpen, Plus, RefreshCw, Trash2, Pencil,
  CheckCircle2, AlertCircle, X,
} from 'lucide-react'
import api from '@/api/axios'
import Alert from '@/components/ui/Alert'
import Modal from '@/components/ui/Modal'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

// ── Daftar Huruf Hijaiyah ────────────────────────────────
const HURUF_HIJAIYAH = [
  'ا', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز',
  'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك',
  'ل', 'م', 'ن', 'و', 'ه', 'ء', 'ي',
]

// ── Modal Tambah/Edit Catatan ────────────────────────────
const ModalCatatan = ({ isOpen, onClose, initial, onSubmit, loading, error }) => {
  const [form, setForm] = useState({
    huruf: '',
    catatan: '',
    tanggal: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    if (isOpen) {
      setForm({
        huruf: initial?.huruf || '',
        catatan: initial?.catatan || '',
        tanggal: initial?.tanggal?.split('T')[0] || new Date().toISOString().split('T')[0],
      })
    }
  }, [isOpen, initial])

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(form)
  }

  const isEdit = !!initial?.id

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Catatan Hijaiyah' : 'Tambah Catatan Hijaiyah'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {error && <Alert type="error" message={error} />}

        {/* Pilih Huruf Hijaiyah */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Pilih Huruf Hijaiyah <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
            {HURUF_HIJAIYAH.map((huruf) => (
              <button
                key={huruf}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, huruf }))}
                className={`
                  w-full aspect-square rounded-xl text-2xl font-bold flex items-center justify-center
                  transition-all duration-200 border-2
                  ${form.huruf === huruf
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-md scale-105'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50'
                  }
                `}
              >
                {huruf}
              </button>
            ))}
          </div>
          {form.huruf && (
            <p className="text-xs text-emerald-600 font-semibold mt-2">
              ✓ Huruf terpilih: <span className="text-lg font-bold">{form.huruf}</span>
            </p>
          )}
        </div>

        {/* Tanggal */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Tanggal <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="tanggal"
            value={form.tanggal}
            onChange={handleChange}
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 text-sm transition-all"
            required
          />
        </div>

        {/* Catatan Kesalahan */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Catatan Kesalahan Membaca <span className="text-red-500">*</span>
          </label>
          <textarea
            name="catatan"
            value={form.catatan}
            onChange={handleChange}
            placeholder="Contoh: Saat membaca huruf ini, saya masih keliru dalam makhraj (tempat keluarnya huruf)..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 text-sm transition-all resize-none"
            rows={4}
            maxLength={1000}
            required
          />
          <p className="text-xs text-slate-400 mt-1 text-right">
            {form.catatan.length}/1000
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-semibold transition-colors"
            disabled={loading}
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
            disabled={loading || !form.huruf}
          >
            {loading ? (
              <><LoadingSpinner size="sm" color="white" /> Menyimpan...</>
            ) : (
              <><CheckCircle2 className="w-4 h-4" /> {isEdit ? 'Simpan Perubahan' : 'Simpan Catatan'}</>
            )}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ── Modal Konfirmasi Hapus ───────────────────────────────
const ModalHapus = ({ isOpen, onClose, onConfirm, loading }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Konfirmasi Hapus" size="sm">
    <div className="text-center py-2">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Trash2 className="w-8 h-8 text-red-500" />
      </div>
      <p className="text-slate-700 font-medium">
        Hapus catatan hijaiyah ini?
      </p>
      <p className="text-slate-500 text-sm mt-2">
        Catatan yang dihapus tidak dapat dikembalikan.
      </p>
    </div>
    <div className="flex gap-3 justify-center mt-6">
      <button
        onClick={onClose}
        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
        disabled={loading}
      >
        Batal
      </button>
      <button
        onClick={onConfirm}
        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors flex items-center gap-2"
        disabled={loading}
      >
        {loading ? <><LoadingSpinner size="sm" color="white" /> Menghapus...</> : 'Ya, Hapus'}
      </button>
    </div>
  </Modal>
)

// ── Main Component ───────────────────────────────────────
const CatatanHijaiyah = () => {
  const [catatanList, setCatatanList]     = useState([])
  const [loading, setLoading]             = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError]                 = useState('')
  const [formError, setFormError]         = useState('')
  const [success, setSuccess]             = useState('')
  const [filterHuruf, setFilterHuruf]     = useState('')
  const [modalCreate, setModalCreate]     = useState(false)
  const [modalEdit, setModalEdit]         = useState(false)
  const [modalDelete, setModalDelete]     = useState(false)
  const [selectedCatatan, setSelectedCatatan] = useState(null)

  const fetchCatatan = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (filterHuruf) params.huruf = filterHuruf
      const res = await api.get('/santri/hijaiyah/catatan', { params })
      setCatatanList(res.data.data?.catatan || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat catatan hijaiyah.')
    } finally {
      setLoading(false)
    }
  }, [filterHuruf])

  useEffect(() => { fetchCatatan() }, [fetchCatatan])

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(''), 4000)
      return () => clearTimeout(t)
    }
  }, [success])

  const handleCreate = async (form) => {
    setActionLoading(true)
    setFormError('')
    try {
      await api.post('/santri/hijaiyah/catatan', form)
      setSuccess('Catatan hijaiyah berhasil disimpan.')
      setModalCreate(false)
      fetchCatatan()
    } catch (err) {
      const errs = err.response?.data?.errors
      setFormError(errs ? Object.values(errs).flat().join(' ') : (err.response?.data?.message || 'Gagal menyimpan catatan.'))
    } finally {
      setActionLoading(false)
    }
  }

  const handleEdit = async (form) => {
    setActionLoading(true)
    setFormError('')
    try {
      await api.put(`/santri/hijaiyah/catatan/${selectedCatatan.id}`, form)
      setSuccess('Catatan hijaiyah berhasil diperbarui.')
      setModalEdit(false)
      fetchCatatan()
    } catch (err) {
      const errs = err.response?.data?.errors
      setFormError(errs ? Object.values(errs).flat().join(' ') : (err.response?.data?.message || 'Gagal memperbarui catatan.'))
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    setActionLoading(true)
    try {
      await api.delete(`/santri/hijaiyah/catatan/${selectedCatatan.id}`)
      setSuccess('Catatan hijaiyah berhasil dihapus.')
      setModalDelete(false)
      fetchCatatan()
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menghapus catatan.')
      setModalDelete(false)
    } finally {
      setActionLoading(false)
    }
  }

  const openEdit = (catatan) => {
    setFormError('')
    setSelectedCatatan(catatan)
    setModalEdit(true)
  }

  const openDelete = (catatan) => {
    setSelectedCatatan(catatan)
    setModalDelete(true)
  }

  const formatTanggal = (tanggal) => {
    if (!tanggal) return '-'
    return new Date(tanggal).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Catatan Hijaiyah</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Catat kesalahan membaca huruf hijaiyah untuk perbaikan
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchCatatan}
            className="btn-secondary"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => { setFormError(''); setModalCreate(true) }}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" /> Tambah Catatan
          </button>
        </div>
      </div>

      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}
      {error   && <Alert type="error"   message={error}   onClose={() => setError('')} />}

      {/* Info */}
      <Alert
        type="info"
        message="Pilih huruf hijaiyah yang sedang dipelajari, lalu tuliskan kesalahan yang Anda alami saat membacanya. Catatan ini membantu Anda memantau perkembangan belajar."
      />

      {/* Filter Huruf */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <label className="form-label text-xs">Filter Huruf</label>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              <button
                onClick={() => setFilterHuruf('')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                  filterHuruf === ''
                    ? 'bg-emerald-600 text-white border-emerald-700'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Semua
              </button>
              {HURUF_HIJAIYAH.map((huruf) => (
                <button
                  key={huruf}
                  onClick={() => setFilterHuruf(huruf)}
                  className={`w-9 h-9 rounded-lg text-lg font-bold transition-all border ${
                    filterHuruf === huruf
                      ? 'bg-emerald-600 text-white border-emerald-700'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50 hover:border-emerald-300'
                  }`}
                >
                  {huruf}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Daftar Catatan */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-500" />
          <h3 className="font-bold text-slate-800 text-sm">
            Riwayat Catatan
            {catatanList.length > 0 && (
              <span className="text-slate-400 font-normal ml-1">
                ({catatanList.length} catatan)
              </span>
            )}
          </h3>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : catatanList.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Belum ada catatan hijaiyah.</p>
            <p className="text-sm mt-1">Klik "Tambah Catatan" untuk mulai mencatat.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {catatanList.map((catatan) => (
              <div key={catatan.id} className="px-5 py-4 hover:bg-slate-50/60 transition-colors">
                <div className="flex items-start gap-4">
                  {/* Huruf besar */}
                  <div className="w-14 h-14 bg-emerald-50 border-2 border-emerald-200 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <span className="text-3xl font-bold text-emerald-700">
                      {catatan.huruf}
                    </span>
                  </div>

                  {/* Konten */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs text-slate-400 font-medium">
                          {formatTanggal(catatan.tanggal)}
                        </p>
                        <p className="text-sm text-slate-700 mt-1.5 leading-relaxed">
                          {catatan.catatan}
                        </p>
                      </div>

                      {/* Aksi */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => openEdit(catatan)}
                          className="p-1.5 rounded-lg text-sky-600 bg-sky-50 hover:bg-sky-100 transition-colors"
                          title="Edit Catatan"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDelete(catatan)}
                          className="p-1.5 rounded-lg text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
                          title="Hapus Catatan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Tambah */}
      <ModalCatatan
        isOpen={modalCreate}
        onClose={() => setModalCreate(false)}
        onSubmit={handleCreate}
        loading={actionLoading}
        error={formError}
      />

      {/* Modal Edit */}
      <ModalCatatan
        isOpen={modalEdit}
        onClose={() => setModalEdit(false)}
        initial={selectedCatatan}
        onSubmit={handleEdit}
        loading={actionLoading}
        error={formError}
      />

      {/* Modal Hapus */}
      <ModalHapus
        isOpen={modalDelete}
        onClose={() => setModalDelete(false)}
        onConfirm={handleDelete}
        loading={actionLoading}
      />
    </div>
  )
}

export default CatatanHijaiyah