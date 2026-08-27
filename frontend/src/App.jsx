import React, { useEffect } from 'react'
import AppRoutes from '@/routes/AppRoutes'
import useAuthStore from '@/store/authStore'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const App = () => {
  const { checkAuth, loading } = useAuthStore()

  // Saat app pertama kali dimuat, validasi token yang tersimpan
  useEffect(() => {
    checkAuth()
  }, [])

  // Tampilkan loading fullscreen saat sedang validasi token awal
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white text-2xl font-arabic font-bold">ن</span>
          </div>
          <LoadingSpinner size="md" color="emerald" />
          <p className="text-slate-500 text-sm font-medium">Memuat SIM TEC AN-NAHL...</p>
        </div>
      </div>
    )
  }

  return <AppRoutes />
}

export default App