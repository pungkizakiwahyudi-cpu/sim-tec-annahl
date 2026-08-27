import React from 'react'

const variants = {
  // Status santri
  aktif:               'bg-emerald-100 text-emerald-700 border-emerald-200',
  alumni:              'bg-slate-100 text-slate-600 border-slate-200',
  pendaftar_baru:      'bg-blue-100 text-blue-700 border-blue-200',

  // Status absensi
  hadir:               'bg-emerald-100 text-emerald-700 border-emerald-200',
  sakit:               'bg-amber-100 text-amber-700 border-amber-200',
  izin:                'bg-blue-100 text-blue-700 border-blue-200',
  alfa:                'bg-red-100 text-red-700 border-red-200',

  // Status infaq
  lunas:               'bg-emerald-100 text-emerald-700 border-emerald-200',
  proses_verifikasi:   'bg-amber-100 text-amber-700 border-amber-200',
  belum_lunas:         'bg-red-100 text-red-700 border-red-200',

  // Role
  admin:               'bg-purple-100 text-purple-700 border-purple-200',
  ustadz:              'bg-teal-100 text-teal-700 border-teal-200',
  santri:              'bg-sky-100 text-sky-700 border-sky-200',

  // Default
  default:             'bg-slate-100 text-slate-600 border-slate-200',
}

const labels = {
  aktif:               'Aktif',
  alumni:              'Alumni',
  pendaftar_baru:      'Pendaftar Baru',
  hadir:               'Hadir',
  sakit:               'Sakit',
  izin:                'Izin',
  alfa:                'Alfa',
  lunas:               'Lunas',
  proses_verifikasi:   'Proses Verifikasi',
  belum_lunas:         'Belum Lunas',
  admin:               'Admin',
  ustadz:              'Ustadz',
  santri:              'Santri',
}

const Badge = ({ value, label, className = '' }) => {
  const variantClass = variants[value] || variants.default
  const displayLabel = label || labels[value] || value

  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
        border ${variantClass} ${className}
      `}
    >
      {displayLabel}
    </span>
  )
}

export default Badge