import React, { useEffect, useState, useCallback } from 'react'
import { Star, RefreshCw, TrendingUp, BookOpen } from 'lucide-react'
import api from '@/api/axios'
import Alert from '@/components/ui/Alert'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const SantriNilaiHafalan = () => {
  const [nilai, setNilai]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [page, setPage]           = useState(1)
  const [lastPage, setLastPage]   = useState(1)
  const [rataRata, setRataRata]   = useState(null)

  const fetchNilai = useCallback(async (currentPage = 1) => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/santri/nilai', {
        params: { per_page: 10, page: currentPage },
      })
      const data = res.data.data
      const list = data?.data || data || []
      setNilai(list)
      setLastPage(data?.last_page || 1)
      setPage(currentPage)

      // Hitung rata-rata nilai tajwid
      const nilaiTajwidList = list
        .filter((n) => n.nilai_tajwid != null)
        .map((n) => n.nilai_tajwid)
      if (nilaiTajwidList.length > 0) {
        const avg = nilaiTajwidList.reduce((a, b) => a + b, 0) / nilaiTajwidList.length
        setRataRata(Math.round(avg))
      } else {
        setRataRata(null)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data nilai.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchNilai(1) }, [fetchNilai])

  const getNilaiColor = (nilai) => {
    if (nilai >= 90) return { text: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Sangat Baik' }
    if (nilai >= 75) return { text: 'text-blue-600',    bg: 'bg-blue-50',    label: 'Baik' }
    if (nilai >= 60) return { text: 'text-amber-600',   bg: 'bg-amber-50',   label: 'Cukup' }
    return             { text: 'text-red-600',     bg: 'bg-red-50',     label: 'Perlu Latihan' }
  }

  const totalHafalan = nilai.filter((n) => n.hafalan_baru).length

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Nilai Hafalan</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Rekam jejak perkembangan hafalan Al-Qur'an saya
          </p>
        </div>
        <button
          onClick={() => fetchNilai(1)}
          className="btn-secondary"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Kartu Ringkasan */}
      {!loading && nilai.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Rata-rata Tajwid */}
          <div className="card p-5 text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
              rataRata != null ? getNilaiColor(rataRata).bg : 'bg-slate-50'
            }`}>
              <span className={`text-2xl font-bold ${
                rataRata != null ? getNilaiColor(rataRata).text : 'text-slate-400'
              }`}>
                {rataRata ?? '—'}
              </span>
            </div>
            <p className="font-bold text-slate-800 text-sm">Rata-rata Tajwid</p>
            {rataRata != null && (
              <p className={`text-xs mt-1 font-semibold ${getNilaiColor(rataRata).text}`}>
                {getNilaiColor(rataRata).label}
              </p>
            )}
          </div>

          {/* Total Pertemuan */}
          <div className="card p-5 text-center">
            <div className="w-16 h-16 bg-sky-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-sky-600">{nilai.length}</span>
            </div>
            <p className="font-bold text-slate-800 text-sm">Pertemuan Tercatat</p>
            <p className="text-xs text-slate-400 mt-1">Di halaman ini</p>
          </div>

          {/* Hafalan Baru */}
          <div className="card p-5 text-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-emerald-600">{totalHafalan}</span>
            </div>
            <p className="font-bold text-slate-800 text-sm">Sesi Hafalan Baru</p>
            <p className="text-xs text-slate-400 mt-1">Berhasil direkam</p>
          </div>
        </div>
      )}

      {/* Tabel / Card Nilai */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-slate-800 text-sm">Riwayat Penilaian</h3>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : nilai.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Star className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Belum ada data nilai hafalan.</p>
            <p className="text-sm mt-1">Data akan muncul setelah ustadz menginput penilaian.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="th">Tanggal</th>
                    <th className="th">Kelas</th>
                    <th className="th">Hafalan Baru</th>
                    <th className="th">Murojaah</th>
                    <th className="th text-center">Nilai Tajwid</th>
                    <th className="th">Catatan Ustadz</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {nilai.map((n) => {
                    const nilaiStyle = n.nilai_tajwid != null
                      ? getNilaiColor(n.nilai_tajwid)
                      : null
                    return (
                      <tr key={n.id} className="hover:bg-slate-50 transition-colors">
                        <td className="td whitespace-nowrap">
                          <p className="font-medium text-slate-800">
                            {new Date(n.tanggal).toLocaleDateString('id-ID', {
                              day: 'numeric', month: 'short', year: 'numeric',
                            })}
                          </p>
                          <p className="text-xs text-slate-400">
                            {new Date(n.tanggal).toLocaleDateString('id-ID', { weekday: 'long' })}
                          </p>
                        </td>
                        <td className="td">
                          <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-1 rounded-lg">
                            {n.kelas?.nama_kelas || '—'}
                          </span>
                        </td>
                        <td className="td max-w-[180px]">
                          {n.hafalan_baru ? (
                            <div className="flex items-start gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-slate-700 leading-snug" title={n.hafalan_baru}>
                                {n.hafalan_baru}
                              </p>
                            </div>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="td max-w-[180px]">
                          {n.murojaah ? (
                            <p className="text-sm text-slate-600 truncate" title={n.murojaah}>
                              {n.murojaah}
                            </p>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="td text-center">
                          {nilaiStyle ? (
                            <div className="flex flex-col items-center gap-1">
                              <span className={`inline-flex items-center justify-center w-11 h-11 rounded-full text-base font-bold ${nilaiStyle.bg} ${nilaiStyle.text}`}>
                                {n.nilai_tajwid}
                              </span>
                              <span className={`text-xs font-medium ${nilaiStyle.text}`}>
                                {nilaiStyle.label}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="td max-w-[200px]">
                          {n.catatan ? (
                            <p className="text-xs text-slate-500 italic leading-relaxed">
                              "{n.catatan}"
                            </p>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="sm:hidden divide-y divide-slate-100">
              {nilai.map((n) => {
                const nilaiStyle = n.nilai_tajwid != null
                  ? getNilaiColor(n.nilai_tajwid)
                  : null
                return (
                  <div key={n.id} className="p-4 space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">
                          {new Date(n.tanggal).toLocaleDateString('id-ID', {
                            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                          })}
                        </p>
                        <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full mt-1 inline-block">
                          {n.kelas?.nama_kelas}
                        </span>
                      </div>
                      {nilaiStyle && (
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${nilaiStyle.bg}`}>
                          <span className={`text-lg font-bold ${nilaiStyle.text}`}>
                            {n.nilai_tajwid}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Detail */}
                    {n.hafalan_baru && (
                      <div className="bg-emerald-50 rounded-lg p-3">
                        <p className="text-xs font-semibold text-emerald-600 mb-1">📖 Hafalan Baru</p>
                        <p className="text-sm text-emerald-800">{n.hafalan_baru}</p>
                      </div>
                    )}
                    {n.murojaah && (
                      <div className="bg-sky-50 rounded-lg p-3">
                        <p className="text-xs font-semibold text-sky-600 mb-1">🔄 Murojaah</p>
                        <p className="text-sm text-sky-800">{n.murojaah}</p>
                      </div>
                    )}
                    {n.catatan && (
                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-xs font-semibold text-slate-500 mb-1">💬 Catatan Ustadz</p>
                        <p className="text-sm text-slate-600 italic">"{n.catatan}"</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Pagination */}
            {lastPage > 1 && (
              <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Halaman {page} dari {lastPage}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchNilai(page - 1)}
                    disabled={page <= 1 || loading}
                    className="btn-secondary text-xs px-3 py-1.5"
                  >
                    ← Sebelumnya
                  </button>
                  <button
                    onClick={() => fetchNilai(page + 1)}
                    disabled={page >= lastPage || loading}
                    className="btn-primary text-xs px-3 py-1.5"
                  >
                    Berikutnya →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default SantriNilaiHafalan