import React, { useEffect, useState } from 'react'
import { BookOpen, Users, ClipboardList, Star, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '@/api/axios'
import useAuthStore from '@/store/authStore'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Alert from '@/components/ui/Alert'

const UstadzDashboard = () => {
  const { user } = useAuthStore()
  const [kelasList, setKelasList] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')

  const fetchKelasSaya = async () => {
    setLoading(true)
    setError('')
    try {
      // Mengubah endpoint ke /ustadz/kelas
      const res = await api.get('/ustadz/kelas')
      setKelasList(res.data.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data kelas.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchKelasSaya() }, [])

  // Menghitung total santri dari seluruh kelas
  const totalSantri = kelasList.reduce((sum, k) => sum + (k.santri?.length || k.jumlah_santri || 0), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex flex-col items-center gap-3">
          <LoadingSpinner size="lg" />
          <p className="text-slate-500 text-sm">Memuat data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Greeting */}
      <div className="bg-gradient-to-br from-teal-600 to-emerald-600 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-teal-100 text-sm font-medium mb-1">
              Assalamu'alaikum,
            </p>
            <h1 className="text-2xl font-bold leading-tight">
              {user?.name}
            </h1>
            <p className="text-teal-100 text-sm mt-1">
              {user?.ustadz?.bidang_ajar || 'Pengajar TEC AN-NAHL'}
            </p>
            <p className="text-white/60 text-xs font-arabic mt-2">
              جَزَاكُمُ اللهُ خَيْرًا
            </p>
          </div>
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
            <span className="text-white text-2xl font-arabic font-bold">ن</span>
          </div>
        </div>

        {/* Stat singkat */}
        <div className="grid grid-cols-2 gap-3 mt-5">
          <div className="bg-white/15 rounded-xl p-3">
            <p className="text-white/70 text-xs">Total Kelas</p>
            <p className="text-white text-2xl font-bold">
              {kelasList.length}
            </p>
          </div>
          <div className="bg-white/15 rounded-xl p-3">
            <p className="text-white/70 text-xs">Total Santri</p>
            <p className="text-white text-2xl font-bold">
              {totalSantri}
            </p>
          </div>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Daftar Kelas yang Diampu */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">Kelas yang Diampu</h2>
          <button onClick={fetchKelasSaya} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>

        {kelasList.length === 0 ? (
          <div className="card text-center py-12 text-slate-400">
            <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="font-medium">Belum ada kelas yang ditugaskan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {kelasList.map((k) => (
              <div key={k.id} className="card p-5 hover:shadow-md transition-shadow bg-white rounded-xl border border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-teal-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 text-sm truncate">
                      {k.nama_kelas}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {k.program_belajar}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>
                    <span className="font-bold text-slate-800">{k.santri?.length || k.jumlah_santri || 0}</span>
                    {' '}santri aktif
                  </span>
                </div>

                {/* Daftar santri */}
                {k.santri && k.santri.length > 0 && (
                  <div className="space-y-1.5">
                    {k.santri.slice(0, 3).map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 rounded-lg"
                      >
                        <div className="w-5 h-5 bg-emerald-200 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-emerald-700 text-xs font-bold">
                            {s.user?.name?.[0]?.toUpperCase()}
                          </span>
                        </div>
                        <span className="text-xs text-slate-600 truncate">
                          {s.user?.name}
                        </span>
                      </div>
                    ))}
                    {k.santri.length > 3 && (
                      <p className="text-xs text-slate-400 text-center pt-1">
                        +{k.santri.length - 3} santri lainnya
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Aksi cepat */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          <Link
            to="/ustadz/absensi"
            className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow hover:border-teal-200 bg-white rounded-xl border border-slate-100"
          >
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <ClipboardList className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <p className="font-bold text-slate-800">Input Absensi</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Catat kehadiran santri hari ini
              </p>
            </div>
          </Link>
          
          <Link
            to="/ustadz/nilai"
            className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow hover:border-emerald-200 bg-white rounded-xl border border-slate-100"
          >
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Star className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="font-bold text-slate-800">Input Nilai Hafalan</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Catat perkembangan hafalan santri
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default UstadzDashboard