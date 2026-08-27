import React, { useEffect, useState, useCallback } from 'react'
import { CalendarCheck, RefreshCw, ChevronDown, TrendingUp } from 'lucide-react'
import api from '@/api/axios'
import Badge from '@/components/ui/Badge'
import Alert from '@/components/ui/Alert'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const SantriAbsensi = () => {
  const now = new Date()
  const [absensi, setAbsensi]     = useState([])
  const [rekap, setRekap]         = useState(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [filterBulan, setFilterBulan] = useState(String(now.getMonth() + 1))
  const [filterTahun, setFilterTahun] = useState(String(now.getFullYear()))

  const namaBulan = [
    '', 'Januari','Februari','Maret','April','Mei','Juni',
    'Juli','Agustus','September','Oktober','November','Desember',
  ]

  const fetchAbsensi = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/santri/absensi', {
        params: {
          bulan: filterBulan,
          tahun: filterTahun,
        },
      })
      setAbsensi(res.data.data?.absensi || [])
      setRekap(res.data.data?.rekap || null)
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data absensi.')
    } finally {
      setLoading(false)
    }
  }, [filterBulan, filterTahun])

  useEffect(() => { fetchAbsensi() }, [fetchAbsensi])

  const getStatusIcon = (status) => {
    const icons = {
      hadir: '✅',
      sakit: '🤒',
      izin:  '📋',
      alfa:  '❌',
    }
    return icons[status] || '—'
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Absensi Saya</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Riwayat kehadiran belajar Al-Qur'an
          </p>
        </div>
        <button onClick={fetchAbsensi} className="btn-secondary" disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Filter */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <label className="form-label text-xs">Bulan</label>
            <select
              value={filterBulan}
              onChange={(e) => setFilterBulan(e.target.value)}
              className="input-field appearance-none pr-8 min-w-[140px]"
            >
              {namaBulan.slice(1).map((n, i) => (
                <option key={i + 1} value={String(i + 1)}>{n}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 bottom-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative">
            <label className="form-label text-xs">Tahun</label>
            <input
              type="number"
              value={filterTahun}
              onChange={(e) => setFilterTahun(e.target.value)}
              min="2020"
              max="2099"
              className="input-field max-w-[120px]"
            />
          </div>
        </div>
      </div>

      {/* Rekap Kehadiran */}
      {rekap && rekap.total > 0 && (
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-slate-800 text-sm">
              Rekap — {namaBulan[parseInt(filterBulan)]} {filterTahun}
            </h3>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-600 font-medium">Persentase Kehadiran</span>
              <span className="font-bold text-emerald-600">
                {rekap.persentase_kehadiran}%
              </span>
            </div>
            <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  rekap.persentase_kehadiran >= 80
                    ? 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                    : rekap.persentase_kehadiran >= 60
                    ? 'bg-gradient-to-r from-amber-400 to-amber-600'
                    : 'bg-gradient-to-r from-red-400 to-red-600'
                }`}
                style={{ width: `${rekap.persentase_kehadiran}%` }}
              />
            </div>
          </div>

          {/* Stat boxes */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Hadir', value: rekap.hadir, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Sakit', value: rekap.sakit, color: 'text-amber-600',   bg: 'bg-amber-50' },
              { label: 'Izin',  value: rekap.izin,  color: 'text-blue-600',    bg: 'bg-blue-50' },
              { label: 'Alfa',  value: rekap.alfa,  color: 'text-red-600',     bg: 'bg-red-50' },
            ].map((item) => (
              <div key={item.label} className={`${item.bg} rounded-xl p-3 text-center`}>
                <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabel Absensi */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <CalendarCheck className="w-5 h-5 text-sky-500" />
          <h3 className="font-bold text-slate-800 text-sm">
            Detail Absensi
            {absensi.length > 0 && (
              <span className="text-slate-400 font-normal ml-1">
                ({absensi.length} pertemuan)
              </span>
            )}
          </h3>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : absensi.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <CalendarCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Belum ada data absensi.</p>
            <p className="text-sm mt-1">
              Periode {namaBulan[parseInt(filterBulan)]} {filterTahun}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="th">No</th>
                    <th className="th">Tanggal</th>
                    <th className="th">Hari</th>
                    <th className="th">Kelas</th>
                    <th className="th">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {absensi.map((a, idx) => (
                    <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                      <td className="td text-slate-400 text-xs">{idx + 1}</td>
                      <td className="td font-medium">
                        {new Date(a.tanggal).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'long', year: 'numeric',
                        })}
                      </td>
                      <td className="td text-slate-500">
                        {new Date(a.tanggal).toLocaleDateString('id-ID', { weekday: 'long' })}
                      </td>
                      <td className="td">
                        <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-1 rounded-lg">
                          {a.kelas?.nama_kelas || '—'}
                        </span>
                      </td>
                      <td className="td">
                        <div className="flex items-center gap-2">
                          <span>{getStatusIcon(a.status)}</span>
                          <Badge value={a.status} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="sm:hidden divide-y divide-slate-100">
              {absensi.map((a, idx) => (
                <div key={a.id} className="px-4 py-3 flex items-center gap-3">
                  <div className="text-2xl">{getStatusIcon(a.status)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm">
                      {new Date(a.tanggal).toLocaleDateString('id-ID', {
                        weekday: 'long', day: 'numeric', month: 'long',
                      })}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {a.kelas?.nama_kelas || '—'}
                    </p>
                  </div>
                  <Badge value={a.status} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default SantriAbsensi