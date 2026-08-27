import React, { useEffect, useState } from 'react'
import {
  User, BookOpen, CalendarCheck, Star,
  Wallet, TrendingUp, RefreshCw, MapPin,
  Phone, Calendar,
} from 'lucide-react'
import api from '@/api/axios'
import useAuthStore from '@/store/authStore'
import Badge from '@/components/ui/Badge'
import Alert from '@/components/ui/Alert'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

// ── Kartu Info Profil ────────────────────────────────────
const ProfilCard = ({ santri }) => {
  if (!santri) return null

  return (
    <div className="bg-gradient-to-br from-sky-600 to-emerald-600 rounded-2xl p-6 text-white">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
          <span className="text-white text-2xl font-bold">
            {santri.user?.name?.[0]?.toUpperCase()}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold leading-tight truncate">
                {santri.user?.name}
              </h2>
              <p className="text-sky-100 text-sm mt-0.5">{santri.user?.email}</p>
            </div>
            <span className="px-2.5 py-1 bg-white/20 rounded-full text-xs font-semibold flex-shrink-0">
              {santri.nis}
            </span>
          </div>

          {/* Status */}
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge value={santri.status} />
          </div>
        </div>
      </div>

      {/* Detail info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
        <div className="bg-white/15 rounded-xl p-3 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-white/70 flex-shrink-0" />
          <p className="text-white/90 text-xs truncate">{santri.alamat}</p>
        </div>
        <div className="bg-white/15 rounded-xl p-3 flex items-center gap-2">
          <Phone className="w-4 h-4 text-white/70 flex-shrink-0" />
          <p className="text-white/90 text-xs">{santri.no_hp_orang_tua}</p>
        </div>
        <div className="bg-white/15 rounded-xl p-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-white/70 flex-shrink-0" />
          <p className="text-white/90 text-xs">
            {santri.tanggal_lahir
              ? new Date(santri.tanggal_lahir).toLocaleDateString('id-ID', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })
              : '-'}
          </p>
        </div>
      </div>

      {/* Hiasan */}
      <p className="text-white/30 text-xs font-arabic text-center mt-4 tracking-widest">
        اِقْرَأْ بِاسْمِ رَبِّكَ الَّذِيْ خَلَقَ
      </p>
    </div>
  )
}

// ── Kartu Statistik Mini ─────────────────────────────────
const MiniStatCard = ({ title, value, icon: Icon, color, href }) => {
  const colors = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    sky:     'bg-sky-50 text-sky-600 border-sky-100',
    amber:   'bg-amber-50 text-amber-600 border-amber-100',
    red:     'bg-red-50 text-red-600 border-red-100',
  }

  return (
    <a
      href={href}
      className="card p-4 hover:shadow-md transition-shadow duration-200 block"
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border flex-shrink-0 ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium">{title}</p>
          <p className="text-xl font-bold text-slate-800">{value}</p>
        </div>
      </div>
    </a>
  )
}

