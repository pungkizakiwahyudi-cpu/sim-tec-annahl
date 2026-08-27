import React, { useEffect, useState } from 'react'
import { BookOpen, Users, RefreshCw } from 'lucide-react'
import api from '@/api/axios'
import Alert from '@/components/ui/Alert'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const UstadzKelasSaya = () => {
  const [kelasList, setKelasList] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')

  const fetchKelas = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/ustadz/kelas')
      setKelasList(res.data.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data kelas.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchKelas() }, [])

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Kelas Saya</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Daftar kelas yang Anda ampu
          </p>
        </div>
        <button onClick={fetchKelas} className="btn-secondary" disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {loading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : kelasList.length === 0 ? (
        <div className="card text-center py-16 text-slate-400">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Belum ada kelas yang ditugaskan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {kelasList.map((k) => (
            <div key={k.id} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-teal-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 text-sm truncate">{k.nama_kelas}</p>
                  <p className="text-xs text-slate-400 truncate">{k.program_belajar}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
                <Users className="w-4 h-4 text-slate-400" />
                <span>
                  <span className="font-bold text-slate-800">{k.santri?.length || 0}</span> santri aktif
                </span>
              </div>

              {/* Kategori badge */}
              <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                k.kategori === 'akhi'       ? 'bg-sky-50 text-sky-700 border-sky-200' :
                k.kategori === 'akhwat'     ? 'bg-pink-50 text-pink-700 border-pink-200' :
                k.kategori === 'anak_anak'  ? 'bg-amber-50 text-amber-700 border-amber-200' :
                'bg-slate-50 text-slate-600 border-slate-200'
              }`}>
                {k.kategori === 'akhi' ? 'Akhi' :
                 k.kategori === 'akhwat' ? 'Akhwat' :
                 k.kategori === 'anak_anak' ? 'Anak-anak' : k.kategori || '—'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default UstadzKelasSaya