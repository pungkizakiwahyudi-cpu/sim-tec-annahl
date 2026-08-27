import React, { useEffect, useState, useCallback } from 'react'
import { Star, Plus, RefreshCw, BookOpen, ChevronDown } from 'lucide-react'
import api from '@/api/axios'
import Alert from '@/components/ui/Alert'
import Modal from '@/components/ui/Modal'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const UstadzNilaiHafalan = () => {
  const [kelasList, setKelasList]         = useState([])
  const [santriList, setSantriList]       = useState([])
  const [nilaiList, setNilaiList]         = useState([])
  const [selectedKelas, setSelectedKelas] = useState('')
  const [selectedSantri, setSelectedSantri] = useState('')
  const [loading, setLoading]             = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError]                 = useState('')
  const [formError, setFormError]         = useState('')
  const [success, setSuccess]             = useState('')
  const [modalForm, setModalForm]         = useState(false)

  const [form, setForm] = useState({
    kelas_id:     '',
    santri_id:    '',
    tanggal:      new Date().toISOString().split('T')[0],
    hafalan_baru: '',
    murojaah:     '',
    nilai_tajwid: '',
    catatan:      '',
  })

  // Fetch kelas
  useEffect(() => {
    const fetchKelas = async () => {
      try {
        const res = await api.get('/ustadz/kelas')
        setKelasList(res.data.data || [])
      } catch {
        setError('Gagal memuat daftar kelas.')
      }
    }
    fetchKelas()
  }, [])

  // Fetch santri saat kelas berubah
  useEffect(() => {
    const fetchSantri = async () => {
      if (!selectedKelas) { setSantriList([]); return }
      try {
        const res = await api.get(`/ustadz/kelas/${selectedKelas}/santri`)
        setSantriList(res.data.data?.santri || [])
      } catch {
        setSantriList([])
      }
    }
    fetchSantri()
  }, [selectedKelas])

  // Fetch nilai
  const fetchNilai = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (selectedKelas)  params.kelas_id  = selectedKelas
      if (selectedSantri) params.santri_id = selectedSantri
      const res = await api.get('/ustadz/nilai', { params })
      setNilaiList(res.data.data?.data || res.data.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data nilai.')
    } finally {
      setLoading(false)
    }
  }, [selectedKelas, selectedSantri])

  useEffect(() => { fetchNilai() }, [fetchNilai])

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(''), 4000)
      return () => clearTimeout(t)
    }
  }, [success])

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const openModal = () => {
    setFormError('')
    setForm({
      kelas_id:     selectedKelas || '',
      santri_id:    '',
      tanggal:      new Date().toISOString().split('T')[0],
      hafalan_baru: '',
      murojaah:     '',
      nilai_tajwid: '',
      catatan:      '',
    })
    setModalForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitLoading(true)
    setFormError('')
    try {
      await api.post('/ustadz/nilai', {
        ...form,
        kelas_id:     parseInt(form.kelas_id),
        santri_id:    parseInt(form.santri_id),
        nilai_tajwid: form.nilai_tajwid ? parseInt(form.nilai_tajwid) : null,
      })
      setSuccess('Nilai hafalan berhasil disimpan.')
      setModalForm(false)
      fetchNilai()
    } catch (err) {
      const errs = err.response?.data?.errors
      setFormError(errs ? Object.values(errs).flat().join(' ') : err.response?.data?.message)
    } finally {
      setSubmitLoading(false)
    }
  }

  // Santri dalam modal form — ikuti kelas yang dipilih di form
  const santriForForm = form.kelas_id
    ? kelasList.find((k) => String(k.id) === String(form.kelas_id))?.santri || []
    : []

  const getNilaiColor = (nilai) => {
    if (nilai >= 90) return 'text-emerald-600 bg-emerald-50'
    if (nilai >= 75) return 'text-blue-600 bg-blue-50'
    if (nilai >= 60) return 'text-amber-600 bg-amber-50'
    return 'text-red-600 bg-red-50'
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Nilai Hafalan</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Tracking perkembangan hafalan santri
          </p>
        </div>
        <button onClick={openModal} className="btn-primary">
          <Plus className="w-4 h-4" /> Input Nilai
        </button>
      </div>

      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}
      {error   && <Alert type="error"   message={error}   onClose={() => setError('')} />}

      {/* Filter */}
      <div className="card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="form-label text-xs">Filter Kelas</label>
            <div className="relative">
              <select
                value={selectedKelas}
                onChange={(e) => { setSelectedKelas(e.target.value); setSelectedSantri('') }}
                className="input-field appearance-none pr-8"
              >
                <option value="">Semua Kelas</option>
                {kelasList.map((k) => (
                  <option key={k.id} value={String(k.id)}>{k.nama_kelas}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="form-label text-xs">Filter Santri</label>
            <div className="relative">
              <select
                value={selectedSantri}
                onChange={(e) => setSelectedSantri(e.target.value)}
                className="input-field appearance-none pr-8"
                disabled={!selectedKelas}
              >
                <option value="">Semua Santri</option>
                {santriList.map((s) => (
                  <option key={s.id} value={String(s.id)}>{s.user?.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-end">
            <button onClick={fetchNilai} className="btn-secondary w-full" disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Tabel Nilai */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : nilaiList.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Star className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Belum ada data nilai hafalan.</p>
          </div>
        ) : (
          <>
          {/* Tampilan Kartu (Mobile) */}
          <div className="lg:hidden divide-y divide-slate-100">
            {nilaiList.map((n) => (
              <div key={n.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate">
                      {n.santri?.user?.name}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {n.kelas?.nama_kelas}
                    </p>
                  </div>
                  {n.nilai_tajwid != null ? (
                    <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold shrink-0 ${getNilaiColor(n.nilai_tajwid)}`}>
                      {n.nilai_tajwid}
                    </span>
                  ) : (
                    <span className="text-slate-300 text-sm shrink-0">—</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div>
                    <p className="text-slate-400 font-medium">Tanggal</p>
                    <p className="font-medium text-slate-700 mt-0.5">
                      {new Date(n.tanggal).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium">Hafalan Baru</p>
                    <p className="text-slate-700 mt-0.5 truncate" title={n.hafalan_baru}>
                      {n.hafalan_baru || <span className="text-slate-300">—</span>}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium">Murojaah</p>
                    <p className="text-slate-700 mt-0.5 truncate" title={n.murojaah}>
                      {n.murojaah || <span className="text-slate-300">—</span>}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium">Catatan</p>
                    <p className="text-slate-500 mt-0.5 truncate" title={n.catatan}>
                      {n.catatan || <span className="text-slate-300">—</span>}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tampilan Tabel (Desktop) */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="th">Tanggal</th>
                  <th className="th">Santri</th>
                  <th className="th">Kelas</th>
                  <th className="th">Hafalan Baru</th>
                  <th className="th">Murojaah</th>
                  <th className="th text-center">Nilai Tajwid</th>
                  <th className="th">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {nilaiList.map((n) => (
                  <tr key={n.id} className="hover:bg-slate-50 transition-colors">
                    <td className="td whitespace-nowrap">
                      {new Date(n.tanggal).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </td>
                    <td className="td font-semibold text-slate-800">
                      {n.santri?.user?.name}
                    </td>
                    <td className="td text-slate-500 text-xs">
                      {n.kelas?.nama_kelas}
                    </td>
                    <td className="td max-w-[160px]">
                      <p className="text-sm truncate" title={n.hafalan_baru}>
                        {n.hafalan_baru || <span className="text-slate-300">—</span>}
                      </p>
                    </td>
                    <td className="td max-w-[160px]">
                      <p className="text-sm truncate" title={n.murojaah}>
                        {n.murojaah || <span className="text-slate-300">—</span>}
                      </p>
                    </td>
                    <td className="td text-center">
                      {n.nilai_tajwid != null ? (
                        <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold ${getNilaiColor(n.nilai_tajwid)}`}>
                          {n.nilai_tajwid}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="td max-w-[180px]">
                      <p className="text-xs text-slate-500 truncate" title={n.catatan}>
                        {n.catatan || <span className="text-slate-300">—</span>}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}
      </div>

      {/* Modal Input Nilai */}
      <Modal
        isOpen={modalForm}
        onClose={() => setModalForm(false)}
        title="Input Nilai Hafalan"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <Alert type="error" message={formError} />}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Kelas */}
            <div>
              <label className="form-label">Kelas <span className="text-red-500">*</span></label>
              <select
                name="kelas_id"
                value={form.kelas_id}
                onChange={(e) => {
                  handleChange(e)
                  setForm((prev) => ({ ...prev, santri_id: '' }))
                }}
                className="input-field"
                required
              >
                <option value="">-- Pilih Kelas --</option>
                {kelasList.map((k) => (
                  <option key={k.id} value={String(k.id)}>{k.nama_kelas}</option>
                ))}
              </select>
            </div>

            {/* Santri */}
            <div>
              <label className="form-label">Santri <span className="text-red-500">*</span></label>
              <select
                name="santri_id"
                value={form.santri_id}
                onChange={handleChange}
                className="input-field"
                required
                disabled={!form.kelas_id}
              >
                <option value="">-- Pilih Santri --</option>
                {santriForForm.map((s) => (
                  <option key={s.id} value={String(s.id)}>{s.user?.name}</option>
                ))}
              </select>
            </div>

            {/* Tanggal */}
            <div>
              <label className="form-label">Tanggal <span className="text-red-500">*</span></label>
              <input
                type="date"
                name="tanggal"
                value={form.tanggal}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                className="input-field"
                required
              />
            </div>

            {/* Nilai Tajwid */}
            <div>
              <label className="form-label">
                Nilai Tajwid
                <span className="text-slate-400 font-normal ml-1">(0–100)</span>
              </label>
              <input
                type="number"
                name="nilai_tajwid"
                value={form.nilai_tajwid}
                onChange={handleChange}
                min="0"
                max="100"
                placeholder="85"
                className="input-field"
              />
            </div>

            {/* Hafalan Baru */}
            <div>
              <label className="form-label">Hafalan Baru</label>
              <input
                name="hafalan_baru"
                value={form.hafalan_baru}
                onChange={handleChange}
                placeholder="Q.S Al-Baqarah ayat 1-5"
                className="input-field"
              />
            </div>

            {/* Murojaah */}
            <div>
              <label className="form-label">Murojaah</label>
              <input
                name="murojaah"
                value={form.murojaah}
                onChange={handleChange}
                placeholder="Q.S Al-Fatihah, An-Nas"
                className="input-field"
              />
            </div>
          </div>

          {/* Catatan */}
          <div>
            <label className="form-label">Catatan Ustadz</label>
            <textarea
              name="catatan"
              value={form.catatan}
              onChange={handleChange}
              placeholder="Catatan perkembangan santri..."
              className="input-field resize-none"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalForm(false)}
              className="btn-secondary"
              disabled={submitLoading}
            >
              Batal
            </button>
            <button type="submit" className="btn-primary" disabled={submitLoading}>
              {submitLoading
                ? <><LoadingSpinner size="sm" color="white" /> Menyimpan...</>
                : <><Star className="w-4 h-4" /> Simpan Nilai</>
              }
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default UstadzNilaiHafalan