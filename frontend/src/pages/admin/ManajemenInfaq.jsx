import React, { useEffect, useState, useCallback } from 'react'
import {
  Wallet,
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
  ChevronDown,
  Eye,
  Banknote,
  Check,
  X,
  Filter,
  Settings2,
  Download,
} from 'lucide-react'
import api from '@/api/axios'
import Alert from '@/components/ui/Alert'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Pagination from '@/components/ui/Pagination'

// ── Modal Generate Tagihan ───────────────────────────────
const ModalGenerate = ({ isOpen, onClose, onSubmit, loading, error }) => {
  const now = new Date()
  const [form, setForm] = useState({
    bulan: String(now.getMonth() + 1),
    tahun: String(now.getFullYear()),
    jumlah: '150000',
    kategori: '',
  })

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const namaBulan = [
    '',
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generate Tagihan Infaq"
      size="sm"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit(form)
        }}
        className="space-y-4 pt-1"
      >
        {error && <Alert type="error" message={error} />}

        <Alert
          type="info"
          message="Pilih kategori terlebih dahulu. Generate akan membuat tagihan infaq hanya untuk santri berstatus AKTIF pada kategori yang dipilih."
        />

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Kategori <span className="text-red-500">*</span>
          </label>
          <select
            name="kategori"
            value={form.kategori}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 text-sm transition-all bg-white"
            required
          >
            <option value="">-- Pilih Kategori --</option>
            <option value="akhi">Akhi</option>
            <option value="akhwat">Akhwat</option>
            <option value="anak_anak">Anak-anak</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Bulan <span className="text-red-500">*</span>
          </label>
          <select
            name="bulan"
            value={form.bulan}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 text-sm transition-all bg-white"
            required
          >
            {namaBulan.slice(1).map((n, i) => (
              <option key={i + 1} value={String(i + 1)}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Tahun <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="tahun"
            value={form.tahun}
            onChange={handleChange}
            min="2020"
            max="2099"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 text-sm transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Jumlah Infaq (Rp) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="jumlah"
            value={form.jumlah}
            onChange={handleChange}
            min="0"
            step="1000"
            placeholder="150000"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 text-sm transition-all"
            required
          />
        </div>

        <div className="flex justify-end gap-3 pt-3">
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
            disabled={loading}
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" color="white" /> Memproses...
              </>
            ) : (
              <>
                <Banknote className="w-4 h-4" /> Generate Tagihan
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ── Modal Atur Tarif Infaq per Kategori ─────────────────
const ModalAturTarif = ({ isOpen, onClose, onSave, loading, error }) => {
  const [tarif, setTarif] = useState({
    akhi: 150000,
    akhwat: 150000,
    anak_anak: 100000,
  })
  const [fetchLoading, setFetchLoading] = useState(true)

  // Fetch tarif saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      setFetchLoading(true)
      api.get('/admin/infaq/tarif')
        .then((res) => {
          const data = res.data?.data || {}
          setTarif({
            akhi:      parseFloat(data.akhi?.nominal)      || 150000,
            akhwat:    parseFloat(data.akhwat?.nominal)    || 150000,
            anak_anak: parseFloat(data.anak_anak?.nominal) || 100000,
          })
        })
        .catch(() => {
          // Fallback ke nilai default
          setTarif({ akhi: 150000, akhwat: 150000, anak_anak: 100000 })
        })
        .finally(() => setFetchLoading(false))
    }
  }, [isOpen])

  const handleChange = (key, value) => {
    setTarif((prev) => ({ ...prev, [key]: value ? parseInt(value, 10) : 0 }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(tarif)
  }

  const formatRupiah = (amount) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
    }).format(amount || 0)

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Atur Tarif Infaq per Kategori" size="md">
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {error && <Alert type="error" message={error} />}

        <Alert
          type="info"
          message="Tarif infaq berbeda untuk setiap kategori. Tarif ini digunakan saat generate tagihan bulanan."
        />

        {fetchLoading ? (
          <div className="flex justify-center py-10">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Akhi */}
            <div className="bg-sky-50 border border-sky-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">A</div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">Akhi (Laki-laki)</p>
                    <p className="text-xs text-slate-500">{formatRupiah(tarif.akhi)}</p>
                  </div>
                </div>
              </div>
              <input
                type="number"
                value={tarif.akhi}
                onChange={(e) => handleChange('akhi', e.target.value)}
                min="0"
                step="1000"
                placeholder="150000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-800 text-sm transition-all bg-white"
                required
              />
            </div>

            {/* Akhwat */}
            <div className="bg-pink-50 border border-pink-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">A</div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">Akhwat (Perempuan)</p>
                    <p className="text-xs text-slate-500">{formatRupiah(tarif.akhwat)}</p>
                  </div>
                </div>
              </div>
              <input
                type="number"
                value={tarif.akhwat}
                onChange={(e) => handleChange('akhwat', e.target.value)}
                min="0"
                step="1000"
                placeholder="150000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 text-slate-800 text-sm transition-all bg-white"
                required
              />
            </div>

            {/* Anak-anak */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">A</div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">Anak-anak</p>
                    <p className="text-xs text-slate-500">{formatRupiah(tarif.anak_anak)}</p>
                  </div>
                </div>
              </div>
              <input
                type="number"
                value={tarif.anak_anak}
                onChange={(e) => handleChange('anak_anak', e.target.value)}
                min="0"
                step="1000"
                placeholder="100000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-800 text-sm transition-all bg-white"
                required
              />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-3">
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
            disabled={loading || fetchLoading}
          >
            {loading ? (
              <><LoadingSpinner size="sm" color="white" /> Menyimpan...</>
            ) : (
              <><Check className="w-4 h-4" /> Simpan Tarif</>
            )}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ── Modal Detail Bukti Transfer ──────────────────────────
const ModalBukti = ({ isOpen, onClose, infaq }) => {
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    setImgError(false)
  }, [infaq])

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bukti Transfer" size="md">
      {infaq && (
        <div className="space-y-4 pt-1">
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-sm">
            <div>
              <p className="text-slate-400 text-xs font-medium">Santri</p>
              <p className="font-semibold text-slate-800">
                {infaq.santri?.user?.name ||
                  infaq.santri?.nama ||
                  infaq.santri?.name ||
                  '-'}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium">Periode</p>
              <p className="font-semibold text-slate-800">
                {infaq.nama_bulan || infaq.bulan} {infaq.tahun}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium">Jumlah</p>
              <p className="font-bold text-emerald-600">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                }).format(infaq.jumlah || 0)}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium mb-0.5">Status</p>
              <Badge value={infaq.status} />
            </div>
          </div>

          {infaq.bukti_transfer ? (
            <div className="border border-slate-200 rounded-xl overflow-hidden p-2 bg-slate-900/5">
              {!imgError ? (
                <img
                  src={infaq.bukti_transfer}
                  alt="Bukti Transfer"
                  className="w-full object-contain max-h-96 rounded-lg"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-slate-400 text-sm">
                  <p className="text-center">
                    File tidak dapat ditampilkan langsung (mungkin format PDF/dokumen).
                  </p>
                  <a
                    href={infaq.bukti_transfer}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 hover:text-emerald-700 underline font-semibold mt-2"
                  >
                    Buka File di Tab Baru
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 border border-dashed border-slate-200 rounded-xl">
              <XCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Belum ada bukti transfer yang diunggah.</p>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}

// ── Main Component ───────────────────────────────────────
const ManajemenInfaq = () => {
  const [infaq, setInfaq]                 = useState([])
  const [loading, setLoading]             = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError]                 = useState('')
  const [genError, setGenError]           = useState('')
  const [success, setSuccess]             = useState('')
  const [filterStatus, setFilterStatus]   = useState('')
  const [filterBulan, setFilterBulan]     = useState('')
  const [filterTahun, setFilterTahun]     = useState('')
  const [modalGenerate, setModalGenerate] = useState(false)
  const [modalTarif, setModalTarif]       = useState(false)
  const [tarifLoading, setTarifLoading]   = useState(false)
  const [tarifError, setTarifError]       = useState('')
  const [modalBukti, setModalBukti]       = useState(false)
  const [selectedInfaq, setSelectedInfaq] = useState(null)
  const [currentPage, setCurrentPage]     = useState(1)
  const [totalPages, setTotalPages]       = useState(1)
  const [totalItems, setTotalItems]       = useState(0)
  const perPage = 20

  const namaBulan = [
    '',
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ]

  const fetchInfaq = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = { per_page: perPage, page: currentPage }
      if (filterStatus) params.status = filterStatus
      if (filterBulan)  params.bulan  = filterBulan
      if (filterTahun)  params.tahun  = filterTahun
      const res = await api.get('/admin/infaq', { params })

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

      setInfaq(extractedData)
      if (paginationData) {
        setTotalPages(paginationData.last_page || 1)
        setTotalItems(paginationData.total || extractedData.length)
      } else {
        setTotalPages(1)
        setTotalItems(extractedData.length)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data infaq.')
      setInfaq([])
    } finally {
      setLoading(false)
    }
  }, [filterStatus, filterBulan, filterTahun, currentPage])

  useEffect(() => {
    fetchInfaq()
  }, [fetchInfaq])

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(''), 4000)
      return () => clearTimeout(t)
    }
  }, [success])

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.patch(`/admin/infaq/${id}/status`, { status })
      setSuccess(
        `Status infaq berhasil diubah menjadi ${status.replace('_', ' ')}.`
      )
      fetchInfaq()
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengubah status infaq.')
    }
  }

  const handleGenerate = async (form) => {
    setActionLoading(true)
    setGenError('')
    try {
      const res = await api.post('/admin/infaq/generate', {
        bulan: parseInt(form.bulan, 10),
        tahun: parseInt(form.tahun, 10),
        jumlah: parseFloat(form.jumlah),
        kategori: form.kategori || undefined,
      })
      setSuccess(res.data?.message || 'Tagihan infaq berhasil dibuat.')
      setModalGenerate(false)
      fetchInfaq()
    } catch (err) {
      setGenError(err.response?.data?.message || 'Gagal generate tagihan.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleSaveTarif = async (tarif) => {
    setTarifLoading(true)
    setTarifError('')
    try {
      await api.put('/admin/infaq/tarif', { tarif })
      setSuccess('Tarif infaq per kategori berhasil diperbarui.')
      setModalTarif(false)
      fetchInfaq()
    } catch (err) {
      const errs = err.response?.data?.errors
      setTarifError(errs ? Object.values(errs).flat().join(' ') : (err.response?.data?.message || 'Gagal menyimpan tarif.'))
    } finally {
      setTarifLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      const params = {}
      if (filterBulan) params.bulan = filterBulan
      if (filterTahun) params.tahun = filterTahun
      if (filterStatus) params.status = filterStatus

      const res = await api.get('/admin/laporan/infaq', {
        params,
        responseType: 'blob',
      })

      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `laporan_infaq_${Date.now()}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError('Gagal export laporan infaq. Periksa kembali data atau filter Anda.')
    }
  }

  const formatRupiah = (amount) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount || 0)

  const safeInfaqList = Array.isArray(infaq) ? infaq : []
  
  // Kalkulasi statistik dengan dukungan status 'pending'
  const totalLunas = safeInfaqList.filter((i) => i.status === 'lunas').length
  const totalProses = safeInfaqList.filter(
    (i) => i.status === 'proses_verifikasi'
  ).length
  const totalBelumLunas = safeInfaqList.filter(
    (i) => i.status === 'belum_lunas' || i.status === 'pending'
  ).length
  const totalNominalLunas = safeInfaqList
    .filter((i) => i.status === 'lunas')
    .reduce((sum, i) => sum + parseFloat(i.jumlah || 0), 0)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Kelola Infaq</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Total <span className="font-semibold text-slate-700">{safeInfaqList.length}</span> tagihan tercatat
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchInfaq}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors flex items-center justify-center"
            disabled={loading}
            title="Refresh Data"
          >
            <RefreshCw
              className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
            />
          </button>
          <button
            onClick={() => { setTarifError(''); setModalTarif(true) }}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
            title="Atur Tarif per Kategori"
          >
            <Settings2 className="w-4 h-4" />
            <span>Atur Tarif</span>
          </button>
          <button
            onClick={handleExport}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
            title="Export Laporan Infaq (PDF)"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button
            onClick={() => setModalGenerate(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <Banknote className="w-4 h-4" />
            <span>Generate Tagihan</span>
          </button>
        </div>
      </div>

      {success && (
        <Alert type="success" message={success} onClose={() => setSuccess('')} />
      )}
      {error && (
        <Alert type="error" message={error} onClose={() => setError('')} />
      )}

      {/* Kartu Ringkasan */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Lunas',
            value: totalLunas,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50/70 border-emerald-100',
            icon: CheckCircle,
          },
          {
            label: 'Proses Verifikasi',
            value: totalProses,
            color: 'text-amber-600',
            bg: 'bg-amber-50/70 border-amber-100',
            icon: Clock,
          },
          {
            label: 'Belum Lunas',
            value: totalBelumLunas,
            color: 'text-rose-600',
            bg: 'bg-rose-50/70 border-rose-100',
            icon: XCircle,
          },
          {
            label: 'Total Terkumpul',
            value: formatRupiah(totalNominalLunas),
            color: 'text-blue-600',
            bg: 'bg-blue-50/70 border-blue-100',
            icon: Wallet,
          },
        ].map((item) => (
          <div key={item.label} className={`p-4 rounded-2xl border ${item.bg} transition-all`}>
            <div className="flex items-center gap-2 mb-1.5">
              <item.icon className={`w-4 h-4 ${item.color}`} />
              <p className="text-xs font-semibold text-slate-500 truncate">
                {item.label}
              </p>
            </div>
            <p className={`text-xl sm:text-2xl font-bold ${item.color} tracking-tight`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5" /> Filter Data
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 sm:flex-none sm:w-48">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 text-sm transition-all appearance-none bg-white pr-9"
            >
              <option value="">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="belum_lunas">Belum Lunas</option>
              <option value="proses_verifikasi">Proses Verifikasi</option>
              <option value="lunas">Lunas</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative flex-1 sm:flex-none sm:w-44">
            <select
              value={filterBulan}
              onChange={(e) => setFilterBulan(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 text-sm transition-all appearance-none bg-white pr-9"
            >
              <option value="">Semua Bulan</option>
              {namaBulan.slice(1).map((n, i) => (
                <option key={i + 1} value={String(i + 1)}>
                  {n}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          <div className="w-full sm:w-36">
            <input
              type="number"
              value={filterTahun}
              onChange={(e) => setFilterTahun(e.target.value)}
              placeholder="Tahun (2026)"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 text-sm transition-all"
              min="2020"
              max="2099"
            />
          </div>
        </div>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : safeInfaqList.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Wallet className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium text-slate-600">Tidak ada data infaq ditemukan.</p>
            <p className="text-xs text-slate-400 mt-1">Coba sesuaikan filter atau buat tagihan baru.</p>
          </div>
        ) : (
          <>
          {/* Tampilan Kartu (Mobile) */}
          <div className="lg:hidden divide-y divide-slate-100">
            {safeInfaqList.map((item, idx) => (
              <div key={item.id || idx} className="p-4 hover:bg-slate-50/80 transition-colors">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate">
                      {item.santri?.user?.name || item.santri?.nama || item.santri?.name || '-'}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      NIS: {item.santri?.nis || '-'}
                    </p>
                  </div>
                  <Badge value={item.status} />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div>
                    <p className="text-slate-400 font-medium">Kategori</p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold border mt-0.5 ${
                      item.kategori === 'akhi'       ? 'bg-sky-50 text-sky-700 border-sky-200' :
                      item.kategori === 'akhwat'     ? 'bg-pink-50 text-pink-700 border-pink-200' :
                      item.kategori === 'anak_anak'  ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-slate-50 text-slate-600 border-slate-200'
                    }`}>
                      {item.kategori_label || item.kategori || '—'}
                    </span>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium">Periode</p>
                    <p className="font-medium text-slate-700 mt-0.5">
                      {namaBulan[parseInt(item.bulan, 10)] || item.bulan} {item.tahun}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium">Jumlah</p>
                    <p className="font-bold text-emerald-600 mt-0.5">{formatRupiah(item.jumlah)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium">Bukti</p>
                    {item.bukti_transfer ? (
                      <button
                        onClick={() => {
                          setSelectedInfaq(item)
                          setModalBukti(true)
                        }}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold text-xs transition-colors mt-0.5"
                      >
                        <Eye className="w-3 h-3" />
                        Lihat
                      </button>
                    ) : (
                      <span className="text-xs text-slate-300 font-medium">—</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                  {item.status !== 'lunas' && (
                    <button
                      onClick={() => handleUpdateStatus(item.id, 'lunas')}
                      title="Konfirmasi Lunas"
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-lg hover:bg-emerald-100 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Lunas
                    </button>
                  )}
                  {item.status !== 'belum_lunas' && (
                    <button
                      onClick={() => handleUpdateStatus(item.id, 'belum_lunas')}
                      title="Tandai Belum Lunas"
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/60 rounded-lg hover:bg-rose-100 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      Batalkan
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Tampilan Tabel (Desktop) */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5 w-12 text-center">No</th>
                  <th className="px-5 py-3.5">Santri</th>
                  <th className="px-5 py-3.5">Kategori</th>
                  <th className="px-5 py-3.5">Periode</th>
                  <th className="px-5 py-3.5">Jumlah</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Bukti</th>
                  <th className="px-5 py-3.5 text-center">Ubah Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {safeInfaqList.map((item, idx) => (
                  <tr
                    key={item.id || idx}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-5 py-4 text-center text-slate-400 text-xs font-medium">
                      {idx + 1}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">
                        {item.santri?.user?.name ||
                          item.santri?.nama ||
                          item.santri?.name ||
                          '-'}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        NIS: {item.santri?.nis || '-'}
                      </p>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                        item.kategori === 'akhi'       ? 'bg-sky-50 text-sky-700 border-sky-200' :
                        item.kategori === 'akhwat'     ? 'bg-pink-50 text-pink-700 border-pink-200' :
                        item.kategori === 'anak_anak'  ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-slate-50 text-slate-600 border-slate-200'
                      }`}>
                        {item.kategori_label || item.kategori || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="font-medium text-slate-700">
                        {namaBulan[parseInt(item.bulan, 10)] || item.bulan}{' '}
                        {item.tahun}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap font-bold text-emerald-600">
                      {formatRupiah(item.jumlah)}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <Badge value={item.status} />
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      {item.bukti_transfer ? (
                        <button
                          onClick={() => {
                            setSelectedInfaq(item)
                            setModalBukti(true)
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold text-xs transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Lihat
                        </button>
                      ) : (
                        <span className="text-xs text-slate-300 font-medium">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        {item.status !== 'lunas' && (
                          <button
                            onClick={() =>
                              handleUpdateStatus(item.id, 'lunas')
                            }
                            title="Konfirmasi Lunas"
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-lg hover:bg-emerald-100 transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Lunas
                          </button>
                        )}
                        {item.status !== 'belum_lunas' && (
                          <button
                            onClick={() =>
                              handleUpdateStatus(item.id, 'belum_lunas')
                            }
                            title="Tandai Belum Lunas"
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/60 rounded-lg hover:bg-rose-100 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                            Batalkan
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}
      </div>

      <ModalGenerate
        isOpen={modalGenerate}
        onClose={() => setModalGenerate(false)}
        onSubmit={handleGenerate}
        loading={actionLoading}
        error={genError}
      />

      <ModalAturTarif
        isOpen={modalTarif}
        onClose={() => setModalTarif(false)}
        onSave={handleSaveTarif}
        loading={tarifLoading}
        error={tarifError}
      />

      {/* Pagination */}
      {!loading && safeInfaqList.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={totalItems}
          perPage={perPage}
        />
      )}

      <ModalBukti
        isOpen={modalBukti}
        onClose={() => setModalBukti(false)}
        infaq={selectedInfaq}
      />
    </div>
  )
}

export default ManajemenInfaq