// ── Main Component ───────────────────────────────────────
const SantriDashboard = () => {
  const { user } = useAuthStore()

  const [profil, setProfil]         = useState(null)
  const [kelas, setKelas]           = useState([])
  const [absensiRekap, setAbsensiRekap] = useState(null)
  const [infaqRingkasan, setInfaqRingkasan] = useState(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')

  const fetchAllData = async () => {
    setLoading(true)
    setError('')
    try {
      const [profilRes, kelasRes, absensiRes, infaqRes] = await Promise.all([
        api.get('/santri/profil'),
        api.get('/santri/kelas'),
        api.get('/santri/absensi', {
          params: {
            bulan: new Date().getMonth() + 1,
            tahun: new Date().getFullYear(),
          },
        }),
        api.get('/santri/infaq'),
      ])

      setProfil(profilRes.data?.data || null)
      
      // FIX PERTAMA: Ambil array kelas dari res.data.data.kelas atau res.data.data
      const rawKelas = kelasRes.data?.data?.kelas || kelasRes.data?.data;
      setKelas(Array.isArray(rawKelas) ? rawKelas : []);

      setAbsensiRekap(absensiRes.data?.data?.rekap || null)
      setInfaqRingkasan(infaqRes.data?.data?.ringkasan || null)
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data dashboard.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAllData() }, [])

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

  const formatRupiah = (amount) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
    }).format(amount || 0)

  // Memastikan variabel kelas selalu dianggap Array
  const listKelas = Array.isArray(kelas) ? kelas : []

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard Saya</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Assalamu'alaikum, {user?.name}
          </p>
        </div>
        <button onClick={fetchAllData} className="btn-secondary" disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Kartu Profil */}
      <ProfilCard santri={profil} />

      {/* Statistik Mini */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MiniStatCard
          title="Hadir Bulan Ini"
          value={absensiRekap?.hadir ?? '—'}
          icon={CalendarCheck}
          color="emerald"
          href="/santri/absensi"
        />
        <MiniStatCard
          title="Kehadiran"
          value={`${absensiRekap?.persentase_kehadiran ?? 0}%`}
          icon={TrendingUp}
          color="sky"
          href="/santri/absensi"
        />
        <MiniStatCard
          title="Kelas Diikuti"
          value={listKelas.length}
          icon={BookOpen}
          color="amber"
          href="/santri/absensi"
        />
        <MiniStatCard
          title="Infaq Belum Lunas"
          value={formatRupiah(infaqRingkasan?.total_belum_lunas)}
          icon={Wallet}
          color="red"
          href="/santri/infaq"
        />
      </div>

      {/* Dua kolom: Kelas & Rekap Absensi */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Kelas yang Diikuti */}
        <div className="card">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-slate-800 text-sm">Kelas yang Diikuti</h3>
          </div>
          <div className="p-5">
            {listKelas.length === 0 ? (
              <div className="text-center py-6 text-slate-400">
                <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Belum terdaftar di kelas manapun.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {listKelas.map((k) => (
                  <div
                    key={k.id}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl"
                  >
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">
                        {k.nama_kelas}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {k.program_belajar}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-slate-400">Pengampu</p>
                      <p className="text-xs font-semibold text-teal-600 truncate max-w-[100px]">
                        {k.ustadz?.user?.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Rekap Absensi Bulan Ini */}
        <div className="card">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-sky-500" />
            <h3 className="font-bold text-slate-800 text-sm">
              Rekap Absensi —{' '}
              {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
            </h3>
          </div>
          <div className="p-5">
            {!absensiRekap || absensiRekap.total === 0 ? (
              <div className="text-center py-6 text-slate-400">
                <CalendarCheck className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Belum ada data absensi bulan ini.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Progress kehadiran */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold text-slate-700">Persentase Kehadiran</span>
                    <span className="font-bold text-emerald-600">
                      {absensiRekap.persentase_kehadiran}%
                    </span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-700"
                      style={{ width: `${absensiRekap.persentase_kehadiran}%` }}
                    />
                  </div>
                </div>

                {/* Detail per status */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Hadir', value: absensiRekap.hadir, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Sakit', value: absensiRekap.sakit, color: 'text-amber-600',   bg: 'bg-amber-50' },
                    { label: 'Izin',  value: absensiRekap.izin,  color: 'text-blue-600',    bg: 'bg-blue-50' },
                    { label: 'Alfa',  value: absensiRekap.alfa,  color: 'text-red-600',     bg: 'bg-red-50' },
                  ].map((item) => (
                    <div key={item.label} className={`${item.bg} rounded-xl p-3 text-center`}>
                      <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">{item.label}</p>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-slate-400 text-center">
                  Total {absensiRekap.total} pertemuan bulan ini
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ringkasan Infaq */}
      {infaqRingkasan && (
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-slate-800 text-sm">Ringkasan Infaq</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: 'Total Tagihan',
                value: formatRupiah(infaqRingkasan.total_tagihan),
                color: 'text-slate-800',
                bg: 'bg-slate-50',
              },
              {
                label: 'Sudah Lunas',
                value: formatRupiah(infaqRingkasan.total_lunas),
                color: 'text-emerald-600',
                bg: 'bg-emerald-50',
              },
              {
                label: 'Belum Lunas',
                value: formatRupiah(infaqRingkasan.total_belum_lunas),
                color: 'text-red-600',
                bg: 'bg-red-50',
              },
            ].map((item) => (
              <div key={item.label} className={`${item.bg} rounded-xl p-4 text-center`}>
                <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
                <p className="text-xs text-slate-500 mt-1">{item.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 text-center">
            <a
              href="/santri/infaq"
              className="text-xs text-emerald-600 font-semibold hover:underline"
            >
              Lihat detail & upload bukti transfer →
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

export default SantriDashboard