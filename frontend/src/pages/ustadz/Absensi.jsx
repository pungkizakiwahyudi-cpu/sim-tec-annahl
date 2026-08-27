import React, { useEffect, useState, useCallback } from 'react'
import { ClipboardList, RefreshCw, Send, CheckCircle } from 'lucide-react'
import api from '@/api/axios'
import Alert from '@/components/ui/Alert'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const UstadzAbsensi = () => {
  const [kelasList, setKelasList]   = useState([])
  const [selectedKelas, setSelectedKelas] = useState('')
  const [santriList, setSantriList] = useState([])
  const [tanggal, setTanggal]       = useState(new Date().toISOString().split('T')[0])
  const [absensiData, setAbsensiData] = useState({})
  const [existingAbsensi, setExistingAbsensi] = useState([])
  const [loading, setLoading]       = useState(false)
  const [kelasLoading, setKelasLoading] = useState(true)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError]           = useState('')
  const [success, setSuccess]       = useState('')

  const statusOptions = [
    { value: 'hadir', label: 'Hadir',  color: 'text-emerald-600' },
    { value: 'sakit', label: 'Sakit',  color: 'text-amber-600' },
    { value: 'izin',  label: 'Izin',   color: 'text-blue-600' },
    { value: 'alfa',  label: 'Alfa',   color: 'text-red-600' },
  ]

  // Fetch daftar kelas milik ustadz
  useEffect(() => {
    const fetchKelas = async () => {
      setKelasLoading(true)
      try {
        const res = await api.get('/ustadz/kelas')
        setKelasList(res.data.data || [])
        if (res.data.data?.length > 0) {
          setSelectedKelas(String(res.data.data[0].id))
        }
      } catch (err) {
        setError('Gagal memuat daftar kelas.')
      } finally {
        setKelasLoading(false)
      }
    }
    fetchKelas()
  }, [])

  // Fetch santri & absensi existing saat kelas/tanggal berubah
  const fetchSantriDanAbsensi = useCallback(async () => {
    if (!selectedKelas) return
    setLoading(true)
    setError('')
    try {
      // Fetch santri di kelas
      const santriRes = await api.get(`/ustadz/kelas/${selectedKelas}/santri`)
      const santri = santriRes.data.data?.santri || []
      setSantriList(santri)

      // Inisialisasi semua santri dengan status 'hadir'
      const init = {}
      santri.forEach((s) => { init[s.id] = 'hadir' })

      // Fetch absensi yang sudah ada untuk tanggal ini
      try {
        const absensiRes = await api.get('/ustadz/absensi', {
          params: { kelas_id: selectedKelas, tanggal },
        })
        const existing = absensiRes.data.data?.absensi || []
        setExistingAbsensi(existing)

        // Override dengan data existing jika ada
        existing.forEach((a) => { init[a.santri_id] = a.status })
      } catch {
        setExistingAbsensi([])
      }

      setAbsensiData(init)
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data santri.')
    } finally {
      setLoading(false)
    }
  }, [selectedKelas, tanggal])

  useEffect(() => { fetchSantriDanAbsensi() }, [fetchSantriDanAbsensi])

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(''), 4000)
      return () => clearTimeout(t)
    }
  }, [success])

  const handleStatusChange = (santriId, status) => {
    setAbsensiData((prev) => ({ ...prev, [santriId]: status }))
  }

  // Set semua santri ke status yang sama
  const setAllStatus = (status) => {
    const all = {}
    santriList.forEach((s) => { all[s.id] = status })
    setAbsensiData(all)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitLoading(true)
    setError('')
    try {
      const payload = {
        kelas_id: parseInt(selectedKelas),
        tanggal,
        absensi: santriList.map((s) => ({
          santri_id: s.id,
          status:    absensiData[s.id] || 'hadir',
        })),
      }
      const res = await api.post('/ustadz/absensi/bulk', payload)
      setSuccess(res.data.message)
      fetchSantriDanAbsensi()
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan absensi.')
    } finally {
      setSubmitLoading(false)
    }
  }

  // Hitung rekap sementara
  const rekap = statusOptions.reduce((acc, s) => {
    acc[s.value] = Object.values(absensiData).filter((v) => v === s.value).length
    return acc
  }, {})

  return (
    <div className="space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Input Absensi</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Catat kehadiran santri per kelas
        </p>
      </div>

      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}
      {error   && <Alert type="error"   message={error}   onClose={() => setError('')} />}

      {/* Pilih Kelas & Tanggal */}
      <div className="card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Pilih Kelas</label>
            {kelasLoading ? (
              <div className="flex items-center gap-2 py-2">
                <LoadingSpinner size="sm" />
                <span className="text-sm text-slate-400">Memuat kelas...</span>
              </div>
            ) : (
              <select
                value={selectedKelas}
                onChange={(e) => setSelectedKelas(e.target.value)}
                className="input-field"
              >
                <option value="">-- Pilih Kelas --</option>
                {kelasList.map((k) => (
                  <option key={k.id} value={String(k.id)}>
                    {k.nama_kelas} — {k.program_belajar}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="form-label">Tanggal Absensi</label>
            <input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="input-field"
            />
          </div>
        </div>
      </div>

      {/* Info absensi sudah ada */}
      {existingAbsensi.length > 0 && (
        <Alert
          type="info"
          message={`Absensi untuk tanggal ini sudah pernah diinput (${existingAbsensi.length} data). Submit akan memperbarui data yang ada.`}
        />
      )}

      {/* Form Absensi */}
      {selectedKelas && (
        <form onSubmit={handleSubmit}>
          <div className="card overflow-hidden">
            {/* Toolbar atas tabel */}
            <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-slate-800 text-sm">
                  Daftar Absensi
                  {santriList.length > 0 && (
                    <span className="text-slate-400 font-normal ml-1">
                      ({santriList.length} santri)
                    </span>
                  )}
                </h3>
              </div>

              {/* Tombol set semua */}
              {santriList.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  <span className="text-xs text-slate-400 self-center">Set semua:</span>
                  {statusOptions.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setAllStatus(s.value)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors
                        ${s.value === 'hadir' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' : ''}
                        ${s.value === 'sakit' ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100' : ''}
                        ${s.value === 'izin'  ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100' : ''}
                        ${s.value === 'alfa'  ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100' : ''}
                      `}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Loading atau tabel */}
            {loading ? (
              <div className="flex justify-center py-16">
                <LoadingSpinner size="lg" />
              </div>
            ) : santriList.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <p className="font-medium">Tidak ada santri di kelas ini.</p>
              </div>
            ) : (
              <>
                {/* Tabel desktop */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="th w-8">No</th>
                        <th className="th">Nama Santri</th>
                        <th className="th">NIS</th>
                        {statusOptions.map((s) => (
                          <th key={s.value} className={`th text-center ${s.color}`}>
                            {s.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {santriList.map((santri, idx) => (
                        <tr
                          key={santri.id}
                          className={`transition-colors ${
                            absensiData[santri.id] === 'hadir' ? 'hover:bg-emerald-50/30' :
                            absensiData[santri.id] === 'sakit' ? 'hover:bg-amber-50/30 bg-amber-50/10' :
                            absensiData[santri.id] === 'izin'  ? 'hover:bg-blue-50/30 bg-blue-50/10' :
                            absensiData[santri.id] === 'alfa'  ? 'hover:bg-red-50/30 bg-red-50/10' :
                            'hover:bg-slate-50'
                          }`}
                        >
                          <td className="td text-slate-400 text-xs text-center">{idx + 1}</td>
                          <td className="td font-semibold text-slate-800">
                            {santri.user?.name}
                          </td>
                          <td className="td text-slate-400 text-xs">{santri.nis}</td>
                          {statusOptions.map((s) => (
                            <td key={s.value} className="td text-center">
                              <input
                                type="radio"
                                name={`status_${santri.id}`}
                                value={s.value}
                                checked={absensiData[santri.id] === s.value}
                                onChange={() => handleStatusChange(santri.id, s.value)}
                                className="w-4 h-4 cursor-pointer accent-emerald-600"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Card mobile */}
                <div className="sm:hidden divide-y divide-slate-100">
                  {santriList.map((santri, idx) => (
                    <div key={santri.id} className="px-4 py-3">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">
                            {idx + 1}. {santri.user?.name}
                          </p>
                          <p className="text-xs text-slate-400">{santri.nis}</p>
                        </div>
                        <Badge value={absensiData[santri.id] || 'hadir'} />
                      </div>
                      <div className="grid grid-cols-4 gap-1">
                        {statusOptions.map((s) => (
                          <label
                            key={s.value}
                            className={`flex flex-col items-center gap-1 p-2 rounded-lg cursor-pointer border transition-colors
                              ${absensiData[santri.id] === s.value
                                ? 'border-emerald-300 bg-emerald-50'
                                : 'border-slate-200 hover:bg-slate-50'
                              }`}
                          >
                            <input
                              type="radio"
                              name={`m_status_${santri.id}`}
                              value={s.value}
                              checked={absensiData[santri.id] === s.value}
                              onChange={() => handleStatusChange(santri.id, s.value)}
                              className="sr-only"
                            />
                            <span className={`text-xs font-semibold ${s.color}`}>
                              {s.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Rekap & Submit */}
                <div className="px-5 py-4 bg-slate-50 border-t border-slate-100">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    {/* Rekap */}
                    <div className="flex flex-wrap gap-3">
                      {statusOptions.map((s) => (
                        <div key={s.value} className="flex items-center gap-1.5">
                          <span className={`text-sm font-bold ${s.color}`}>
                            {rekap[s.value]}
                          </span>
                          <span className="text-xs text-slate-500">{s.label}</span>
                        </div>
                      ))}
                    </div>

                    {/* Tombol Submit */}
                    <button
                      type="submit"
                      disabled={submitLoading || santriList.length === 0}
                      className="btn-primary"
                    >
                      {submitLoading ? (
                        <><LoadingSpinner size="sm" color="white" /> Menyimpan...</>
                      ) : (
                        <><Send className="w-4 h-4" /> Simpan Absensi</>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </form>
      )}
    </div>
  )
}

export default UstadzAbsensi