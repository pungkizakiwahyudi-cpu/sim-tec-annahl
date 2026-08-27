import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import api from '@/api/axios'
import Sidebar from './Sidebar'
import Header from './Header'

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Tutup sidebar saat resize ke desktop (lg ke atas)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleLogout = () => {
    const token = localStorage.getItem('sim_token')

    // 1. Tembak API Logout di background (tanpa await agar UI tidak loading/stuck)
    if (token) {
      api.post('/logout', {}, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch((err) => {
        console.log('Logout API error ignored:', err)
      })
    }

    // 2. Langsung bersihkan penyimpanan browser seketika
    localStorage.removeItem('sim_token')
    localStorage.removeItem('sim_user')
    sessionStorage.clear()

    // 3. Paksa berpindah ke halaman login secara instan
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800 antialiased">
      <Sidebar
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onLogout={handleLogout}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />
        <main className="p-4 sm:p-6 lg:p-8 pt-2 lg:pt-2 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default MainLayout