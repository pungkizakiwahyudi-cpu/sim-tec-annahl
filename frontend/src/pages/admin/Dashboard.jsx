import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Users,
  GraduationCap,
  BookOpen,
  TrendingUp,
  CheckCircle,
  UserPlus,
  RefreshCw,
  Plus,
  ArrowRight,
  FileText,
  CreditCard,
  ClipboardList
} from 'lucide-react'
import api from '@/api/axios'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Alert from '@/components/ui/Alert'

// ── Komponen Card Statistik ────────
const ModernStatCard = ({ title, value, icon: Icon, badge, color = 'emerald' }) => {
  const bgShapes = {
    emerald: 'bg-emerald-500/10 text-emerald-600 bg-emerald-50',
    amber: 'bg-amber-500/10 text-amber-600 bg-amber-50',
    slate: 'bg-slate-300/30 text-slate-600 bg-slate-100',
    purple: 'bg-purple-500/10 text-purple-600 bg-purple-50',
    gold: 'bg-amber-500/10 text-amber-600 bg-amber-50',
    sky: 'bg-sky-500/10 text-sky-600 bg-sky-50'
  }

  const iconBg = {
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    slate: 'bg-slate-100 text-slate-600',
    purple: 'bg-purple-50 text-purple-600',
    gold: 'bg-amber-50 text-amber-600',
    sky: 'bg-sky-50 text-sky-600'
  }

  return (
    <div className="relative bg-white rounded-2xl p-5 border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div
        className={`absolute top-0 right-0 w-24 h-24 rounded-full translate-x-8 -translate-y-8 pointer-events-none ${
          bgShapes[color] || bgShapes.emerald
        }`}
      />

      <div className="flex items-center justify-between mb-3 relative z-10">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            iconBg[color] || iconBg.emerald
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>
        {badge && (
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </div>

      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider relative z-10">
        {title}
      </p>
      <h2 className="text-2xl font-extrabold text-slate-800 mt-1 relative z-10">
        {value ?? <span className="text-slate-300">—</span>}
      </h2>
    </div>
  )
}

// ── Komponen Tabel Absensi Minggu Ini ───────────────────
const AbsensiTable = ({ data }) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400 text-xs font-medium">
        Belum ada data absensi minggu ini.
      </div>
    )
  }

  const grouped = data.reduce((acc, item) => {
    if (!acc[item.tanggal]) acc[item.tanggal] = {}
    acc[item.tanggal][item.status] = item.total
    return acc
  }, {})

  const tanggalList = Object.keys(grouped).sort()

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs text-left">
        <thead>
          <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <th className="pb-3 font-bold">Tanggal</th>
            <th className="pb-3 text-center font-bold text-emerald-700">Hadir</th>
            <th className="pb-3 text-center font-bold text-amber-600">Sakit</th>
            <th className="pb-3 text-center font-bold text-sky-600">Izin</th>
            <th className="pb-3 text-center font-bold text-rose-600">Alfa</th>
            <th className="pb-3 text-center font-bold text-slate-700">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
          {tanggalList.map((tgl) => {
            const row = grouped[tgl]
            const hadir = row.hadir || 0
            const sakit = row.sakit || 0
            const izin = row.izin || 0
            const alfa = row.alfa || 0
            const total = hadir + sakit + izin + alfa

            return (
              <tr key={tgl} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3 font-bold text-slate-800">
                  {new Date(tgl).toLocaleDateString('id-ID', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  })}
                </td>
                <td className="py-3 text-center">
                  <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                    {hadir}
                  </span>
                </td>
                <td className="py-3 text-center">
                  <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                    {sakit}
                  </span>
                </td>
                <td className="py-3 text-center">
                  <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800">
                    {izin}
                  </span>
                </td>
                <td className="py-3 text-center">
                  <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                    {alfa}
                  </span>
                </td>
                <td className="py-3 text-center font-extrabold text-slate-800">
                  {total}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ── Main Dashboard Component ──────────────────────────────
const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchStats = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/admin/dashboard')
      const responseData = res.data?.data || res.data || {}
      setStats(responseData)
    } catch (err) {
      setError(
        err.response?.data?.message || 'Gagal memuat data dashboard. Pastikan database MySQL sudah aktif dan migration telah dijalankan.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount || 0)
  }

  const totalSantriAktif = stats?.total_santri_aktif ?? stats?.santri_aktif ?? 0
  const totalPendaftarBaru =
    stats?.total_pendaftar_baru ??
    stats?.pendaftar_baru ??
    stats?.pendaftaran_pending ??
    0
  const totalUstadz =
    stats?.total_ustadz ??
    stats?.jumlah_ustadz ??
    stats?.total_ustadz_aktif ??
    0
  const infaqLunas =
    stats?.total_infaq_lunas_bulan_ini ??
    stats?.infaq_lunas_bulan_ini ??
    stats?.total_infaq_bulan_ini ??
    0
  const infaqPending =
    stats?.infaq_menunggu_verifikasi ??
    stats?.menunggu_verifikasi ??
    stats?.infaq_pending_count ??
    0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <LoadingSpinner size="lg" />
          <p className="text-slate-500 text-sm font-medium">
            Memuat statistik dashboard...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ----------------- SECTION HEADER ----------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Assalamu'alaikum, berikut ringkasan statistik sistem hari ini.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={fetchStats}
            disabled={loading}
            type="button"
            className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl transition-all shadow-sm cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <Link
            to="/admin/santri"
            className="inline-flex items-center gap-2 bg-[#0B4832] hover:bg-[#083827] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Data</span>
          </Link>
        </div>
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError('')} />
      )}

      {/* ----------------- SECTION 4 STAT CARDS ----------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <ModernStatCard
          title="SANTRI AKTIF"
          value={totalSantriAktif}
          icon={Users}
          badge="↗ Active"
          color="emerald"
        />
        <ModernStatCard
          title="PENDAFTAR BARU"
          value={totalPendaftarBaru}
          icon={UserPlus}
          color="amber"
        />
        <ModernStatCard
          title="TOTAL USTADZ"
          value={totalUstadz}
          icon={GraduationCap}
          color="slate"
        />
        <ModernStatCard
          title="INFAQ LUNAS BULAN INI"
          value={formatRupiah(infaqLunas)}
          icon={TrendingUp}
          color="emerald"
        />
      </div>

      {/* ----------------- SECTION LOWER CONTENT ----------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* RECAP ABSENSI */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-800 text-base">
                  Rekap Absensi 7 Hari Terakhir
                </h3>
              </div>
            </div>

            <AbsensiTable data={stats?.absensi_minggu_ini} />
          </div>
        </div>

        {/* QUICK ACTIONS & BANNER */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 text-base mb-4">
              Quick Actions
            </h3>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <Link
                to="/admin/santri"
                className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-slate-100/80 rounded-2xl transition-all group border border-slate-100"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <UserPlus className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-700 text-center">
                  Tambah Santri
                </span>
              </Link>

              <Link
                to="/admin/infaq"
                className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-slate-100/80 rounded-2xl transition-all group border border-slate-100"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-100/80 text-amber-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <CreditCard className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-700 text-center">
                  Catat Infaq
                </span>
              </Link>

              <Link
                to="/admin/kelas"
                className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-slate-100/80 rounded-2xl transition-all group border border-slate-100"
              >
                <div className="w-9 h-9 rounded-xl bg-teal-100/80 text-teal-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <ClipboardList className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-700 text-center">
                  Input Nilai
                </span>
              </Link>

              <Link
                to="/admin/infaq"
                className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-slate-100/80 rounded-2xl transition-all group border border-slate-100"
              >
                <div className="w-9 h-9 rounded-xl bg-sky-100/80 text-sky-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-700 text-center">
                  Buat Laporan
                </span>
              </Link>
            </div>

            <div className="relative bg-[#0B4832] text-white p-4 rounded-2xl flex items-center justify-between shadow-md overflow-hidden">
              <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                <BookOpen className="w-24 h-24 -mr-4 -mb-4" />
              </div>
              <div className="relative z-10">
                <h4 className="font-bold text-sm leading-tight">
                  Generate Laporan
                </h4>
                <p className="text-[11px] text-emerald-200/80 mt-0.5">
                  Bulan Ini ({infaqPending} verifikasi pending)
                </p>
              </div>
              <Link
                to="/admin/infaq"
                className="relative z-10 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all cursor-pointer"
              >
                <ArrowRight className="w-4 h-4 text-white" />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default AdminDashboard