import React, { useEffect, useState, useCallback } from 'react'
import {
  Wallet, Upload, CheckCircle, Clock,
  XCircle, RefreshCw, Eye, FileImage,
} from 'lucide-react'
import api from '@/api/axios'
import Badge from '@/components/ui/Badge'
import Alert from '@/components/ui/Alert'
import Modal from '@/components/ui/Modal'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

// ── Modal Upload Bukti Transfer ──────────────────────────
const ModalUpload = ({ isOpen, onClose, infaq, onSuccess }) => {
  const [file, setFile]             = useState(null)
  const [preview, setPreview]       = useState(null)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [dragOver, setDragOver]     = useState(false)

  // Reset state saat modal dibuka/ditutup
  useEffect(() => {
    if (!isOpen) {
      setFile(null)
      setPreview(null)
      setError('')
      setLoading(false)
    }
  }, [isOpen])

  const handleFile = (selectedFile) => {
    if (!selectedFile) return
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!allowed.includes(selectedFile.type)) {
      setError('Format file tidak valid. Gunakan JPG, PNG, atau PDF.')
      return
    }
    if (selectedFile.size > 2 * 1024 * 1024) {
      setError('Ukuran file maksimal 2MB.')
      return
    }
    setError('')
    setFile(selectedFile)

    // Preview hanya untuk gambar
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => setPreview(reader.result)
      reader.readAsDataURL(selectedFile)
    } else {
      setPreview(null)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) handleFile(dropped)
  }

  const handleSubmit = async () => {
    if (!file) { setError('Pilih file terlebih dahulu.'); return }
    setLoading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('bukti_transfer', file)
      await api.post(`/santri/infaq/${infaq.id}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      onSuccess('Bukti transfer berhasil diunggah. Menunggu verifikasi admin.')
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengunggah file.')
    } finally {
      setLoading(false)
    }
  }

  const namaBulan = [
    '', 'Januari','Februari','Maret','April','Mei','Juni',
    'Juli','Agustus','September','Oktober','November','Desember',
  ]

  const formatRupiah = (amount) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
    }).format(amount || 0)

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload Bukti Transfer" size="md">
      {infaq && (
        <div className="space-y-4">
          {/* Info tagihan */}
          <div className="bg-slate-50 rounded-xl p-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-slate-400 text-xs">Periode</p>
              <p className="font-bold text-slate-800">
                {namaBulan[infaq.bulan]} {infaq.tahun}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Jumlah</p>
              <p className="font-bold text-emerald-600">
                {formatRupiah(infaq.jumlah)}
              </p>
            </div>
          </div>

          {error && <Alert type="error" message={error} onClose={() => setError('')} />}

          {/* Dropzone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input-bukti').click()}
            className={`
              border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
              transition-all duration-200
              ${dragOver
                ? 'border-emerald-400 bg-emerald-50'
                : file
                ? 'border-emerald-300 bg-emerald-50/50'
                : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
              }
            `}
          >
            <input
              id="file-input-bukti"
              type="file"
              accept="image/jpeg,image/png,image/jpg,application/pdf"
              onChange={(e) => handleFile(e.target.files[0])}
              className="hidden"
            />

            {preview ? (
              /* Preview gambar */
              <div className="space-y-2">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-48 mx-auto rounded-lg object-contain shadow-sm"
                />
                <p className="text-xs text-emerald-600 font-semibold">{file.name}</p>
                <p className="text-xs text-slate-400">
                  {(file.size / 1024).toFixed(0)} KB — Klik untuk ganti
                </p>
              </div>
            ) : file ? (
              /* File PDF terpilih */
              <div className="space-y-2">
                <FileImage className="w-12 h-12 text-emerald-500 mx-auto" />
                <p className="text-sm font-semibold text-emerald-600">{file.name}</p>
                <p className="text-xs text-slate-400">
                  {(file.size / 1024).toFixed(0)} KB — Klik untuk ganti
                </p>
              </div>
            ) : (
              /* Empty state */
              <div className="space-y-3">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto">
                  <Upload className="w-7 h-7 text-slate-400" />
                </div>
                <div>
                  <p className="font-semibold text-slate-700 text-sm">
                    Seret & lepas file di sini
                  </p>
                  <p className="text-slate-400 text-xs mt-1">
                    atau klik untuk memilih file
                  </p>
                </div>
                <p className="text-xs text-slate-400 bg-slate-100 rounded-full px-3 py-1 inline-block">
                  JPG, PNG, PDF • Maks. 2MB
                </p>
              </div>
            )}
          </div>

          {/* Tombol aksi */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              className="btn-primary"
              disabled={loading || !file}
            >
              {loading ? (
                <><LoadingSpinner size="sm" color="white" /> Mengunggah...</>
              ) : (
                <><Upload className="w-4 h-4" /> Upload Bukti</>
              )}
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}

// ── Main Component ───────────────────────────────────────
const SantriInfaq = () => {
  const [infaqList, setInfaqList]   = useState([])
  const [ringkasan, setRingkasan]   = useState(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [success, setSuccess]       = useState('')
  const [modalUpload, setModalUpload] = useState(false)
  const [modalBukti, setModalBukti]   = useState(false)
  const [selectedInfaq, setSelectedInfaq] = useState(null)

  const namaBulan = [
    '', 'Januari','Februari','Maret','April','Mei','Juni',
    'Juli','Agustus','September','Oktober','November','Desember',
  ]

  const fetchInfaq = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/santri/infaq')
      setInfaqList(res.data.data?.infaq || [])
      setRingkasan(res.data.data?.ringkasan || null)
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data infaq.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchInfaq() }, [fetchInfaq])

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(''), 5000)
      return () => clearTimeout(t)
    }
  }, [success])

  const formatRupiah = (amount) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
    }).format(amount || 0)

  const openUpload = (infaq) => {
    setSelectedInfaq(infaq)
    setModalUpload(true)
  }

  const openBukti = (infaq) => {
    setSelectedInfaq(infaq)
    setModalBukti(true)
  }

  const handleUploadSuccess = (msg) => {
    setSuccess(msg)
    fetchInfaq()
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Infaq & Pembayaran</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Riwayat tagihan dan status pembayaran infaq
          </p>
        </div>
        <button onClick={fetchInfaq} className="btn-secondary" disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}
      {error   && <Alert type="error"   message={error}   onClose={() => setError('')} />}

      {/* Ringkasan Keuangan */}
      {ringkasan && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label:   'Total Tagihan',
              value:   formatRupiah(ringkasan.total_tagihan),
              icon:    Wallet,
              color:   'text-slate-700',
              bg:      'bg-slate-50',
              iconBg:  'bg-slate-200 text-slate-600',
            },
            {
              label:   'Sudah Lunas',
              value:   formatRupiah(ringkasan.total_lunas),
              icon:    CheckCircle,
              color:   'text-emerald-700',
              bg:      'bg-emerald-50',
              iconBg:  'bg-emerald-200 text-emerald-600',
            },
            {
              label:   'Belum Lunas',
              value:   formatRupiah(ringkasan.total_belum_lunas),
              icon:    XCircle,
              color:   'text-red-700',
              bg:      'bg-red-50',
              iconBg:  'bg-red-200 text-red-600',
            },
          ].map((item) => (
            <div key={item.label} className={`card p-5 ${item.bg} border-0`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.iconBg}`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">{item.label}</p>
                  <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info panduan */}
      <Alert
        type="info"
        message="Setelah melakukan pembayaran, upload bukti transfer untuk konfirmasi. Admin akan memverifikasi dalam 1×24 jam."
      />

      {/* List Tagihan */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-emerald-500" />
          <h3 className="font-bold text-slate-800 text-sm">
            Daftar Tagihan Infaq
          </h3>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : infaqList.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Wallet className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Belum ada tagihan infaq.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {infaqList.map((infaq) => (
              <div
                key={infaq.id}
                className={`px-5 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors ${
                  infaq.status === 'belum_lunas' ? 'bg-red-50/30' : ''
                }`}
              >
                {/* Icon status */}
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  infaq.status === 'lunas'             ? 'bg-emerald-100' :
                  infaq.status === 'proses_verifikasi' ? 'bg-amber-100'   :
                  'bg-red-100'
                }`}>
                  {infaq.status === 'lunas' && (
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  )}
                  {infaq.status === 'proses_verifikasi' && (
                    <Clock className="w-6 h-6 text-amber-600" />
                  )}
                  {infaq.status === 'belum_lunas' && (
                    <XCircle className="w-6 h-6 text-red-500" />
                  )}
                </div>

                {/* Info tagihan */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-slate-800 text-sm">
                      {namaBulan[infaq.bulan]} {infaq.tahun}
                    </p>
                    <Badge value={infaq.status} />
                  </div>
                  <p className="text-sm text-emerald-600 font-semibold mt-0.5">
                    {formatRupiah(infaq.jumlah)}
                  </p>

                  {/* Info proses verifikasi */}
                  {infaq.status === 'proses_verifikasi' && (
                    <p className="text-xs text-amber-600 mt-1">
                      ⏳ Bukti transfer sudah dikirim, menunggu konfirmasi admin.
                    </p>
                  )}
                </div>

                {/* Aksi */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {infaq.bukti_transfer && (
                    <button
                      onClick={() => openBukti(infaq)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Lihat Bukti
                    </button>
                  )}

                  {/* Upload bukti (hanya untuk yang belum lunas) */}
                  {infaq.status !== 'lunas' && (
                    <button
                      onClick={() => openUpload(infaq)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {infaq.bukti_transfer ? 'Ganti Bukti' : 'Upload Bukti'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Upload */}
      <ModalUpload
        isOpen={modalUpload}
        onClose={() => setModalUpload(false)}
        infaq={selectedInfaq}
        onSuccess={handleUploadSuccess}
      />

      {/* Modal Lihat Bukti */}
      <Modal
        isOpen={modalBukti}
        onClose={() => setModalBukti(false)}
        title="Bukti Transfer"
        size="md"
      >
        {selectedInfaq && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm bg-slate-50 rounded-xl p-4">
              <div>
                <p className="text-slate-400 text-xs">Periode</p>
                <p className="font-bold text-slate-800">
                  {namaBulan[selectedInfaq.bulan]} {selectedInfaq.tahun}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Status</p>
                <Badge value={selectedInfaq.status} />
              </div>
            </div>

            {selectedInfaq.bukti_transfer ? (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <img
                  src={selectedInfaq.bukti_transfer}
                  alt="Bukti Transfer"
                  className="w-full object-contain max-h-96"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
                <div className="hidden flex-col items-center justify-center py-8 text-slate-400 text-sm gap-2">
                  <FileImage className="w-8 h-8 opacity-50" />
                  <p>File PDF tidak dapat dipratinjau.</p>
                  <a
                    href={selectedInfaq.bukti_transfer}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 underline text-sm font-medium"
                  >
                    Buka di tab baru
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <p className="text-sm">Belum ada bukti transfer.</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default SantriInfaq