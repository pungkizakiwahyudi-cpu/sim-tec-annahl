import React from 'react'
import { Link } from 'react-router-dom'
import { Home, AlertTriangle } from 'lucide-react'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="w-10 h-10 text-amber-500" />
        </div>
        <h1 className="text-5xl font-extrabold text-slate-800 mb-2">404</h1>
        <h2 className="text-lg font-bold text-slate-700 mb-2">Halaman Tidak Ditemukan</h2>
        <p className="text-sm text-slate-500 mb-6">
          Halaman yang Anda cari tidak ada atau telah dipindahkan.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors"
        >
          <Home className="w-4 h-4" />
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  )
}

export default NotFound